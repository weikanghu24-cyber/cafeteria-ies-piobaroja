"""Views de pagos: PaymentIntent y confirmacion."""
import stripe
from django.conf import settings
from django.utils import timezone
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from orders.models import Order
from notifications.models import Notification
from .models import Payment

stripe.api_key = settings.STRIPE_SECRET_KEY


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def crear_payment_intent(request):
    """
    Cliente pide crear un PaymentIntent para un pedido.
    Devuelve el client_secret para que el frontend lo use con Stripe.js.
    """
    order_id = request.data.get('order_id')
    if not order_id:
        return Response(
            {'detail': 'Falta order_id'}, status=status.HTTP_400_BAD_REQUEST
        )

    try:
        order = Order.objects.get(pk=order_id, user=request.user)
    except Order.DoesNotExist:
        return Response(
            {'detail': 'Pedido no encontrado'}, status=status.HTTP_404_NOT_FOUND
        )

    if order.estado != Order.Estado.PENDIENTE_PAGO:
        return Response(
            {'detail': 'Este pedido no esta pendiente de pago'},
            status=status.HTTP_400_BAD_REQUEST
        )

    if not settings.STRIPE_SECRET_KEY:
        return Response(
            {'detail': 'Stripe no esta configurado en el servidor'},
            status=status.HTTP_503_SERVICE_UNAVAILABLE
        )

    try:
        # Stripe trabaja en centimos
        amount_cents = int(order.total * 100)
        intent = stripe.PaymentIntent.create(
            amount=amount_cents,
            currency='eur',
            metadata={
                'order_id': str(order.id),
                'user_id': str(order.user.id),
                'codigo_recogida': order.codigo_recogida,
            },
            automatic_payment_methods={'enabled': True},
        )

        # Guardamos el intent
        order.stripe_payment_intent_id = intent.id
        order.save(update_fields=['stripe_payment_intent_id'])

        Payment.objects.create(
            order=order,
            stripe_payment_intent_id=intent.id,
            monto=order.total,
            estado=Payment.Estado.INICIADO
        )

        return Response({
            'client_secret': intent.client_secret,
            'publishable_key': settings.STRIPE_PUBLISHABLE_KEY,
            'order_id': order.id,
            'monto': str(order.total),
        })

    except stripe.error.StripeError as e:
        return Response(
            {'detail': f'Error de Stripe: {str(e)}'},
            status=status.HTTP_502_BAD_GATEWAY
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def confirmar_pago(request):
    """
    Llamado por el frontend tras stripe.confirmCardPayment para verificar
    server-side el estado del PaymentIntent y marcar el pedido como pagado.
    Este es el flujo SIMPLE sin webhooks (suficiente para prototipo).
    """
    payment_intent_id = request.data.get('payment_intent_id')
    if not payment_intent_id:
        return Response(
            {'detail': 'Falta payment_intent_id'},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        intent = stripe.PaymentIntent.retrieve(payment_intent_id)
    except stripe.error.StripeError as e:
        return Response(
            {'detail': f'Error de Stripe: {str(e)}'},
            status=status.HTTP_502_BAD_GATEWAY
        )

    order_id = intent.metadata.get('order_id')
    try:
        order = Order.objects.get(pk=order_id, user=request.user)
    except Order.DoesNotExist:
        return Response(
            {'detail': 'Pedido no encontrado'}, status=status.HTTP_404_NOT_FOUND
        )

    payment = Payment.objects.filter(
        stripe_payment_intent_id=payment_intent_id
    ).first()

    if intent.status == 'succeeded':
        if order.estado == Order.Estado.PENDIENTE_PAGO:
            order.estado = Order.Estado.PAGADO
            order.pagado_en = timezone.now()
            order.save(update_fields=['estado', 'pagado_en'])
        if payment:
            payment.estado = Payment.Estado.EXITO
            payment.save(update_fields=['estado'])

        Notification.objects.create(
            user=order.user,
            mensaje=f'Pago confirmado para pedido #{order.id}. Codigo: {order.codigo_recogida}',
            tipo='pago_exito'
        )

        from orders.serializers import OrderSerializer
        return Response({
            'pagado': True,
            'order': OrderSerializer(order).data
        })

    elif intent.status in ('requires_payment_method', 'canceled'):
        # Pago fallido o cancelado por el usuario
        if payment:
            payment.estado = Payment.Estado.FALLIDO
            error = intent.last_payment_error
            payment.error_mensaje = error.message if error else 'Pago no completado'
            payment.save()

        return Response({
            'pagado': False,
            'detail': 'El pago no se completo. Revisa los datos de tu tarjeta.',
            'stripe_status': intent.status,
        }, status=status.HTTP_402_PAYMENT_REQUIRED)

    else:
        # processing, requires_action, etc.
        return Response({
            'pagado': False,
            'detail': f'Pago en proceso (estado: {intent.status})',
            'stripe_status': intent.status,
        })


class StripeWebhookView(APIView):
    """
    Webhook opcional de Stripe (mas robusto que confirmar_pago).
    Configurar en Stripe Dashboard > Webhooks con eventos:
    - payment_intent.succeeded
    - payment_intent.payment_failed
    """
    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request):
        payload = request.body
        sig_header = request.META.get('HTTP_STRIPE_SIGNATURE', '')

        if not settings.STRIPE_WEBHOOK_SECRET:
            return Response(
                {'detail': 'Webhook no configurado'},
                status=status.HTTP_501_NOT_IMPLEMENTED
            )

        try:
            event = stripe.Webhook.construct_event(
                payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
            )
        except (ValueError, stripe.error.SignatureVerificationError):
            return Response(status=status.HTTP_400_BAD_REQUEST)

        if event['type'] == 'payment_intent.succeeded':
            self._handle_success(event['data']['object'])
        elif event['type'] == 'payment_intent.payment_failed':
            self._handle_failed(event['data']['object'])

        return Response({'received': True})

    def _handle_success(self, intent):
        order_id = intent['metadata'].get('order_id')
        if not order_id:
            return
        try:
            order = Order.objects.get(pk=order_id)
        except Order.DoesNotExist:
            return
        if order.estado == Order.Estado.PENDIENTE_PAGO:
            order.estado = Order.Estado.PAGADO
            order.pagado_en = timezone.now()
            order.save()

    def _handle_failed(self, intent):
        Payment.objects.filter(
            stripe_payment_intent_id=intent['id']
        ).update(estado=Payment.Estado.FALLIDO)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def stripe_publishable_key(request):
    """Devuelve la clave publica para inicializar Stripe.js en el frontend."""
    return Response({'publishable_key': settings.STRIPE_PUBLISHABLE_KEY})
