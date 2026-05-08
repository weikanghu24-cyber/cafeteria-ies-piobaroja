"""Fixtures pytest reutilizables."""
from datetime import date, time, timedelta
from decimal import Decimal
import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from products.models import Category, Product
from timeslots.models import TimeSlot

User = get_user_model()


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def cliente_user(db):
    return User.objects.create_user(
        username='cliente1', email='cliente1@test.com',
        password='Pass1234.', role=User.Role.CLIENTE
    )


@pytest.fixture
def admin_user(db):
    return User.objects.create_user(
        username='cafe_admin', email='admin@test.com',
        password='Pass1234.', role=User.Role.ADMIN_CAFETERIA
    )


@pytest.fixture
def auth_client(cliente_user):
    """APIClient propio autenticado como cliente. NO comparte estado con admin_client."""
    client = APIClient()
    client.force_authenticate(user=cliente_user)
    return client


@pytest.fixture
def admin_client(admin_user):
    """APIClient propio autenticado como admin de cafeteria."""
    client = APIClient()
    client.force_authenticate(user=admin_user)
    return client


@pytest.fixture
def categoria(db):
    return Category.objects.create(nombre='Bebidas', orden=1)


@pytest.fixture
def producto(db, categoria):
    return Product.objects.create(
        nombre='Agua', categoria=categoria,
        precio=Decimal('1.00'), stock=10,
        imagen_url='https://example.com/agua.jpg'
    )


@pytest.fixture
def franja_futura(db):
    """Franja para manana, en la que se puede pedir."""
    return TimeSlot.objects.create(
        fecha=date.today() + timedelta(days=1),
        hora_inicio=time(11, 0),
        hora_fin=time(11, 30),
        capacidad_max=10,
        activo=True
    )


@pytest.fixture
def franja_pasada(db):
    """Franja en el pasado, no se debe poder pedir."""
    return TimeSlot.objects.create(
        fecha=date.today() - timedelta(days=1),
        hora_inicio=time(9, 0),
        hora_fin=time(9, 30),
        capacidad_max=10,
        activo=True
    )
