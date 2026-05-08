from django.contrib import admin
from .models import TimeSlot


@admin.register(TimeSlot)
class TimeSlotAdmin(admin.ModelAdmin):
    list_display = (
        'fecha', 'hora_inicio', 'hora_fin',
        'capacidad_max', 'pedidos_count', 'activo'
    )
    list_filter = ('fecha', 'activo')
    list_editable = ('activo',)
    date_hierarchy = 'fecha'
