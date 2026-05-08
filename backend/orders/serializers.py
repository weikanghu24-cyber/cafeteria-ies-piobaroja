"""Serializers de pedidos con todas las validaciones de negocio."""
from decimal import Decimal
from rest_framework import serializers
from django.conf import settings
from django.db import transaction
from .models import Order, OrderItem
from products.models import Product
from products.serializers import ProductSerializer
from timeslots.models import TimeSlot
from timeslots.serializers import TimeSlotSerializer


class OrderItemReadSerializer(serializers.ModelSerializer):
    """Para mostrar items con datos del producto."""
    product = ProductSerializer(read_only=True)
    subtotal = serializers.DecimalField(
        max_digits=8, decimal_places=2, read_only=True
    )

    class Meta:
        model = OrderItem
        fields = ('id', 'product', 'cantidad', 'precio_unitario', 'subtotal')


class OrderItemWriteSerializer(serializers.Serializer):
    """Para crear pedidos: solo product_id y cantidad."""
    product_id = serializers.IntegerField()
    cantidad = serializers.IntegerField(min_value=1, max_value=20)


class OrderSerializer(serializers.ModelSerializer):
    """Lectura completa de pedido."""
    items = OrderItemReadSerializer(many=True, read_only=True)
    franja = TimeSlotSerializer(read_only=True)
    user_username = serializers.CharField(source='user.username', read_only=True)
    estado_display = serializers.CharField(source='get_estado_display', read_only=True)

    class Meta:
        model = Order
        fields = (
            'id', 'user', 'user_username', 'franja', 'estado', 'estado_display',
            'codigo_recogida', 'total', 'notas', 'items',
            'pagado_en', 'creado', 'actualizado', 'entregado_en'
        )
        read_only_fields = (
            'id', 'user', 'user_username', 'codigo_recogida', 'total',
            'pagado_en', 'creado', 'actualizado', 'entregado_en'
        )


class OrderCreateSerializer(serializers.Serializer):
    """Crear un pedido: lista de items + franja horaria + notas."""
    franja_id = serializers.IntegerField()
    items = OrderItemWriteSerializer(many=True, min_length=1)
    notas = serializers.CharField(required=False, allow_blank=True, max_length=300)

    def validate_franja_id(self, value):
        try:
            franja = TimeSlot.objects.get(pk=value)
        except TimeSlot.DoesNotExist:
            raise serializers.ValidationError('Franja horaria no existe')

        antelacion = settings.PEDIDO_ANTELACION_MIN_MINUTOS
        if not franja.es_pedible(antelacion):
            if franja.lleno:
                raise serializers.ValidationError(
                    'Esta franja horaria esta completa, elige otra'
                )
            if not franja.activo:
                raise serializers.ValidationError('Esta franja no esta disponible')
            raise serializers.ValidationError(
                f'Tienes que pedir con al menos {antelacion} minutos de antelacion'
            )
        self._franja = franja
        return value

    def validate_items(self, value):
        product_ids = [item['product_id'] for item in value]
        if len(product_ids) != len(set(product_ids)):
            raise serializers.ValidationError(
                'Hay productos duplicados, agrupalos en una sola linea'
            )

        productos = Product.objects.filter(id__in=product_ids, disponible=True)
        productos_map = {p.id: p for p in productos}

        if len(productos_map) != len(product_ids):
            faltan = set(product_ids) - set(productos_map.keys())
            raise serializers.ValidationError(
                f'Productos no disponibles: {list(faltan)}'
            )

        # Validar stock
        for item in value:
            p = productos_map[item['product_id']]
            if p.stock < item['cantidad']:
                raise serializers.ValidationError(
                    f'No hay stock suficiente de "{p.nombre}" (disponible: {p.stock})'
                )

        self._productos_map = productos_map
        return value

    @transaction.atomic
    def create(self, validated_data):
        user = self.context['request'].user
        franja = self._franja
        productos_map = self._productos_map

        # Calcular total
        total = Decimal('0.00')
        for item in validated_data['items']:
            p = productos_map[item['product_id']]
            total += p.precio * item['cantidad']

        # Crear pedido
        order = Order.objects.create(
            user=user,
            franja=franja,
            total=total,
            notas=validated_data.get('notas', ''),
            estado=Order.Estado.PENDIENTE_PAGO,
        )

        # Crear items y descontar stock
        for item in validated_data['items']:
            p = productos_map[item['product_id']]
            OrderItem.objects.create(
                order=order,
                product=p,
                cantidad=item['cantidad'],
                precio_unitario=p.precio,
            )
            # Descontamos stock optimisticamente; si el pago falla se restituye
            if p.stock < 999:  # 999 = ilimitado
                p.stock = max(0, p.stock - item['cantidad'])
                p.save(update_fields=['stock'])

        return order

    def to_representation(self, instance):
        return OrderSerializer(instance, context=self.context).data


class OrderStatusUpdateSerializer(serializers.Serializer):
    """Cambio de estado del pedido por el admin."""
    estado = serializers.ChoiceField(choices=Order.Estado.choices)
