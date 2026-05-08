from django.contrib import admin
from .models import Payment


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ('id', 'order', 'monto', 'estado', 'creado')
    list_filter = ('estado',)
    readonly_fields = ('stripe_payment_intent_id', 'creado', 'actualizado')
    search_fields = ('stripe_payment_intent_id', 'order__codigo_recogida')
