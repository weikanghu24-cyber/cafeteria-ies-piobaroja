"""Modelo Notification - notificaciones in-app."""
from django.conf import settings
from django.db import models


class Notification(models.Model):
    class Tipo(models.TextChoices):
        PEDIDO_ESTADO = 'pedido_estado', 'Estado de pedido'
        PAGO_EXITO = 'pago_exito', 'Pago confirmado'
        RECORDATORIO = 'recordatorio', 'Recordatorio'
        CIERRE_PROXIMO = 'cierre_proximo', 'Cierre proximo'
        GENERAL = 'general', 'General'

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='notificaciones'
    )
    mensaje = models.CharField(max_length=300)
    tipo = models.CharField(
        max_length=30, choices=Tipo.choices, default=Tipo.GENERAL
    )
    leida = models.BooleanField(default=False)
    creado = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Notificacion'
        verbose_name_plural = 'Notificaciones'
        ordering = ['-creado']

    def __str__(self):
        return f'{self.user.username}: {self.mensaje[:40]}'
