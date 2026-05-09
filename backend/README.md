# Cafeteria IES - Backend (Django + DRF)

API REST para la plataforma de pre-pedidos de la cafeteria del IES.

## Stack

- **Django 5** + **Django REST Framework**
- **MySQL** (no SQLite - los datos sobreviven al redeploy)
- **JWT** (djangorestframework-simplejwt) + **dj-rest-auth** + **django-allauth** para auth
- **Stripe** modo TEST para pagos
- **pytest** para tests
- Listo para deploy en **Railway** o **Render**

---

## Instalacion local (paso a paso)

### 1. Requisitos previos

- Python 3.11+
- MySQL (puedes usar XAMPP, WAMP, MySQL Workbench, o instalarlo standalone)
- Git

### 2. Clonar e instalar dependencias

```bash
cd backend
python -m venv .venv

# En Windows:
.venv\Scripts\activate
# En Mac/Linux:
source .venv/bin/activate

pip install -r requirements.txt
```

### 3. Crear la base de datos MySQL

Abre MySQL (linea de comandos, phpMyAdmin o Workbench) y ejecuta:

```sql
CREATE DATABASE cafeteria_ies CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 4. Configurar variables de entorno

Copia `.env.example` a `.env` y rellena:

```bash
# Mac/Linux:
cp .env.example .env
# Windows:
copy .env.example .env
```

Edita `.env` y pon TUS datos:

```env
SECRET_KEY=cualquier-cadena-larga-aleatoria
DEBUG=True
DATABASE_URL=mysql://USUARIO:PASSWORD@127.0.0.1:3307/cafeteria_ies
STRIPE_PUBLISHABLE_KEY=pk_test_tu_clave_aqui
STRIPE_SECRET_KEY=sk_test_tu_clave_aqui
ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173,http://localhost:5174,http://127.0.0.1:5174
GOOGLE_OAUTH_CLIENT_ID=           # opcional
GOOGLE_OAUTH_CLIENT_SECRET=       # opcional
```

> **Stripe:** consigue tus claves TEST en https://dashboard.stripe.com/test/apikeys
> No actives la cuenta (no pulses "Activate payments") - asi te ahorras dar NIF/IBAN.

> **Google OAuth (opcional):** consigue las claves en https://console.cloud.google.com → APIs y servicios → Credenciales → Crear ID de cliente OAuth 2.0 (tipo: Aplicacion web). Si las dejas vacias el login con Google no estara disponible pero el resto del proyecto funciona con normalidad.

### 5. Migraciones y datos de ejemplo

```bash
python manage.py makemigrations
python manage.py migrate
python manage.py seed_data
```

Esto crea:
- Usuario admin cafeteria: `admin` / `cafeteria2024`
- Superusuario Django: `superadmin` / `superadmin1234`
- Cliente de prueba: `alumno` / `alumno1234`
- 5 categorias y 13 productos
- Franjas horarias para hoy + 2 dias

### 6. Arrancar el servidor

```bash
python manage.py runserver
```

Servidor en http://localhost:8000

- Health check: http://localhost:8000/api/health/
- Admin Django: http://localhost:8000/admin/

---

## Tests

```bash
pytest                     # ejecuta todos los tests
pytest tests/test_orders.py  # solo tests de pedidos
pytest --cov               # con cobertura
```

---

## Endpoints principales

### Autenticacion
| Metodo | URL | Descripcion |
|--------|-----|-------------|
| POST | `/api/auth/registration/` | Registro nuevo usuario |
| POST | `/api/auth/login/` | Login - devuelve access/refresh JWT |
| POST | `/api/auth/logout/` | Logout |
| POST | `/api/auth/token/refresh/` | Refrescar access token |
| GET | `/api/auth/user/` | Datos del usuario actual |

### Productos
| Metodo | URL | Quien |
|--------|-----|-------|
| GET | `/api/products/` | Cualquiera autenticado |
| GET | `/api/products/?categoria=1&saludable=true` | Filtros |
| GET | `/api/products/?search=cafe` | Busqueda |
| POST/PATCH/DELETE | `/api/products/` | Solo admin cafeteria |
| GET | `/api/products/categories/` | Listar categorias |

### Franjas horarias
| Metodo | URL | Quien |
|--------|-----|-------|
| GET | `/api/timeslots/` | Lista todas (filtrable por ?fecha=) |
| GET | `/api/timeslots/disponibles/` | Solo las pedibles ahora mismo |
| POST | `/api/timeslots/` | Solo admin |

### Pedidos (cliente)
| Metodo | URL | Descripcion |
|--------|-----|-------------|
| GET | `/api/orders/` | Mis pedidos |
| POST | `/api/orders/` | Crear pedido |
| GET | `/api/orders/{id}/` | Detalle |
| POST | `/api/orders/{id}/cancelar/` | Cancelar (solo si pendiente_pago) |
| GET | `/api/orders/{id}/qr/` | QR del codigo de recogida |

### Pedidos (admin)
| Metodo | URL | Descripcion |
|--------|-----|-------------|
| GET | `/api/orders/admin/` | Todos los pedidos (filtros: ?estado, ?fecha, ?franja) |
| POST | `/api/orders/admin/{id}/cambiar-estado/` | Cambiar estado |
| GET | `/api/orders/admin/por-codigo/{codigo}/` | Buscar por codigo |
| GET | `/api/orders/admin/dashboard/` | Resumen del dia |

### Pagos
| Metodo | URL | Descripcion |
|--------|-----|-------------|
| GET | `/api/payments/config/` | Devuelve la publishable key |
| POST | `/api/payments/create-intent/` | Crea PaymentIntent (body: order_id) |
| POST | `/api/payments/confirm/` | Confirma pago server-side |
| POST | `/api/payments/webhook/` | Webhook Stripe (opcional) |

### Notificaciones
| Metodo | URL | Descripcion |
|--------|-----|-------------|
| GET | `/api/notifications/` | Mis notificaciones |
| GET | `/api/notifications/no-leidas-count/` | Contador para badge |
| POST | `/api/notifications/{id}/marcar-leida/` | Marcar leida |
| POST | `/api/notifications/marcar-todas-leidas/` | Todas leidas |

### Favoritos
| Metodo | URL | Descripcion |
|--------|-----|-------------|
| GET | `/api/auth/favorites/` | Mis favoritos |
| POST | `/api/auth/favorites/toggle/{product_id}/` | Anadir/quitar |

---

## Tarjetas Stripe de prueba

| Tarjeta | Resultado |
|---------|-----------|
| `4242 4242 4242 4242` | Pago aceptado |
| `4000 0000 0000 0002` | Rechazada (declined) |
| `4000 0000 0000 9995` | Fondos insuficientes |
| `4000 0000 0000 0069` | Tarjeta caducada |
| Cualquier otra | Rechazada |

CVC: cualquier 3 cifras. Fecha: cualquiera futura.

---

## Deploy en Railway

### 1. Crear el proyecto

1. Crea un proyecto nuevo en https://railway.app → **Empty Project**
2. Anade un servicio MySQL: **+ New > Database > MySQL** y espera a que arranque

### 2. Desplegar el backend

1. **+ New > GitHub Repo** > selecciona tu repo
2. Click en **Add Root Directory** > escribe `backend`
3. Railway detecta Python automaticamente gracias al `nixpacks.toml` y el `Procfile`

### 3. Variables de entorno del backend

| Variable | Valor |
|----------|-------|
| `SECRET_KEY` | cadena aleatoria larga (ej: `python -c "import secrets; print(secrets.token_urlsafe(50))"`) |
| `DEBUG` | `False` |
| `DATABASE_URL` | pega el valor de `MYSQL_PRIVATE_URL` del servicio MySQL |
| `STRIPE_PUBLISHABLE_KEY` | tu `pk_test_...` |
| `STRIPE_SECRET_KEY` | tu `sk_test_...` |
| `ALLOWED_HOSTS` | `*` (luego cambia a tu dominio exacto en produccion real) |
| `ALLOWED_ORIGINS` | URLs de los frontends separadas por coma |
| `FRONTEND_URL` | URL del frontend cliente |
| `GOOGLE_OAUTH_CLIENT_ID` | tu Client ID de Google (opcional) |
| `GOOGLE_OAUTH_CLIENT_SECRET` | tu Client Secret de Google (opcional) |
| `PEDIDO_ANTELACION_MIN_MINUTOS` | `15` |
| `PEDIDO_ANTELACION_MAX_DIAS` | `2` |

> **ALLOWED_HOSTS importante:** usa `*` para que el healthcheck de Railway funcione. En produccion real pon el dominio exacto: `tu-app.up.railway.app`

### 4. Generar URL publica

Settings > Networking > **Generate Domain** > puerto `8080`

### 5. Cargar datos de ejemplo

Una vez desplegado, instala la CLI de Railway y ejecuta desde la carpeta `backend`:

```bash
npm install -g @railway/cli
railway login
railway link   # selecciona proyecto > produccion > backend
```

Obtén la URL publica de MySQL (Railway > MySQL > Variables > `MYSQL_PUBLIC_URL`) y ejecuta:

```bash
# Activa el entorno virtual primero
.venv\Scripts\activate   # Windows
source .venv/bin/activate  # Mac/Linux

$env:DATABASE_URL = "mysql://root:PASSWORD@HOST_PUBLICO:PUERTO/railway"  # PowerShell
# o en bash:
# export DATABASE_URL="mysql://root:PASSWORD@HOST_PUBLICO:PUERTO/railway"

python manage.py seed_data
```

Esto crea los usuarios de prueba con sus contrasenas correctas.

## Deploy en Render

1. Crea cuenta en https://render.com
2. New > Blueprint > apunta a tu repo. Render leera `render.yaml` y creara la BBDD MySQL + el web service automaticamente.
3. Anade en environment las variables Stripe.

---

## ⚠️ Seguridad

- **NUNCA** subas `.env` a git. Esta en `.gitignore`.
- **Antes de subir el proyecto a GitHub**, rota tu Stripe Secret Key:
  Stripe Dashboard > Developers > API keys > Roll key
- Para produccion real:
  - Cambia `SECRET_KEY` por una aleatoria larga
  - `DEBUG=False`
  - Usa `ALLOWED_HOSTS` restringido a tu dominio
  - Configura HTTPS (Railway/Render lo dan gratis)

---

## Estructura de carpetas

```
backend/
├── core/              # settings, urls, wsgi
├── users/             # User, Favoritos, auth, permisos
│   └── management/
│       └── commands/
│           └── seed_data.py
├── products/          # Categorias y productos
├── timeslots/         # Franjas horarias
├── orders/            # Pedidos y items (vista cliente + admin)
├── payments/          # Stripe
├── notifications/     # Notificaciones in-app
├── tests/             # pytest
├── manage.py
├── requirements.txt
├── .env.example
├── Procfile
├── railway.json
├── render.yaml
└── runtime.txt
```
