"""URLs de pedidos: rutas de cliente y de admin."""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import OrderViewSet, AdminOrderViewSet

router = DefaultRouter()
router.register(r'admin', AdminOrderViewSet, basename='admin-order')
router.register(r'', OrderViewSet, basename='order')

urlpatterns = [
    path('', include(router.urls)),
]
