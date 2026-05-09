"""URLs de la app users."""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import FavoriteViewSet, GoogleLoginView

router = DefaultRouter()
router.register(r'favorites', FavoriteViewSet, basename='favorite')

urlpatterns = [
    path('', include(router.urls)),
    path('google/', GoogleLoginView.as_view(), name='google-login'),
]
