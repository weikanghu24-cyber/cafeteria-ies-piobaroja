"""Views de users (favoritos y perfil)."""
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Favorite
from .serializers import FavoriteSerializer


class FavoriteViewSet(viewsets.ModelViewSet):
    """Gestion de favoritos del usuario autenticado."""
    serializer_class = FavoriteSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Favorite.objects.filter(user=self.request.user).select_related('product')

    @action(detail=False, methods=['post'], url_path='toggle/(?P<product_id>[^/.]+)')
    def toggle(self, request, product_id=None):
        """Anade o quita un producto de favoritos en una sola llamada."""
        from products.models import Product
        try:
            product = Product.objects.get(pk=product_id)
        except Product.DoesNotExist:
            return Response(
                {'detail': 'Producto no encontrado'},
                status=status.HTTP_404_NOT_FOUND
            )

        favorite, created = Favorite.objects.get_or_create(
            user=request.user, product=product
        )
        if not created:
            favorite.delete()
            return Response({'favorito': False, 'product_id': product.id})
        return Response({'favorito': True, 'product_id': product.id})
