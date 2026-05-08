"""Views de productos. Lectura publica para usuarios autenticados,
escritura solo admin cafeteria."""
from rest_framework import viewsets, permissions, filters
from .models import Category, Product
from .serializers import CategorySerializer, ProductSerializer
from users.permissions import IsCafeteriaAdmin


class ReadOnlyOrAdminPermission(permissions.BasePermission):
    """Cualquier usuario autenticado puede leer; solo admin cafeteria puede escribir."""
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user.is_cafeteria_admin


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.filter(activo=True)
    serializer_class = CategorySerializer
    permission_classes = [ReadOnlyOrAdminPermission]
    pagination_class = None  # Pocas categorias, no necesita paginacion

    def get_queryset(self):
        # Admin ve incluso las inactivas
        if self.request.user.is_authenticated and self.request.user.is_cafeteria_admin:
            return Category.objects.all()
        return Category.objects.filter(activo=True)


class ProductViewSet(viewsets.ModelViewSet):
    serializer_class = ProductSerializer
    permission_classes = [ReadOnlyOrAdminPermission]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['nombre', 'descripcion']
    ordering_fields = ['precio', 'nombre', 'creado']
    ordering = ['categoria__orden', 'nombre']

    def get_queryset(self):
        qs = Product.objects.select_related('categoria').all()

        # Si no es admin, solo productos disponibles
        user = self.request.user
        if not (user.is_authenticated and user.is_cafeteria_admin):
            qs = qs.filter(disponible=True, categoria__activo=True)

        # Filtros opcionales por query params
        categoria = self.request.query_params.get('categoria')
        if categoria:
            qs = qs.filter(categoria_id=categoria)

        saludable = self.request.query_params.get('saludable')
        if saludable in ('true', '1'):
            qs = qs.filter(es_saludable=True)

        return qs
