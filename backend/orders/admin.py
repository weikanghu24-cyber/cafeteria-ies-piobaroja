from django.contrib import admin
from .models import Order, OrderItem


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    readonly_fields = ('subtotal',)
    extra = 0


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = (
        'id', 'user', 'codigo_recogida', 'franja',
        'estado', 'total', 'creado'
    )
    list_filter = ('estado', 'franja__fecha')
    search_fields = ('codigo_recogida', 'user__username')
    readonly_fields = ('codigo_recogida', 'creado', 'actualizado', 'pagado_en')
    inlines = [OrderItemInline]
