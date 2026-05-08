from django.contrib import admin
from .models import Notification


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ('user', 'mensaje', 'tipo', 'leida', 'creado')
    list_filter = ('tipo', 'leida')
    search_fields = ('user__username', 'mensaje')
