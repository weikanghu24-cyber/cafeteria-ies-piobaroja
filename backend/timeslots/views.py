"""Views de franjas horarias."""
from datetime import date, timedelta
from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.conf import settings
from .models import TimeSlot
from .serializers import TimeSlotSerializer


class TimeSlotViewSet(viewsets.ModelViewSet):
    """Lectura para clientes, escritura solo para admin."""
    serializer_class = TimeSlotSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = TimeSlot.objects.all().order_by('fecha', 'hora_inicio')

        # Filtro por fecha (?fecha=YYYY-MM-DD)
        fecha = self.request.query_params.get('fecha')
        if fecha:
            qs = qs.filter(fecha=fecha)

        # Para clientes, solo activas y a futuro
        user = self.request.user
        if not user.is_cafeteria_admin:
            today = date.today()
            qs = qs.filter(activo=True, fecha__gte=today)

        return qs

    def get_permissions(self):
        if self.action in ('create', 'update', 'partial_update', 'destroy'):
            from users.permissions import IsCafeteriaAdmin
            return [IsCafeteriaAdmin()]
        return [permissions.IsAuthenticated()]

    @action(detail=False, methods=['get'], url_path='disponibles')
    def disponibles(self, request):
        """Devuelve solo franjas en las que aun se puede pedir."""
        max_dias = settings.PEDIDO_ANTELACION_MAX_DIAS
        hoy = date.today()
        hasta = hoy + timedelta(days=max_dias)

        franjas = TimeSlot.objects.filter(
            activo=True, fecha__gte=hoy, fecha__lte=hasta
        ).order_by('fecha', 'hora_inicio')

        antelacion = settings.PEDIDO_ANTELACION_MIN_MINUTOS
        # Filtramos en Python porque depende de la hora actual
        disponibles = [f for f in franjas if f.es_pedible(antelacion)]
        serializer = self.get_serializer(disponibles, many=True)
        return Response(serializer.data)
