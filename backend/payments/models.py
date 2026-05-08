"""Modelo de Pago - registra cada intento de pago Stripe."""
from django.db import models


class Payment(models.Model):
    class Estado(models.TextChoices):
        INICIADO = 'iniciado', 'Iniciado'
        EXITO = 'exito', 'Exito'
        FALLIDO = 'fallido', 'Fallido'
        CANCELADO = 'cancelado', 'Cancelado'

    order = models.ForeignKey(
        'orders.Order', on_delete=models.CASCADE, related_name='pagos'
    )
    stripe_payment_intent_id = models.CharField(max_length=200, db_index=True)
    monto = models.DecimalField(max_digits=8, decimal_places=2)
    estado = models.CharField(
        max_length=20, choices=Estado.choices, default=Estado.INICIADO
    )
    error_mensaje = models.CharField(max_length=300, blank=True)
    creado = models.DateTimeField(auto_now_add=True)
    actualizado = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Pago'
        verbose_name_plural = 'Pagos'
        ordering = ['-creado']

    def __str__(self):
        return f'Pago {self.id} - Pedido #{self.order_id} - {self.estado}'
