"""
Comando para cargar datos de ejemplo:
- 1 usuario admin de cafeteria
- 1 cliente de prueba
- 5 categorias
- ~12 productos (con imagenes Unsplash)
- 6 franjas horarias para los proximos 3 dias

Uso: python manage.py seed_data
"""
from datetime import date, time, timedelta
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.db import transaction
from products.models import Category, Product
from timeslots.models import TimeSlot

User = get_user_model()


class Command(BaseCommand):
    help = 'Carga datos de ejemplo para empezar a probar la app'

    def add_arguments(self, parser):
        parser.add_argument(
            '--reset', action='store_true',
            help='Borra los datos existentes antes de crear los nuevos'
        )

    @transaction.atomic
    def handle(self, *args, **options):
        if options['reset']:
            self.stdout.write(self.style.WARNING('Borrando datos existentes...'))
            Product.objects.all().delete()
            Category.objects.all().delete()
            TimeSlot.objects.all().delete()
            User.objects.filter(is_superuser=False).delete()

        self.stdout.write(self.style.NOTICE('=== Creando usuarios ==='))
        self._crear_usuarios()

        self.stdout.write(self.style.NOTICE('=== Creando categorias ==='))
        cats = self._crear_categorias()

        self.stdout.write(self.style.NOTICE('=== Creando productos ==='))
        self._crear_productos(cats)

        self.stdout.write(self.style.NOTICE('=== Creando franjas horarias ==='))
        self._crear_franjas()

        self.stdout.write(self.style.SUCCESS('\nDatos de ejemplo cargados correctamente.'))
        self.stdout.write('\nCredenciales de acceso:')
        self.stdout.write('  Admin Cafeteria: admin / cafeteria2024')
        self.stdout.write('  Cliente prueba:  alumno / alumno1234')

    def _crear_usuarios(self):
        # Admin cafeteria (no es superuser de Django, pero tiene rol admin)
        admin, created = User.objects.update_or_create(
            username='admin',
            defaults={
                'email': 'admin@cafeteria-ies.local',
                'first_name': 'Admin',
                'last_name': 'Cafeteria',
                'role': User.Role.ADMIN_CAFETERIA,
                'is_staff': True,
            }
        )
        if created or not admin.has_usable_password():
            admin.set_password('cafeteria2024')
            admin.save()
            self.stdout.write(f'  - Admin creado: {admin.username}')

        # Superusuario para acceder al /admin/ de Django
        if not User.objects.filter(username='superadmin').exists():
            su = User.objects.create_superuser(
                username='superadmin',
                email='superadmin@cafeteria-ies.local',
                password='superadmin1234',
                role=User.Role.ADMIN_CAFETERIA,
            )
            self.stdout.write(f'  - Superusuario creado: {su.username}')

        # Cliente de prueba
        cliente, created = User.objects.update_or_create(
            username='alumno',
            defaults={
                'email': 'alumno@ies.local',
                'first_name': 'Alumno',
                'last_name': 'Prueba',
                'role': User.Role.CLIENTE,
            }
        )
        if created:
            cliente.set_password('alumno1234')
            cliente.save()
            self.stdout.write(f'  - Cliente creado: {cliente.username}')

    def _crear_categorias(self):
        data = [
            {'nombre': 'Bocadillos', 'icono': 'sandwich', 'orden': 1,
             'descripcion': 'Bocadillos calientes y frios'},
            {'nombre': 'Bebidas', 'icono': 'cup-soda', 'orden': 2,
             'descripcion': 'Refrescos, agua y zumos'},
            {'nombre': 'Cafe', 'icono': 'coffee', 'orden': 3,
             'descripcion': 'Cafes e infusiones'},
            {'nombre': 'Dulces', 'icono': 'cookie', 'orden': 4,
             'descripcion': 'Bolleria y chocolatinas'},
            {'nombre': 'Saludable', 'icono': 'apple', 'orden': 5,
             'descripcion': 'Fruta, yogures y snacks saludables'},
        ]
        cats = {}
        for c in data:
            cat, _ = Category.objects.update_or_create(
                nombre=c['nombre'], defaults=c
            )
            cats[c['nombre']] = cat
        self.stdout.write(f'  - {len(cats)} categorias listas')
        return cats

    def _crear_productos(self, cats):
        # Imagenes Unsplash (URLs publicas, ya optimizadas)
        productos = [
            # Bocadillos
            {'nombre': 'Bocadillo de jamon serrano', 'categoria': cats['Bocadillos'],
             'precio': '3.50', 'es_saludable': False,
             'descripcion': 'Pan crujiente con jamon serrano y tomate',
             'imagen_url': 'https://images.unsplash.com/photo-1539252554935-80c8cb9bdaf2?w=600'},
            {'nombre': 'Bocadillo de tortilla', 'categoria': cats['Bocadillos'],
             'precio': '3.00', 'es_saludable': False,
             'descripcion': 'Tortilla de patatas casera en pan blanco',
             'imagen_url': 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=600'},
            {'nombre': 'Bocadillo vegetal', 'categoria': cats['Bocadillos'],
             'precio': '3.20', 'es_saludable': True,
             'descripcion': 'Lechuga, tomate, zanahoria, queso y mayonesa',
             'imagen_url': 'https://images.unsplash.com/photo-1481070555726-e2fe8357725c?w=600'},

            # Bebidas
            {'nombre': 'Agua mineral 500ml', 'categoria': cats['Bebidas'],
             'precio': '0.80', 'es_saludable': True,
             'descripcion': 'Agua mineral natural',
             'imagen_url': 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=600'},
            {'nombre': 'Refresco de cola', 'categoria': cats['Bebidas'],
             'precio': '1.50', 'es_saludable': False,
             'descripcion': 'Lata de cola 330ml',
             'imagen_url': 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=600'},
            {'nombre': 'Zumo de naranja natural', 'categoria': cats['Bebidas'],
             'precio': '1.80', 'es_saludable': True,
             'descripcion': 'Recien exprimido, sin azucar anadido',
             'imagen_url': 'https://images.unsplash.com/photo-1613478223719-2ab802602423?w=600'},

            # Cafe
            {'nombre': 'Cafe solo', 'categoria': cats['Cafe'],
             'precio': '1.10', 'es_saludable': False,
             'descripcion': 'Espresso recien hecho',
             'imagen_url': 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=600'},
            {'nombre': 'Cafe con leche', 'categoria': cats['Cafe'],
             'precio': '1.30', 'es_saludable': False,
             'descripcion': 'Cafe con leche caliente',
             'imagen_url': 'https://images.unsplash.com/photo-1497636577773-f1231844b336?w=600'},

            # Dulces
            {'nombre': 'Croissant', 'categoria': cats['Dulces'],
             'precio': '1.20', 'es_saludable': False,
             'descripcion': 'Croissant de mantequilla recien horneado',
             'imagen_url': 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=600'},
            {'nombre': 'Donut de chocolate', 'categoria': cats['Dulces'],
             'precio': '1.50', 'es_saludable': False,
             'descripcion': 'Donut glaseado con chocolate',
             'imagen_url': 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=600'},

            # Saludable
            {'nombre': 'Manzana', 'categoria': cats['Saludable'],
             'precio': '0.60', 'es_saludable': True,
             'descripcion': 'Manzana roja de la zona',
             'imagen_url': 'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=600'},
            {'nombre': 'Yogur natural', 'categoria': cats['Saludable'],
             'precio': '1.00', 'es_saludable': True,
             'descripcion': 'Yogur natural sin azucar',
             'imagen_url': 'https://images.unsplash.com/photo-1571212515416-fef01fc43637?w=600'},
            {'nombre': 'Ensalada de pasta', 'categoria': cats['Saludable'],
             'precio': '3.80', 'es_saludable': True,
             'descripcion': 'Pasta integral con verduras y atun',
             'imagen_url': 'https://images.unsplash.com/photo-1551248429-40975aa4de74?w=600'},
        ]

        for p in productos:
            Product.objects.update_or_create(
                nombre=p['nombre'],
                defaults={**p, 'disponible': True, 'stock': 999}
            )
        self.stdout.write(f'  - {len(productos)} productos listos')

    def _crear_franjas(self):
        """Crea franjas para hoy + 2 dias siguientes (3 dias)."""
        hoy = date.today()
        franjas_dia = [
            (time(9, 0), time(9, 30), 'Recreo manana'),
            (time(11, 0), time(11, 30), 'Recreo grande'),
            (time(13, 0), time(14, 0), 'Comida'),
        ]
        creadas = 0
        for delta in range(0, 3):
            f = hoy + timedelta(days=delta)
            for hi, hf, nota in franjas_dia:
                obj, created = TimeSlot.objects.update_or_create(
                    fecha=f, hora_inicio=hi, hora_fin=hf,
                    defaults={'capacidad_max': 25, 'activo': True, 'notas': nota}
                )
                if created:
                    creadas += 1
        self.stdout.write(f'  - {creadas} franjas creadas')
