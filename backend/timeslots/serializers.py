"""Serializers de franjas horarias."""
from rest_framework import serializers
from django.conf import settings
from .models import TimeSlot


class TimeSlotSerializer(serializers.ModelSerializer):
    pedidos_count = serializers.IntegerField(read_only=True)
    plazas_disponibles = serializers.IntegerField(read_only=True)
    lleno = serializers.BooleanField(read_only=True)
    pedible = serializers.SerializerMethodField()

    class Meta:
        model = TimeSlot
        fields = (
            'id', 'fecha', 'hora_inicio', 'hora_fin',
            'capacidad_max', 'pedidos_count', 'plazas_disponibles',
            'lleno', 'pedible', 'activo', 'notas'
        )

    def get_pedible(self, obj):
        return obj.es_pedible(settings.PEDIDO_ANTELACION_MIN_MINUTOS)

    def validate(self, data):
        hi = data.get('hora_inicio') or getattr(self.instance, 'hora_inicio', None)
        hf = data.get('hora_fin') or getattr(self.instance, 'hora_fin', None)
        if hi and hf and hi >= hf:
            raise serializers.ValidationError(
                {'hora_fin': 'Debe ser posterior a la hora de inicio'}
            )
        return data
