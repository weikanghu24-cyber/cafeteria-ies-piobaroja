# Cafeteria IES Pio Baroja - Frontend Cliente

App web responsive para que los alumnos del IES Pio Baroja hagan pre-pedidos en la cafeteria.

## Stack

- **React 18** + **Vite** (super rapido)
- **Tailwind CSS** con tema personalizado (paleta cafe + crema + acento naranja)
- **React Router 6** para navegacion
- **Zustand** para estado global (auth + carrito) con persistencia
- **TanStack Query** (React Query) para fetching y cache
- **Axios** con interceptors JWT (refresh automatico)
- **Stripe** integrado (modo TEST) para pagos
- **Framer Motion** para animaciones suaves
- **Lucide React** para iconos
- **Tipografias**: Fraunces (display) + Manrope (body)

---

## Instalacion

### Requisitos
- Node.js 18+ (recomendado 20)
- Backend Django arrancado en `http://localhost:8000`

### Pasos

```bash
cd frontend-cliente

# 1. Instalar dependencias
npm install

# 2. Configurar variables de entorno
cp .env.example .env
# Edita .env con tu backend y tu Google Client ID (opcional)

# 3. Arrancar
npm run dev
```

App en **http://localhost:5173**

---

## Comandos disponibles

```bash
npm run dev      # arranca el servidor de desarrollo
npm run build    # build para produccion (genera carpeta dist/)
npm run preview  # previsualiza el build
npm run lint     # linter
```

---

## Estructura

```
frontend-cliente/
├── public/                  # archivos estaticos (favicon)
├── src/
│   ├── api/                 # axios + endpoints
│   │   ├── client.js        # axios con interceptors JWT
│   │   └── endpoints.js     # todas las llamadas a la API
│   ├── components/          # componentes reutilizables
│   │   ├── Logo.jsx
│   │   ├── TopBar.jsx
│   │   ├── BottomNav.jsx    # nav mobile
│   │   ├── SideNav.jsx      # nav desktop
│   │   ├── ClientLayout.jsx # layout principal
│   │   ├── ProductCard.jsx
│   │   ├── CartDrawer.jsx   # carrito lateral
│   │   ├── ProtectedRoute.jsx
│   │   ├── Loading.jsx
│   │   └── EmptyState.jsx
│   ├── pages/
│   │   ├── auth/
│   │   │   ├── LoginPage.jsx
│   │   │   └── RegisterPage.jsx
│   │   ├── client/
│   │   │   ├── HomePage.jsx
│   │   │   ├── MenuPage.jsx
│   │   │   ├── CheckoutPage.jsx        # con Stripe
│   │   │   ├── OrderConfirmationPage.jsx  # con QR
│   │   │   ├── OrdersPage.jsx
│   │   │   ├── FavoritesPage.jsx
│   │   │   ├── NotificationsPage.jsx
│   │   │   └── ProfilePage.jsx
│   │   └── NotFoundPage.jsx
│   ├── store/               # Zustand stores
│   │   ├── auth.js          # JWT + usuario
│   │   └── cart.js          # carrito persistente
│   ├── utils/
│   │   └── cn.js            # helpers (clsx + format)
│   ├── App.jsx              # router
│   ├── main.jsx             # entry
│   └── index.css            # tema Tailwind
├── index.html
├── tailwind.config.js
├── vite.config.js
├── package.json
└── .env.example
```

---

## Rutas

| Ruta | Descripcion |
|------|-------------|
| `/login` | Login (si ya esta autenticado redirige a `/`) |
| `/register` | Registro |
| `/` | Home con destacados, categorias y franja proxima |
| `/menu` | Catalogo con filtros y busqueda |
| `/menu?categoria=X` | Filtrado por categoria |
| `/menu?saludable=true` | Solo opciones saludables |
| `/favorites` | Productos favoritos |
| `/checkout` | Seleccion de franja + pago |
| `/orders` | Historial de pedidos |
| `/orders/:id/confirmacion` | Codigo de recogida + QR |
| `/notifications` | Centro de notificaciones |
| `/profile` | Perfil + logout |

---

## Flujo del cliente

1. **Registro/Login** → consigue JWT (access + refresh)
2. **Explora menu** → filtra por categoria, saludable, busca
3. **Anade al carrito** → estado persistido en localStorage
4. **Checkout** → elige franja horaria de las disponibles
5. **Crea pedido** → POST /api/orders/ (estado: pendiente_pago)
6. **Pago Stripe** → tarjeta 4242... = exito, otras = rechazada
7. **Confirmacion** → QR + codigo de recogida (ej: K7M3X9)
8. **Recoge** → ensena el codigo al personal de cafeteria

---

## Cuentas de prueba (precargadas)

| Rol | Usuario | Pass |
|-----|---------|------|
| Cliente | `alumno` | `alumno1234` |
| Admin | `admin` | `cafeteria2024` |

---

## Tarjetas Stripe TEST

| Numero | Resultado |
|--------|-----------|
| `4242 4242 4242 4242` | Pago aceptado |
| `4000 0000 0000 0002` | Tarjeta rechazada |
| `4000 0000 0000 9995` | Fondos insuficientes |
| `4000 0000 0000 0069` | Tarjeta caducada |

CVC: cualquier 3 cifras. Fecha: cualquiera futura.

---

## Diseño

- **Paleta**: cafe tostado (#3d2817) + crema (#f5ede0) + acento naranja (#d97706) + verde saludable (#65a30d)
- **Tipografias**: Fraunces (titulos, con caracter editorial) + Manrope (texto, geometrica clean)
- **Mobile-first**: todo pensado para smartphone primero (bottom nav fija)
- **Desktop**: sidebar lateral, layout amplio con max 6xl
- **Animaciones**: Framer Motion en transiciones de pagina, stagger en listados, spring physics en drawers
- **Microinteracciones**: anadir al carrito con check verde temporal, badges con bounce, hover states suaves

---

## Deploy

### Vercel / Netlify (recomendado)

1. Sube la carpeta `frontend-cliente` a un repo de GitHub
2. Conecta Vercel/Netlify al repo
3. Build command: `npm run build`
4. Output directory: `dist`
5. Variables de entorno:
   - `VITE_API_URL` = URL del backend en produccion
   - `VITE_GOOGLE_CLIENT_ID` = tu Client ID de Google Cloud (opcional)

### Railway / Render
1. Build command: `npm install && npm run build`
2. Output: `dist/`
3. Servir con cualquier static server (vercel, netlify, surge, ...)

**IMPORTANTE para deploy:** en el backend Django anade la URL del frontend a `ALLOWED_ORIGINS` y `CSRF_TRUSTED_ORIGINS` para que CORS no bloquee.

---

## Notas tecnicas

- **JWT en localStorage**: simple para prototipo. Para produccion considerar httpOnly cookies (mas seguras pero requieren cambios en backend).
- **Refresh automatico**: cuando un request da 401, axios lo intercepta, llama a /token/refresh/ y reintenta el original.
- **Stripe Elements**: usa el PaymentElement universal (acepta tarjeta, Apple Pay, Google Pay, etc.).
- **No hay localStorage en el carrito durante el checkout**: el pedido se crea en backend antes del pago, asi si recargas no pierdes el progreso.
