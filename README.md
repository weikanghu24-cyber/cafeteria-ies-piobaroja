# 🍴 Cafetería IES Pío Baroja

> Plataforma de pre-pedidos para la cafetería del IES Pío Baroja. Los alumnos hacen sus pedidos desde su móvil y los recogen sin colas durante el recreo.

[![Django](https://img.shields.io/badge/Django-5.0-092E20?logo=django)](https://www.djangoproject.com/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite)](https://vitejs.dev/)
[![Tailwind](https://img.shields.io/badge/Tailwind-3-06B6D4?logo=tailwindcss)](https://tailwindcss.com/)

---

## 📋 Tabla de contenidos

1. [Estructura del proyecto](#-estructura-del-proyecto)
2. [Stack tecnológico](#-stack-tecnológico)
3. [Instalación local](#-instalación-local)
4. [Cuentas de prueba](#-cuentas-de-prueba)
5. [Flujo de uso](#-flujo-de-uso)
6. [Despliegue en Railway](#-despliegue-en-railway)
7. [Variables de entorno](#-variables-de-entorno)
8. [Tests](#-tests)

---

## 📂 Estructura del proyecto

Este es un **monorepo** que contiene tres aplicaciones independientes:

```
cafeteria-ies-piobaroja/
├── backend/              ← API REST con Django + DRF
├── frontend-cliente/     ← App cliente (alumnos) en React
├── frontend-admin/       ← Panel admin (cafetería) en React
├── README.md             ← Este archivo
└── .gitignore            ← Ignora node_modules, .env, etc.
```

Cada carpeta tiene su propio `README.md` con detalles específicos:

- 📘 [`backend/README.md`](./backend/README.md) — endpoints, modelos, comandos Django
- 📗 [`frontend-cliente/README.md`](./frontend-cliente/README.md) — diseño, rutas, componentes del cliente
- 📙 [`frontend-admin/README.md`](./frontend-admin/README.md) — funcionalidades del panel admin

---

## 🛠 Stack tecnológico

### Backend
- **Django 5.0** + **Django REST Framework** (API REST)
- **MySQL** (base de datos)
- **JWT** (autenticación con `djangorestframework-simplejwt` + `dj-rest-auth`)
- **Stripe** (pagos en modo TEST)
- **qrcode + Pillow** (generación de QR para recogida)
- **pytest-django** (26 tests automatizados)

### Frontend Cliente y Admin
- **React 18** + **Vite 5**
- **Tailwind CSS** (mismo tema en ambos: paleta café + crema + acento naranja)
- **React Router 6**
- **Zustand** (estado global con persistencia)
- **TanStack Query** (fetching, cache, polling)
- **Axios** (con interceptors JWT y refresh automático)
- **Stripe Elements** (cliente, para el pago)
- **Framer Motion** + **Lucide React**
- Tipografías: **Fraunces** (display) + **Manrope** (body)

---

## ⚡ Instalación local

Para arrancar todo el sistema necesitas tener corriendo las **tres partes**:

### 1️⃣ Backend (puerto 8000)

```bash
cd backend

# Crear entorno virtual
python -m venv .venv

# Activar (Mac/Linux)
source .venv/bin/activate
# Activar (Windows)
.venv\Scripts\activate

# Instalar dependencias
pip install -r requirements.txt

# Crear BBDD MySQL
# (ejecuta en MySQL Workbench, XAMPP o tu cliente)
# CREATE DATABASE cafeteria_ies CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# Configurar variables
# Mac/Linux:
cp .env.example .env
# Windows:
copy .env.example .env
# Edita .env con tu DATABASE_URL y claves Stripe

# Migrar y cargar datos de ejemplo
python manage.py migrate
python manage.py seed_data

# Arrancar
python manage.py runserver
```

✅ API en http://localhost:8000

### 2️⃣ Frontend Cliente (puerto 5173)

En otra terminal:

```bash
cd frontend-cliente

npm install

# Mac/Linux:
cp .env.example .env
# Windows:
copy .env.example .env

npm run dev
```

✅ App cliente en http://localhost:5173

### 3️⃣ Admin Frontend (puerto 5174)

En otra terminal:

```bash
cd frontend-admin

npm install

# Mac/Linux:
cp .env.example .env
# Windows:
copy .env.example .env

npm run dev
```

✅ Panel admin en http://localhost:5174

---

## 🔐 Cuentas de prueba

El comando `seed_data` precarga estas cuentas:

| Rol | Usuario | Contraseña | Acceso |
|-----|---------|------------|--------|
| 👤 Cliente (alumno) | `alumno` | `alumno1234` | http://localhost:5173 |
| 👨‍🍳 Admin cafetería | `admin` | `cafeteria2024` | http://localhost:5174 |
| 🛡️ Superadmin Django | `superadmin` | `superadmin1234` | http://localhost:8000/admin/ |

**Tarjeta Stripe TEST para probar pagos:**
- Número: `4242 4242 4242 4242`
- CVC: cualquier 3 dígitos
- Fecha: cualquier fecha futura

---

## ✅ Funcionalidades implementadas

### Cliente (alumno)
- ✅ Registro y login con JWT
- ✅ Catálogo con filtros (categoría, saludable, búsqueda)
- ✅ Favoritos (toggle desde cualquier producto)
- ✅ Carrito persistente (sobrevive al recargar)
- ✅ Checkout en 2 pasos: franja horaria + pago Stripe
- ✅ Código de recogida + QR generado
- ✅ Historial de pedidos con estados
- ✅ Cancelación antes de pagar
- ✅ Notificaciones in-app con contador
- ✅ Diseño mobile-first con bottom nav
- ✅ Animaciones Framer Motion en transiciones

### Admin (personal de cafetería)
- ✅ Dashboard con contadores live (refresco cada 30s)
- ✅ Lista de pedidos en tiempo real (polling cada 10s)
- ✅ Cambio de estado: pagado → preparando → listo → entregado
- ✅ Verificador de código de recogida (input grande, auto-focus)
- ✅ CRUD de productos con preview de imagen
- ✅ CRUD de franjas horarias con visualización de ocupación
- ✅ Sidebar de navegación con badge "live"
- ✅ Filtros por estado en tabla de pedidos

### Backend (API)
- ✅ Django 5 + DRF
- ✅ MySQL con dj-database-url
- ✅ JWT con refresh automático
- ✅ 26 tests pytest, todos pasan
- ✅ Stripe TEST integrado (PaymentIntent + webhook)
- ✅ Generación de QR en código de recogida
- ✅ Permisos cliente / admin separados
- ✅ Validación de capacidad y antelación en franjas
- ✅ Listo para Railway (Procfile, railway.json)

---

## 🔄 Flujo de uso

### Como alumno (cliente)

1. Entras en http://localhost:5173 y te registras o haces login con `alumno`
2. Exploras el menú, filtras por categoría o "saludable"
3. Añades productos al carrito
4. En el checkout eliges una franja horaria
5. Pagas con tarjeta TEST de Stripe
6. Recibes un código de recogida (ej: `K7M3X9`) con QR

### Como personal de cafetería (admin)

1. Entras en http://localhost:5174 con `admin / cafeteria2024`
2. Ves el dashboard con pedidos del día
3. En **Pedidos**, vas marcando como "preparando" → "listo"
4. Cuando un alumno viene a recoger, vas a **Verificar código** e introduces su código
5. El sistema te muestra el pedido y confirmas la entrega de un click

---

## 🚀 Despliegue en Railway

[Railway](https://railway.app) permite desplegar las 3 partes desde el mismo repo.

### Backend en Railway

1. Crea un nuevo proyecto en Railway y conéctalo a tu repo de GitHub.
2. En "Settings" → "Root Directory", pon `backend`.
3. Añade un servicio de **MySQL** (Railway lo proporciona).
4. En las variables de entorno del backend:
   ```
   DJANGO_SECRET_KEY=<genera_uno_seguro>
   DEBUG=False
   ALLOWED_HOSTS=tu-app.up.railway.app
   DATABASE_URL=${{ MySQL.DATABASE_URL }}
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_PUBLISHABLE_KEY=pk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   ALLOWED_ORIGINS=https://tu-frontend.vercel.app,https://tu-admin.vercel.app
   ```
5. Railway ejecutará automáticamente `gunicorn core.wsgi` (definido en `Procfile`).

### Frontend Cliente en Vercel/Netlify

1. Conecta el repo a Vercel o Netlify.
2. Configura:
   - **Root directory**: `frontend-cliente`
   - **Build command**: `npm run build`
   - **Output directory**: `dist`
3. Variable de entorno:
   ```
   VITE_API_URL=https://tu-app.up.railway.app/api
   ```

### Admin Frontend en Vercel/Netlify

Mismo proceso que el frontend cliente, pero con `frontend-admin` como root directory.

⚠️ **Importante:** después de desplegar, añade las URLs reales del frontend cliente y admin a `ALLOWED_ORIGINS` del backend.

---

## 🔧 Variables de entorno

### Backend (`backend/.env`)

```env
DJANGO_SECRET_KEY=cambia-esto-en-produccion
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
DATABASE_URL=mysql://root:password@127.0.0.1:3307/cafeteria_ies
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:5174
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Frontend Cliente (`frontend-cliente/.env`)

```env
VITE_API_URL=http://localhost:8000/api
```

### Admin Frontend (`frontend-admin/.env`)

```env
VITE_API_URL=http://localhost:8000/api
```

⚠️ **Nunca subas archivos `.env` a GitHub.** El `.gitignore` global ya los excluye, pero comprueba antes de hacer push:

```bash
git status
# No deberías ver ningún .env listado
```

---

## 🧪 Tests

### Backend (pytest)

```bash
cd backend
# Mac/Linux:
source .venv/bin/activate
# Windows:
.venv\Scripts\activate

pytest                    # 26 tests, todos pasan
pytest -v                 # con verbose
pytest --cov              # con cobertura
```

### Frontend

Los frontends no tienen tests automatizados (proyecto escolar). Puedes hacer pruebas manuales siguiendo el [flujo de uso](#-flujo-de-uso).

---

## ⚠️ Antes de hacer push a GitHub

Antes de publicar el repo, **rota las claves de Stripe**:

1. Ve a https://dashboard.stripe.com/apikeys
2. Genera nuevas claves de prueba
3. Reemplaza las que tengas en `backend/.env`

GitHub tiene un sistema automático que detecta secretos en repos públicos y las invalida, así que conviene rotarlas tú primero.

También revisa que el `.gitignore` global está funcionando:

```bash
git check-ignore backend/.env
# Debería responder: backend/.env (significa que está ignorado)
```

---

## 📜 Licencia

Proyecto educativo desarrollado para el IES Pío Baroja (Madrid).

---

## 🙋 Sobre el proyecto

Este proyecto resuelve un problema real del instituto: **las colas en la cafetería durante el recreo**. Permite a los alumnos pedir antes y recoger su pedido sin esperas, optimizando el tiempo del personal y mejorando la experiencia de todos.

El sistema está construido como una API REST con tres clientes web independientes que se comunican mediante JWT, con Stripe para los pagos y MySQL como base de datos persistente.
