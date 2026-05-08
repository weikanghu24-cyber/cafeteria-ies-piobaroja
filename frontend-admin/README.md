# Cafeteria IES Pio Baroja - Panel de Administracion

Panel de administracion para el personal de la cafeteria. Permite gestionar pedidos en tiempo real, productos, franjas horarias y verificar codigos de recogida.

## Stack

- **React 18** + **Vite**
- **Tailwind CSS** (mismo tema que el frontend cliente)
- **React Router 6**
- **Zustand** (estado de auth)
- **TanStack Query** (con polling automatico)
- **Axios** con interceptors JWT
- **Framer Motion** + **Lucide React**

---

## Instalacion

### Requisito previo
El backend Django tiene que estar arrancado en `http://localhost:8000`.

### Pasos

```bash
cd frontend-admin

# Instalar dependencias
npm install

# Copiar .env de ejemplo
cp .env.example .env

# Arrancar
npm run dev
```

App en **http://localhost:5174** (puerto distinto al cliente para poder tenerlos abiertos a la vez).

---

## Comandos

```bash
npm run dev      # servidor de desarrollo
npm run build    # build de produccion
npm run preview  # previsualizar build
```

---

## Funcionalidades

### Dashboard (`/dashboard`)
- Contadores en vivo de pedidos por estado (pagado, preparando, listo, entregado)
- Tabla de pedidos recientes
- Refresco automatico cada 30s
- Acciones rapidas a las secciones principales

### Pedidos (`/orders`)
- Lista con polling cada 10s (tiempo real)
- Filtros por estado: todos, pagados, preparando, listos, entregados, cancelados
- Busqueda por codigo de recogida
- Vista tabla en desktop / cards en movil

### Detalle de pedido (`/orders/:id`)
- Vista completa: productos, cliente, franja, notas, cronologia
- Botones contextuales para cambiar estado:
  - `pagado` → `preparando` o `cancelado`
  - `preparando` → `listo` o `cancelado`
  - `listo` → `entregado`
- Confirmacion antes de cancelar
- El cliente recibe notificaciones automaticamente

### Verificar codigo (`/scanner`)
- Input grande para introducir el codigo de recogida (6 caracteres)
- Auto-focus para maximo flujo
- Muestra el pedido y permite confirmar entrega de un click
- Avisos contextuales segun estado del pedido

### Productos (`/products`)
- CRUD completo de productos
- Filtro por categoria + busqueda
- Modal para crear/editar con preview de imagen
- Campos: nombre, descripcion, precio, categoria, imagen URL, disponible, saludable, stock

### Franjas horarias (`/timeslots`)
- CRUD completo agrupado por dias
- Visualizacion de ocupacion (% de plazas ocupadas)
- Indicador de franjas pasadas / inactivas / completas
- Crear con valores predefinidos (manana, 11:00-11:30, 20 plazas)

---

## Cuenta de administrador

| Rol | Usuario | Contrasena |
|-----|---------|------------|
| Admin cafeteria | `admin` | `cafeteria2024` |

**Importante:** solo usuarios con `is_cafeteria_admin=True` pueden entrar al panel. Si intentas iniciar sesion con una cuenta de cliente normal, se rechaza el acceso.

---

## Diseno

El panel usa el mismo tema que el frontend cliente (paleta cafe + crema + acento naranja, tipografias Fraunces + Manrope), pero con un layout de dashboard:

- Sidebar fija con navegacion
- Layout amplio para tablas
- Tarjetas de estadisticas con iconos coloreados
- Badges de estado de pedido con colores semaforicos
- Modales para formularios

---

## Deploy

Mismo proceso que el frontend cliente. Configura la variable `VITE_API_URL` apuntando al backend en produccion.

```bash
npm run build
# Sube el contenido de dist/ a Vercel/Netlify/Render
```

**Importante:** anade la URL del admin frontend en `ALLOWED_ORIGINS` del backend Django para que CORS no bloquee.
