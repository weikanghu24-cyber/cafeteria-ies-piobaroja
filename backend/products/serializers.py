"""Serializers de productos."""
from rest_framework import serializers
from .models import Category, Product


class CategorySerializer(serializers.ModelSerializer):
    productos_count = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = (
            'id', 'nombre', 'descripcion', 'icono',
            'orden', 'activo', 'productos_count'
        )

    def get_productos_count(self, obj):
        return obj.productos.filter(disponible=True).count()


class ProductSerializer(serializers.ModelSerializer):
    """Lectura de producto con datos de categoria embebidos."""
    categoria_nombre = serializers.CharField(source='categoria.nombre', read_only=True)
    es_favorito = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = (
            'id', 'nombre', 'descripcion', 'precio',
            'categoria', 'categoria_nombre', 'imagen_url',
            'disponible', 'es_saludable', 'stock',
            'es_favorito', 'creado', 'actualizado'
        )
        read_only_fields = ('id', 'creado', 'actualizado', 'es_favorito')

    def get_es_favorito(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return False
        return obj.favorito_de.filter(user=request.user).exists()
