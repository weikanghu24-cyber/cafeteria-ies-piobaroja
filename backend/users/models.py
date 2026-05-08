"""
Modelo User personalizado con roles cliente/admin.
"""
from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """Usuario extendido con rol y campos adicionales."""

    class Role(models.TextChoices):
        CLIENTE = 'cliente', 'Cliente'
        ADMIN_CAFETERIA = 'admin_cafeteria', 'Administrador Cafeteria'

    role = models.CharField(
        max_length=20,
        choices=Role.choices,
        default=Role.CLIENTE,
        verbose_name='Rol',
    )
    avatar_url = models.URLField(blank=True, null=True, verbose_name='Avatar (URL)')
    telefono = models.CharField(max_length=20, blank=True, verbose_name='Telefono')
    creado = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Usuario'
        verbose_name_plural = 'Usuarios'

    def __str__(self):
        return f'{self.username} ({self.get_role_display()})'

    @property
    def is_cafeteria_admin(self):
        """Es admin de la cafeteria (no confundir con superuser de Django)."""
        return self.role == self.Role.ADMIN_CAFETERIA or self.is_staff


class Favorite(models.Model):
    """Productos marcados como favoritos por un usuario."""
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='favoritos'
    )
    product = models.ForeignKey(
        'products.Product', on_delete=models.CASCADE, related_name='favorito_de'
    )
    creado = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'product')
        verbose_name = 'Favorito'
        verbose_name_plural = 'Favoritos'

    def __str__(self):
        return f'{self.user.username} -> {self.product.nombre}'
