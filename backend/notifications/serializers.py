from rest_framework import serializers
from .models import Notification


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ('id', 'mensaje', 'tipo', 'leida', 'creado')
        read_only_fields = ('id', 'mensaje', 'tipo', 'creado')
