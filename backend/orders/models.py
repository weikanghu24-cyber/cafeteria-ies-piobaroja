"""Modelos de pedidos."""
import secrets
import string
from decimal import Decimal
from django.conf import settings
from django.db import models
from django.core.validators import MinValueValidator


def generar_codigo_recogida():
    """Codigo alfanumerico de 6 caracteres en mayusculas."""
    alphabet = string.ascii_uppercase + string.digits
    # Excluimos caracteres confusos: 0/O, 1/I/L
    alphabet = ''.join(c for c in alphabet if c not in '0O1IL')
    return ''.join(secrets.choice(alphabet) for _ in range(6))


class Order(models.Model):
    """Pedido realizado por un cliente."""

    class Estado(models.TextChoices):
        PENDIENTE_PAGO = 'pendiente_pago', 'Pendiente de pago'
        PAGADO = 'pagado', 'Pagado (en cola)'
        PREPARANDO = 'preparando', 'Preparando'
        LISTO = 'listo', 'Listo para recoger'
        ENTREGADO = 'entregado', 'Entregado'
        CANCELADO = 'cancelado', 'Cancelado'

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name='pedidos'
    )
    franja = models.ForeignKey(
        'timeslots.TimeSlot',
        on_delete=models.PROTECT,
        related_name='pedidos'
    )
    estado = models.CharField(
        max_length=20,
        choices=Estado.choices,
        default=Estado.PENDIENTE_PAGO
    )
    codigo_recogida = models.CharField(
        max_length=10,
        unique=True,
        default=generar_codigo_recogida,
        editable=False
    )
    total = models.DecimalField(
        max_digits=8, decimal_places=2,
        validators=[MinValueValidator(Decimal('0.00'))]
    )
    notas = models.CharField(max_length=300, blank=True)

    # Pago
    stripe_payment_intent_id = models.CharField(max_length=200, blank=True)
    pagado_en = models.DateTimeField(null=True, blank=True)

    # Auditoria
    creado = models.DateTimeField(auto_now_add=True)
    actualizado = models.DateTimeField(auto_now=True)
    entregado_en = models.DateTimeField(null=True, blank=True)

    class Meta:
        verbose_name = 'Pedido'
        verbose_name_plural = 'Pedidos'
        ordering = ['-creado']

    def __str__(self):
        return f'Pedido #{self.id} - {self.user.username} - {self.codigo_recogida}'

    def calcular_total(self):
        total = sum(
            (item.precio_unitario * item.cantidad for item in self.items.all()),
            Decimal('0.00')
        )
        return total

    def recalcular_total(self):
        self.total = self.calcular_total()
        self.save(update_fields=['total'])


class OrderItem(models.Model):
    """Linea de pedido: un producto y su cantidad."""
    order = models.ForeignKey(
        Order, on_delete=models.CASCADE, related_name='items'
    )
    product = models.ForeignKey(
        'products.Product', on_delete=models.PROTECT, related_name='order_items'
    )
    cantidad = models.PositiveIntegerField(default=1)
    precio_unitario = models.DecimalField(max_digits=6, decimal_places=2)

    class Meta:
        verbose_name = 'Linea de pedido'
        verbose_name_plural = 'Lineas de pedido'

    def __str__(self):
        return f'{self.cantidad}x {self.product.nombre}'

    @property
    def subtotal(self):
        return self.precio_unitario * self.cantidad
