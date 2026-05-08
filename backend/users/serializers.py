"""Serializers de la app users."""
from django.contrib.auth import get_user_model
from rest_framework import serializers
from dj_rest_auth.registration.serializers import RegisterSerializer as DjRegisterSerializer
from .models import Favorite

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    """Serializer para mostrar datos del usuario."""
    is_cafeteria_admin = serializers.BooleanField(read_only=True)

    class Meta:
        model = User
        fields = (
            'id', 'username', 'email', 'first_name', 'last_name',
            'role', 'avatar_url', 'telefono', 'is_cafeteria_admin', 'creado'
        )
        read_only_fields = ('id', 'role', 'is_cafeteria_admin', 'creado')


class RegisterSerializer(DjRegisterSerializer):
    """Registro estandar - siempre crea usuarios con rol cliente."""
    first_name = serializers.CharField(required=False, allow_blank=True, max_length=30)
    last_name = serializers.CharField(required=False, allow_blank=True, max_length=30)

    def get_cleaned_data(self):
        data = super().get_cleaned_data()
        data['first_name'] = self.validated_data.get('first_name', '')
        data['last_name'] = self.validated_data.get('last_name', '')
        return data

    def save(self, request):
        user = super().save(request)
        user.first_name = self.cleaned_data.get('first_name', '')
        user.last_name = self.cleaned_data.get('last_name', '')
        user.role = User.Role.CLIENTE  # Forzamos rol cliente en el registro publico
        user.save()
        return user


class FavoriteSerializer(serializers.ModelSerializer):
    """Serializer de favoritos."""
    product_data = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Favorite
        fields = ('id', 'product', 'product_data', 'creado')
        read_only_fields = ('id', 'creado')

    def get_product_data(self, obj):
        from products.serializers import ProductSerializer
        return ProductSerializer(obj.product, context=self.context).data

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)
