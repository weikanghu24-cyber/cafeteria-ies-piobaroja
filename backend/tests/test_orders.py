"""Tests de pedidos - validaciones del flujo de negocio."""
import pytest
from decimal import Decimal
from datetime import date, time, timedelta
from timeslots.models import TimeSlot


@pytest.mark.django_db
class TestCrearPedido:

    def test_crear_pedido_ok(self, auth_client, producto, franja_futura):
        resp = auth_client.post('/api/orders/', {
            'franja_id': franja_futura.id,
            'items': [{'product_id': producto.id, 'cantidad': 2}],
            'notas': 'sin hielo'
        }, format='json')
        assert resp.status_code == 201, resp.content
        data = resp.json()
        assert data['estado'] == 'pendiente_pago'
        assert Decimal(data['total']) == Decimal('2.00')
        assert len(data['codigo_recogida']) == 6

    def test_pedido_descuenta_stock(self, auth_client, producto, franja_futura):
        producto.stock = 5
        producto.save()
        auth_client.post('/api/orders/', {
            'franja_id': franja_futura.id,
            'items': [{'product_id': producto.id, 'cantidad': 3}]
        }, format='json')
        producto.refresh_from_db()
        assert producto.stock == 2

    def test_pedido_franja_pasada_falla(self, auth_client, producto, franja_pasada):
        resp = auth_client.post('/api/orders/', {
            'franja_id': franja_pasada.id,
            'items': [{'product_id': producto.id, 'cantidad': 1}]
        }, format='json')
        assert resp.status_code == 400

    def test_pedido_sin_items_falla(self, auth_client, franja_futura):
        resp = auth_client.post('/api/orders/', {
            'franja_id': franja_futura.id, 'items': []
        }, format='json')
        assert resp.status_code == 400

    def test_pedido_franja_llena_falla(self, auth_client, producto, cliente_user):
        from orders.models import Order
        from django.contrib.auth import get_user_model
        User = get_user_model()
        franja = TimeSlot.objects.create(
            fecha=date.today() + timedelta(days=1),
            hora_inicio=time(11, 0), hora_fin=time(11, 30),
            capacidad_max=1, activo=True
        )
        # Llenar con un pedido previo de otro usuario
        otro = User.objects.create_user(username='otro', password='Pass1234.')
        Order.objects.create(user=otro, franja=franja, total=Decimal('1.00'))

        resp = auth_client.post('/api/orders/', {
            'franja_id': franja.id,
            'items': [{'product_id': producto.id, 'cantidad': 1}]
        }, format='json')
        assert resp.status_code == 400
        assert 'completa' in str(resp.content).lower() or 'lleno' in str(resp.content).lower()

    def test_stock_insuficiente_falla(self, auth_client, producto, franja_futura):
        producto.stock = 1
        producto.save()
        resp = auth_client.post('/api/orders/', {
            'franja_id': franja_futura.id,
            'items': [{'product_id': producto.id, 'cantidad': 5}]
        }, format='json')
        assert resp.status_code == 400


@pytest.mark.django_db
class TestPedidosListado:

    def test_cliente_solo_ve_sus_pedidos(self, auth_client, admin_user,
                                         cliente_user, franja_futura):
        from orders.models import Order
        # Pedido del admin (de OTRO usuario)
        Order.objects.create(
            user=admin_user, franja=franja_futura, total=Decimal('5.00')
        )
        # Pedido del cliente autenticado
        Order.objects.create(
            user=cliente_user, franja=franja_futura, total=Decimal('3.00')
        )
        resp = auth_client.get('/api/orders/')
        data = resp.json()
        results = data.get('results', data)
        # Debe haber exactamente 1 pedido (el del cliente, no el del admin)
        assert len(results) == 1
        assert results[0]['user_username'] == cliente_user.username


@pytest.mark.django_db
class TestAdminOrders:

    def test_cliente_no_accede_admin(self, auth_client):
        resp = auth_client.get('/api/orders/admin/')
        assert resp.status_code == 403

    def test_admin_ve_todos_los_pedidos(self, admin_client, cliente_user,
                                          franja_futura):
        from orders.models import Order
        Order.objects.create(
            user=cliente_user, franja=franja_futura, total=Decimal('3.00')
        )
        resp = admin_client.get('/api/orders/admin/')
        assert resp.status_code == 200
        data = resp.json()
        results = data.get('results', data)
        assert len(results) >= 1

    def test_admin_cambia_estado(self, admin_client, cliente_user, franja_futura):
        from orders.models import Order
        order = Order.objects.create(
            user=cliente_user, franja=franja_futura, total=Decimal('3.00'),
            estado=Order.Estado.PAGADO
        )
        resp = admin_client.post(
            f'/api/orders/admin/{order.id}/cambiar-estado/',
            {'estado': 'preparando'}, format='json'
        )
        assert resp.status_code == 200
        order.refresh_from_db()
        assert order.estado == Order.Estado.PREPARANDO

    def test_buscar_por_codigo_recogida(self, admin_client, cliente_user,
                                          franja_futura):
        from orders.models import Order
        order = Order.objects.create(
            user=cliente_user, franja=franja_futura, total=Decimal('3.00')
        )
        resp = admin_client.get(
            f'/api/orders/admin/por-codigo/{order.codigo_recogida}/'
        )
        assert resp.status_code == 200
        assert resp.json()['id'] == order.id
