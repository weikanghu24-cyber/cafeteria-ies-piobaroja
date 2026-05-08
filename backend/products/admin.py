from django.contrib import admin
from .models import Category, Product


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'orden', 'activo')
    list_editable = ('orden', 'activo')


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'categoria', 'precio', 'disponible', 'es_saludable', 'stock')
    list_filter = ('categoria', 'disponible', 'es_saludable')
    search_fields = ('nombre', 'descripcion')
    list_editable = ('precio', 'disponible', 'stock')
