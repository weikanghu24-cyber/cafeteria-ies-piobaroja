"""Views de notificaciones."""
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Notification
from .serializers import NotificationSerializer


class NotificationViewSet(viewsets.ReadOnlyModelViewSet):
    """Solo lectura + acciones de marcado. No se crean desde la API."""
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = Notification.objects.filter(user=self.request.user)
        # Filtro por leidas/no leidas
        leida = self.request.query_params.get('leida')
        if leida == 'false':
            qs = qs.filter(leida=False)
        elif leida == 'true':
            qs = qs.filter(leida=True)
        return qs

    @action(detail=False, methods=['get'], url_path='no-leidas-count')
    def no_leidas_count(self, request):
        """Contador para el badge de la campana."""
        count = Notification.objects.filter(
            user=request.user, leida=False
        ).count()
        return Response({'count': count})

    @action(detail=True, methods=['post'], url_path='marcar-leida')
    def marcar_leida(self, request, pk=None):
        notif = self.get_object()
        notif.leida = True
        notif.save(update_fields=['leida'])
        return Response(NotificationSerializer(notif).data)

    @action(detail=False, methods=['post'], url_path='marcar-todas-leidas')
    def marcar_todas_leidas(self, request):
        n = Notification.objects.filter(
            user=request.user, leida=False
        ).update(leida=True)
        return Response({'marcadas': n})
