"""Views de pedidos: para clientes (sus propios pedidos) y admin (todos)."""
from io import BytesIO
import base64
import qrcode
from rest_framework import viewsets, permissions, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from .models import Order
from .serializers import (
    OrderSerializer, OrderCreateSerializer, OrderStatusUpdateSerializer
)
from users.permissions import IsCafeteriaAdmin


class OrderViewSet(viewsets.ModelViewSet):
    """
    Vista para CLIENTES:
    - list: SUS pedidos
    - retrieve: SU pedido por ID
    - create: nuevo pedido
    - cancel (custom): cancela un pedido pendiente_pago
    """
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['creado', 'total']
    ordering = ['-creado']

    def get_queryset(self):
        # Cada cliente ve solo SUS pedidos. El admin tiene su propio endpoint.
        return Order.objects.filter(
            user=self.request.user
        ).select_related('franja', 'user').prefetch_related('items__product')

    def get_serializer_class(self):
        if self.action == 'create':
            return OrderCreateSerializer
        return OrderSerializer

    def perform_create(self, serializer):
        serializer.save()

    @action(detail=True, methods=['post'])
    def cancelar(self, request, pk=None):
        """Cliente puede cancelar SOLO si esta en pendiente_pago."""
        order = self.get_object()
        if order.estado != Order.Estado.PENDIENTE_PAGO:
            return Response(
                {'detail': 'Solo puedes cancelar pedidos pendientes de pago'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Restituimos stock
        for item in order.items.all():
            if item.product.stock < 999:
                item.product.stock += item.cantidad
                item.product.save(update_fields=['stock'])

        order.estado = Order.Estado.CANCELADO
        order.save(update_fields=['estado'])
        return Response(OrderSerializer(order).data)

    @action(detail=True, methods=['get'])
    def qr(self, request, pk=None):
        """Genera el QR del codigo de recogida (PNG en base64)."""
        order = self.get_object()
        if order.estado not in (Order.Estado.PAGADO, Order.Estado.PREPARANDO,
                                  Order.Estado.LISTO):
            return Response(
                {'detail': 'El pedido aun no esta pagado'},
                status=status.HTTP_400_BAD_REQUEST
            )

        qr = qrcode.QRCode(box_size=10, border=2)
        qr.add_data(order.codigo_recogida)
        qr.make(fit=True)
        img = qr.make_image(fill_color='black', back_color='white')

        buffer = BytesIO()
        img.save(buffer, format='PNG')
        img_b64 = base64.b64encode(buffer.getvalue()).decode()

        return Response({
            'codigo_recogida': order.codigo_recogida,
            'qr_data_url': f'data:image/png;base64,{img_b64}'
        })


class AdminOrderViewSet(viewsets.ModelViewSet):
    """
    Vista para ADMIN cafeteria:
    - list: TODOS los pedidos (filtrables)
    - retrieve: cualquier pedido
    - cambiar_estado: cambia estado de un pedido
    - verificar_codigo: busca un pedido por su codigo de recogida
    """
    permission_classes = [IsCafeteriaAdmin]
    serializer_class = OrderSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['codigo_recogida', 'user__username', 'user__email']
    ordering_fields = ['creado', 'franja__hora_inicio']
    ordering = ['-creado']

    def get_queryset(self):
        qs = Order.objects.all().select_related(
            'franja', 'user'
        ).prefetch_related('items__product')

        # Filtros por query params
        estado = self.request.query_params.get('estado')
        if estado:
            qs = qs.filter(estado=estado)

        franja = self.request.query_params.get('franja')
        if franja:
            qs = qs.filter(franja_id=franja)

        fecha = self.request.query_params.get('fecha')
        if fecha:
            qs = qs.filter(franja__fecha=fecha)

        return qs

    @action(detail=True, methods=['post'], url_path='cambiar-estado')
    def cambiar_estado(self, request, pk=None):
        """Admin cambia el estado del pedido (preparando/listo/entregado)."""
        order = self.get_object()
        ser = OrderStatusUpdateSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        nuevo = ser.validated_data['estado']

        # Validacion logica: no se puede saltar de pendiente_pago a entregado
        order.estado = nuevo
        if nuevo == Order.Estado.ENTREGADO:
            order.entregado_en = timezone.now()

        # Si el admin cancela, restituir stock
        if nuevo == Order.Estado.CANCELADO:
            for item in order.items.all():
                if item.product.stock < 999:
                    item.product.stock += item.cantidad
                    item.product.save(update_fields=['stock'])

        order.save()

        # Crear notificacion para el usuario
        from notifications.models import Notification
        mensajes = {
            Order.Estado.PREPARANDO: f'Tu pedido #{order.id} esta en preparacion',
            Order.Estado.LISTO: f'Tu pedido #{order.id} esta LISTO para recoger',
            Order.Estado.ENTREGADO: f'Pedido #{order.id} entregado. Que aproveche!',
            Order.Estado.CANCELADO: f'Tu pedido #{order.id} ha sido cancelado',
        }
        if nuevo in mensajes:
            Notification.objects.create(
                user=order.user,
                mensaje=mensajes[nuevo],
                tipo='pedido_estado'
            )

        return Response(OrderSerializer(order).data)

    @action(detail=False, methods=['get'], url_path='por-codigo/(?P<codigo>[^/.]+)')
    def por_codigo(self, request, codigo=None):
        """Busca un pedido por su codigo de recogida."""
        try:
            order = Order.objects.get(codigo_recogida=codigo.upper())
        except Order.DoesNotExist:
            return Response(
                {'detail': 'Codigo no encontrado'},
                status=status.HTTP_404_NOT_FOUND
            )
        return Response(OrderSerializer(order).data)

    @action(detail=False, methods=['get'])
    def dashboard(self, request):
        """Resumen del dia: contadores por estado."""
        hoy = timezone.now().date()
        qs = Order.objects.filter(franja__fecha=hoy)
        data = {
            'fecha': hoy,
            'total': qs.count(),
            'pendiente_pago': qs.filter(estado='pendiente_pago').count(),
            'pagado': qs.filter(estado='pagado').count(),
            'preparando': qs.filter(estado='preparando').count(),
            'listo': qs.filter(estado='listo').count(),
            'entregado': qs.filter(estado='entregado').count(),
            'cancelado': qs.filter(estado='cancelado').count(),
        }
        return Response(data)
