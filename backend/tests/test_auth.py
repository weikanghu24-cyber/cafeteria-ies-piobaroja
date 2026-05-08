"""Tests de autenticacion: registro, login, refresh."""
import pytest
from django.contrib.auth import get_user_model

User = get_user_model()


@pytest.mark.django_db
class TestAuth:

    def test_registro_crea_usuario_con_rol_cliente(self, api_client):
        resp = api_client.post('/api/auth/registration/', {
            'username': 'nuevo',
            'email': 'nuevo@test.com',
            'password1': 'Sup3rSecret!',
            'password2': 'Sup3rSecret!',
            'first_name': 'Nuevo',
            'last_name': 'Usuario',
        }, format='json')
        assert resp.status_code in (200, 201), resp.content
        u = User.objects.get(username='nuevo')
        assert u.role == User.Role.CLIENTE

    def test_login_devuelve_tokens(self, api_client, cliente_user):
        resp = api_client.post('/api/auth/login/', {
            'username': 'cliente1',
            'password': 'Pass1234.',
        }, format='json')
        assert resp.status_code == 200, resp.content
        data = resp.json()
        assert 'access' in data
        assert 'refresh' in data

    def test_login_password_invalido(self, api_client, cliente_user):
        resp = api_client.post('/api/auth/login/', {
            'username': 'cliente1',
            'password': 'mal',
        }, format='json')
        assert resp.status_code == 400

    def test_endpoint_protegido_sin_token(self, api_client):
        resp = api_client.get('/api/orders/')
        assert resp.status_code == 401

    def test_endpoint_protegido_con_token(self, auth_client):
        resp = auth_client.get('/api/orders/')
        assert resp.status_code == 200
