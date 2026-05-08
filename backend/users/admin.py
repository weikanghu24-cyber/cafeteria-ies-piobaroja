from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, Favorite


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ('username', 'email', 'role', 'is_staff', 'creado')
    list_filter = ('role', 'is_staff', 'is_superuser')
    fieldsets = UserAdmin.fieldsets + (
        ('Campos Cafeteria', {'fields': ('role', 'avatar_url', 'telefono')}),
    )


@admin.register(Favorite)
class FavoriteAdmin(admin.ModelAdmin):
    list_display = ('user', 'product', 'creado')
    list_filter = ('creado',)
