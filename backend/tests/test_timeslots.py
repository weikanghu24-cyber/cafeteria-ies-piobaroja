"""Tests de franjas horarias."""
import pytest


@pytest.mark.django_db
class TestTimeSlots:

    def test_listar_disponibles(self, auth_client, franja_futura):
        resp = auth_client.get('/api/timeslots/disponibles/')
        assert resp.status_code == 200
        data = resp.json()
        assert any(f['id'] == franja_futura.id for f in data)

    def test_franja_pasada_no_disponible(self, auth_client, franja_pasada):
        resp = auth_client.get('/api/timeslots/disponibles/')
        ids = [f['id'] for f in resp.json()]
        assert franja_pasada.id not in ids

    def test_admin_crea_franja(self, admin_client):
        from datetime import date, timedelta
        resp = admin_client.post('/api/timeslots/', {
            'fecha': str(date.today() + timedelta(days=2)),
            'hora_inicio': '10:00:00',
            'hora_fin': '10:30:00',
            'capacidad_max': 30, 'activo': True
        }, format='json')
        assert resp.status_code == 201, resp.content

    def test_cliente_no_crea_franja(self, auth_client):
        from datetime import date, timedelta
        resp = auth_client.post('/api/timeslots/', {
            'fecha': str(date.today() + timedelta(days=2)),
            'hora_inicio': '10:00:00',
            'hora_fin': '10:30:00',
            'capacidad_max': 30
        }, format='json')
        assert resp.status_code == 403

    def test_hora_fin_anterior_inicio_falla(self, admin_client):
        from datetime import date, timedelta
        resp = admin_client.post('/api/timeslots/', {
            'fecha': str(date.today() + timedelta(days=2)),
            'hora_inicio': '11:00:00',
            'hora_fin': '10:00:00',
            'capacidad_max': 10
        }, format='json')
        assert resp.status_code == 400
