"""Modelos de productos: categorias y productos del menu."""
from django.db import models
from django.core.validators import MinValueValidator
from decimal import Decimal


class Category(models.Model):
    """Categoria de productos: bebidas, bocadillos, dulces, etc."""
    nombre = models.CharField(max_length=80, unique=True)
    descripcion = models.CharField(max_length=200, blank=True)
    icono = models.CharField(
        max_length=40,
        blank=True,
        help_text='Nombre del icono lucide-react (ej: coffee, sandwich)'
    )
    orden = models.PositiveSmallIntegerField(
        default=0, help_text='Orden de aparicion en el menu'
    )
    activo = models.BooleanField(default=True)

    class Meta:
        verbose_name = 'Categoria'
        verbose_name_plural = 'Categorias'
        ordering = ['orden', 'nombre']

    def __str__(self):
        return self.nombre


class Product(models.Model):
    """Producto del menu de la cafeteria."""
    nombre = models.CharField(max_length=120)
    descripcion = models.TextField(blank=True)
    precio = models.DecimalField(
        max_digits=6, decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))]
    )
    categoria = models.ForeignKey(
        Category, on_delete=models.PROTECT, related_name='productos'
    )
    imagen_url = models.URLField(
        max_length=500, blank=True,
        help_text='URL de la imagen del producto (Unsplash u otra)'
    )
    disponible = models.BooleanField(default=True)
    es_saludable = models.BooleanField(
        default=False, help_text='Marcar como opcion saludable'
    )
    stock = models.PositiveIntegerField(
        default=999,
        help_text='Stock diario. 999 = ilimitado'
    )
    creado = models.DateTimeField(auto_now_add=True)
    actualizado = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Producto'
        verbose_name_plural = 'Productos'
        ordering = ['categoria__orden', 'nombre']

    def __str__(self):
        return f'{self.nombre} - {self.precio}€'
