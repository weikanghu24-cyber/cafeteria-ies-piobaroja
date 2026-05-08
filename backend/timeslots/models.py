"""Modelo TimeSlot - franjas horarias de recogida."""
from django.db import models
from django.core.exceptions import ValidationError
from django.utils import timezone
from datetime import datetime, timedelta


class TimeSlot(models.Model):
    """
    Franja horaria de recogida (ej: 9:00-10:15 del dia X).
    El admin las crea con antelacion, los clientes eligen entre las disponibles.
    """
    fecha = models.DateField(verbose_name='Fecha')
    hora_inicio = models.TimeField(verbose_name='Hora inicio')
    hora_fin = models.TimeField(verbose_name='Hora fin')
    capacidad_max = models.PositiveIntegerField(
        default=20,
        help_text='Numero maximo de pedidos que se pueden hacer para esta franja'
    )
    activo = models.BooleanField(default=True)
    notas = models.CharField(max_length=200, blank=True)
    creado = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Franja horaria'
        verbose_name_plural = 'Franjas horarias'
        ordering = ['fecha', 'hora_inicio']
        unique_together = ('fecha', 'hora_inicio', 'hora_fin')

    def __str__(self):
        return f'{self.fecha} {self.hora_inicio.strftime("%H:%M")}-{self.hora_fin.strftime("%H:%M")}'

    def clean(self):
        if self.hora_inicio and self.hora_fin and self.hora_inicio >= self.hora_fin:
            raise ValidationError('La hora de inicio debe ser anterior a la hora de fin.')

    @property
    def pedidos_count(self):
        """Numero de pedidos NO cancelados en esta franja."""
        return self.pedidos.exclude(estado='cancelado').count()

    @property
    def plazas_disponibles(self):
        return max(0, self.capacidad_max - self.pedidos_count)

    @property
    def lleno(self):
        return self.pedidos_count >= self.capacidad_max

    @property
    def datetime_inicio(self):
        """Combina fecha + hora_inicio en un datetime aware."""
        naive = datetime.combine(self.fecha, self.hora_inicio)
        return timezone.make_aware(naive, timezone.get_current_timezone())

    @property
    def datetime_fin(self):
        naive = datetime.combine(self.fecha, self.hora_fin)
        return timezone.make_aware(naive, timezone.get_current_timezone())

    def es_pedible(self, antelacion_minutos=15):
        """
        Comprueba si todavia se pueden hacer pedidos para esta franja:
        - debe estar activa
        - no estar llena
        - tiempo restante hasta hora_inicio >= antelacion_minutos
        """
        if not self.activo or self.lleno:
            return False
        ahora = timezone.now()
        limite = self.datetime_inicio - timedelta(minutes=antelacion_minutos)
        return ahora <= limite
