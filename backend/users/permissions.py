"""Permisos personalizados para la API."""
from rest_framework.permissions import BasePermission


class IsCafeteriaAdmin(BasePermission):
    """Solo administradores de cafeteria pueden acceder."""
    message = 'Solo el personal de cafeteria puede realizar esta accion.'

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.is_cafeteria_admin
        )


class IsOwnerOrCafeteriaAdmin(BasePermission):
    """El propietario del recurso o un admin de cafeteria."""

    def has_object_permission(self, request, view, obj):
        if not request.user.is_authenticated:
            return False
        if request.user.is_cafeteria_admin:
            return True
        # Para objetos con campo 'user'
        return getattr(obj, 'user', None) == request.user
