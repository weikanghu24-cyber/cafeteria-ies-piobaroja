"""Tests de productos."""
import pytest
from decimal import Decimal


@pytest.mark.django_db
class TestProductos:

    def test_listar_productos_anonimo_falla(self, api_client, producto):
        resp = api_client.get('/api/products/')
        assert resp.status_code == 401

    def test_listar_productos_cliente(self, auth_client, producto):
        resp = auth_client.get('/api/products/')
        assert resp.status_code == 200
        data = resp.json()
        results = data.get('results', data)
        assert any(p['nombre'] == 'Agua' for p in results)

    def test_cliente_no_puede_crear_producto(self, auth_client, categoria):
        resp = auth_client.post('/api/products/', {
            'nombre': 'Hack', 'categoria': categoria.id, 'precio': '0.01'
        }, format='json')
        assert resp.status_code == 403

    def test_admin_crea_producto(self, admin_client, categoria):
        resp = admin_client.post('/api/products/', {
            'nombre': 'Cafe', 'categoria': categoria.id,
            'precio': '1.20', 'imagen_url': 'https://x.com/c.jpg',
            'disponible': True, 'es_saludable': False, 'stock': 50
        }, format='json')
        assert resp.status_code == 201, resp.content

    def test_filtro_saludable(self, auth_client, categoria, producto):
        from products.models import Product
        Product.objects.create(
            nombre='Manzana', categoria=categoria,
            precio=Decimal('0.50'), es_saludable=True
        )
        resp = auth_client.get('/api/products/?saludable=true')
        results = resp.json().get('results', resp.json())
        nombres = [p['nombre'] for p in results]
        assert 'Manzana' in nombres
        assert 'Agua' not in nombres
