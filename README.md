# Frontend - BodeTIC Web App

Aplicación web **SPA** desarrollada con **React 19** y **Vite 7** para la gestión de inventario BodeTIC. Interfaz responsive con Bootstrap 5 que permite administrar insumos, usuarios, movimientos de stock y visualizar alertas del dashboard.

## Acceso rápido

- Backend complementario (API): [`../bodeticweb-backend/README.md`](../bodeticweb-backend/README.md)
- Requisitos mínimos: Node.js LTS + npm
- URL local por defecto: `http://localhost:5173`

## Stack Tecnológico

| Tecnología       | Versión  | Propósito                        |
| ---------------- | -------- | -------------------------------- |
| React            | ^19.1.1  | Framework UI                     |
| Vite             | ^7.3.3   | Build tool y dev server (HMR)    |
| React Router DOM | ^7.9.5   | Enrutamiento SPA                 |
| Axios            | ^1.16.1  | Cliente HTTP con interceptores   |
| Bootstrap        | ^5.3.8   | Framework CSS responsive         |
| React-Bootstrap  | ^2.10.10 | Componentes Bootstrap para React |
| Lucide React     | ^0.562.0 | Iconos SVG                       |
| Bootstrap Icons  | ^1.13.1  | Iconos adicionales               |

> Proyecto configurado con **ES Modules** y **JavaScript puro** (sin TypeScript).
> El paquete `serve` fue removido el 2026-05-20: el deploy es estático en Vercel y no requiere servidor Node propio (ver sección **Despliegue**).

## Estructura del Proyecto

```
bodeticweb-frontend/
├── public/                         # Archivos estáticos
├── src/
│   ├── components/                 # Componentes reutilizables
│   │   ├── LocationPicker.jsx      # Selector de coordenadas en imagen
│   │   ├── LocationViewer.jsx      # Visualizador de ubicación con marcador
│   │   ├── NotificacionModal.jsx   # Modal global de notificaciones
│   │   ├── ProtectedRoute.jsx      # HOC para rutas protegidas
│   │   ├── SalidaModal.jsx         # Modal de salida de stock
│   │   └── ScannerModal.jsx        # Escáner de códigos de barras
│   ├── context/
│   │   ├── NotificationContext.jsx # Provider del Context API de notificaciones
│   │   └── notification-context.js # Contexto + hook useNotification (separado para Fast Refresh)
│   ├── pages/                      # Páginas/Vistas
│   │   ├── LoginPage.jsx           # Inicio de sesión (RUT + contraseña)
│   │   ├── DashboardPage.jsx       # Panel con alertas y estadísticas
│   │   ├── InventarioPage.jsx      # Tabla de insumos (paginada + filtros; clic en fila → modal detalle)
│   │   ├── InventarioCreatePage.jsx# Formulario de creación de insumo (ingreso en serie: mantiene el documento y limpia el detalle)
│   │   ├── InventarioEditPage.jsx  # Formulario de edición de insumo
│   │   ├── DevolucionesPage.jsx    # Gestión de devoluciones
│   │   ├── HistorialPage.jsx       # Historial de movimientos + export
│   │   ├── UsuarioListPage.jsx     # Listado de usuarios
│   │   ├── UsuarioCreatePage.jsx   # Formulario de creación de usuario
│   │   └── UsuarioEditPage.jsx     # Formulario de edición de usuario
│   ├── services/                   # Capa de servicios (API)
│   │   ├── api.js                  # Instancia Axios + interceptor JWT
│   │   ├── auth.services.js        # Login / Logout
│   │   ├── insumo.service.js       # CRUD insumos + ubicación
│   │   ├── usuario.service.js      # CRUD usuarios + cambio contraseña
│   │   ├── movimiento.service.js   # Salidas, devoluciones, historial
│   │   ├── dashboard.service.js    # Alertas de stock
│   │   ├── documento.service.js    # Búsqueda de documentos
│   │   ├── proveedor.service.js    # Listado de proveedores
│   │   └── rol.service.js          # Listado de roles
│   ├── styles/
│   │   ├── variables.css           # Tokens de diseño (colores, sombras, radios)
│   │   └── global.css              # Estilos globales (importa variables + clases custom)
│   ├── App.jsx                     # Componente raíz (definición de rutas)
│   └── main.jsx                    # Punto de entrada (BrowserRouter + Provider)
├── index.html
├── vite.config.js
├── eslint.config.js
├── package.json
└── .gitignore
```

## Variables de Entorno

```env
VITE_API_URL=http://localhost:3001/api
```

> Las variables de Vite deben comenzar con `VITE_` para ser accesibles en el código.
> En local se recomienda `3001` para la API porque `3000` suele estar ocupado por otros proyectos (ej. Next.js), lo que provoca errores de login por endpoint incorrecto/CORS.

### Producción (p. ej. Vercel)

En el hosting del frontend, configura `VITE_API_URL` apuntando a la API pública con **HTTPS** (mismo esquema que la web). Una URL `http://` desde una página `https://` suele ser bloqueada como contenido mixto; en móvil el fallo se percibe a menudo como pantalla en blanco tras el login.

## Solución de problemas en móvil

- Si tras iniciar sesión la pantalla queda en blanco: suele deberse a `backdrop-filter` en tarjetas/navbar (mitigado en CSS en pantallas hasta `lg`) o a un error de render (el `ErrorBoundary` muestra un mensaje y opción de recargar).
- Login en móvil: el layout usa `min-vh-100` y columna explícita `xs={12}` para evitar colapsos de altura con el panel izquierdo oculto.

## Sistema de Rutas

### Rutas públicas

| Ruta | Página    | Descripción      |
| ---- | --------- | ---------------- |
| `/`  | LoginPage | Inicio de sesión |

### Rutas protegidas (requieren JWT)

| Ruta                     | Página               | Descripción                                                                                                                                                       |
| ------------------------ | -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/dashboard`             | DashboardPage        | Panel principal con alertas                                                                                                                                       |
| `/inventario`            | InventarioPage       | Listado de insumos (paginado, filtros, detalle por clic con Nro. documento Factura/guía; botón **Descargar Excel** que exporta el inventario respetando los filtros) |
| `/inventario/nuevo`      | InventarioCreatePage | Crear insumo (ingreso continuo: al registrar mantiene el formulario y el documento de origen para cargar varios insumos seguidos; el switch permite desactivarlo) |
| `/inventario/editar/:id` | InventarioEditPage   | Editar insumo                                                                                                                                                     |
| `/devoluciones`          | DevolucionesPage     | Gestión de devoluciones                                                                                                                                           |
| `/historial`             | HistorialPage        | Historial de movimientos (filtros, incluido `Nro. documento` con búsqueda parcial; columna `Nro. documento`; fechas con placeholder `MM-DD-YYYY` en UI)           |
| `/usuarios`              | UsuarioListPage      | Listado de usuarios                                                                                                                                               |
| `/usuarios/nuevo`        | UsuarioCreatePage    | Crear usuario                                                                                                                                                     |
| `/usuarios/editar/:id`   | UsuarioEditPage      | Editar usuario                                                                                                                                                    |

Cualquier ruta no definida muestra **"404 - Página No Encontrada"**.

## Componentes

### ProtectedRoute

HOC que verifica la existencia de datos de usuario en `localStorage`. Redirige a `/` si no hay sesión activa. Usa `Outlet` de React Router para renderizar rutas hijas.

### NotificacionModal

Modal global con animaciones CSS. Tipos soportados: `success` y `error`. Integrado con el `NotificationContext`.

### LocationPicker

Selector interactivo de coordenadas (x, y) sobre una imagen. Soporta subida de archivo y captura desde cámara. Calcula posiciones en porcentajes relativos.

### LocationViewer

Visualiza la ubicación de un insumo sobre su imagen con un marcador animado (efecto pulso).

### SalidaModal

Modal para registrar salidas de stock. Tipos: "Salida-Uso" (requiere código OT) y "Préstamo". Valida cantidad contra stock disponible.

### ScannerModal

Escáner de códigos de barras usando la **BarcodeDetector API** del navegador. Utiliza cámara trasera en dispositivos móviles.

### ErrorBoundary

Componente clase que captura errores de render en producción (evita pantalla en blanco). Muestra un mensaje de error con opción de recarga.

## Gestión de Estado

### Context API — NotificationContext

Sistema global de notificaciones que evita prop drilling.

```jsx
const { showNotification } = useNotification();
showNotification("Operación exitosa", "success");
showNotification("Error al guardar", "error");
```

### LocalStorage

Almacena la sesión del usuario autenticado bajo la key `"usuario"`:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "usuario": { "id": 1, "rol": 1, "nombre": "Admin" }
}
```

### Estado local

Cada componente gestiona su propio estado con `useState`. No se usa Redux ni Zustand.

## Servicios (Capa API)

### Configuración base — `api.js`

Instancia de Axios con `baseURL` desde `VITE_API_URL`. Interceptor automático que inyecta el token JWT en el header `Authorization: Bearer <token>`.

### auth.services.js

| Función                | Endpoint           | Descripción         |
| ---------------------- | ------------------ | ------------------- |
| `login(rut, password)` | POST `/auth/login` | Autenticación       |
| `logout()`             | —                  | Limpia localStorage |

### insumo.service.js

| Función                            | Endpoint                         | Descripción                                                   |
| ---------------------------------- | -------------------------------- | ------------------------------------------------------------- |
| `getInsumos(filtros, page, limit)` | GET `/insumos`                   | Listado paginado con filtros                                  |
| `getInsumosExcel(filtros)`         | GET `/insumos/export`            | Descarga el inventario en Excel respetando los filtros aplicados |
| `getCategorias()`                  | GET `/categorias`                | Categorías disponibles                                        |
| `getProveedores()`                 | GET `/proveedores`               | Proveedores disponibles                                       |
| `getInsumoById(id)`                | GET `/insumos/:id`               | Detalle de insumo + último `codigo_documento` asociado        |
| `getInsumoBySku(sku)`              | GET `/insumos/sku/:sku`          | Búsqueda por SKU                                              |
| `createInsumo(data)`               | POST `/insumos`                  | Crear insumo (FormData)                                       |
| `updateInsumo(id, data)`           | PUT `/insumos/:id`               | Actualizar insumo                                             |
| `toggleActivo(id, estado)`         | PUT `/insumos/:id/toggle-activo` | Activar/Desactivar                                            |
| `ocultarDeApp(id)`                 | PUT `/insumos/:id/ocultar-app`   | Retirar de la app (papelera); conserva fila e historial en BD |
| `updateUbicacion(id, formData)`    | PUT `/insumos/:id/ubicacion`     | Actualizar ubicación visual                                   |

### movimiento.service.js

| Función                              | Endpoint                                   | Descripción                                                                                          |
| ------------------------------------ | ------------------------------------------ | ---------------------------------------------------------------------------------------------------- |
| `registrarSalida(data)`              | POST `/movimientos/salida`                 | Registrar salida                                                                                     |
| `registrarDevolucion(data)`          | POST `/movimientos/devolucion`             | Registrar devolución                                                                                 |
| `getPrestamosActivos()`              | GET `/movimientos/prestamos`               | Préstamos pendientes (detalle: insumo, técnico, stock, fecha y descripción del último préstamo)      |
| `getHistorial(filtros, page, limit)` | GET `/movimientos/historial`               | Historial filtrado (incluye filtro `codigo_documento`; en salidas se hereda el documento de entrada) |
| `getHistorialExcel(filtros)`         | GET `/movimientos/historial?formato=excel` | Descarga Excel                                                                                       |

### usuario.service.js

| Función                                | Endpoint                            | Descripción        |
| -------------------------------------- | ----------------------------------- | ------------------ |
| `getUsuariosTecnicos()`                | GET `/usuarios/tecnicos`            | Técnicos activos   |
| `getAllUsuarios()`                     | GET `/usuarios`                     | Todos los usuarios |
| `getUsuarioById(id)`                   | GET `/usuarios/:id`                 | Usuario por ID     |
| `createUsuario(data)`                  | POST `/usuarios`                    | Crear usuario      |
| `updateUsuario(id, data)`              | PUT `/usuarios/:id`                 | Actualizar usuario |
| `changePasswordAdmin(id, newPassword)` | PUT `/usuarios/:id/change-password` | Cambiar contraseña |

### dashboard.service.js

| Función        | Endpoint                 | Descripción                         |
| -------------- | ------------------------ | ----------------------------------- |
| `getAlertas()` | GET `/dashboard/alertas` | Alertas de stock bajo y vencimiento |

### documento.service.js

| Función                        | Endpoint                         | Descripción      |
| ------------------------------ | -------------------------------- | ---------------- |
| `getDocumentoByCodigo(codigo)` | GET `/documentos/buscar/:codigo` | Buscar documento |

### proveedor.service.js / rol.service.js

| Función            | Endpoint           | Descripción        |
| ------------------ | ------------------ | ------------------ |
| `getProveedores()` | GET `/proveedores` | Listar proveedores |
| `getRoles()`       | GET `/roles`       | Listar roles       |

## Estilos y Estética Premium

- **Bootstrap 5** como framework principal (grid, utilidades, componentes). Criterio **mobile-first**.
- **React-Bootstrap** para componentes interactivos (Modal, Form, Button, etc.).
- **Sistema de diseño premium y Tipografía:**
  - Tipografía principal unificada a la fuente **Outfit** (vía Google Fonts).
  - Efectos visuales de tipo **Glassmorphism** (fondos semitransparentes con desenfoque) y micro-animaciones fluidas.
  - **`src/styles/variables.css`**: tokens de diseño que mantienen la paleta de colores oficial original (`#0d6efd`, etc) junto con las variables para transparencias, cajas con sombra premium y gradientes suaves.
  - **`src/styles/global.css`**: clases customizadas (navbar-custom cristalina, modales transparentes, botones y animaciones). Importado de manera estricta y global tras la carga de Bootstrap.
- **Sin estilos acoplados**: Está estrictamente prohibido usar bloques `<style>` inline. Toda nueva estilización debe ajustarse a las clases del global y al paradigma de las variables base.
- **Bootstrap Icons + Lucide React** para iconografía.

## Scripts

```bash
npm install        # Instalar dependencias
npm run dev        # Desarrollo (Vite, puerto 5173)
npm run build      # Build de producción (dist/)
npm run preview    # Preview del build local
npm run lint       # Linting con ESLint
npm test           # Tests con Vitest
```

> El frontend se despliega como **sitio estático** (p. ej. Vercel). No requiere proceso `node` propio; Vercel sirve `dist/` directamente. Si necesitas servir el build en otro entorno, usa nginx, Caddy o sírvelo desde el backend Express.

### Ejecución local independiente

Este frontend está documentado para ejecutarse de forma independiente dentro de su propio repositorio/directorio:

```bash
npm install
npm run dev
```

> Para evitar errores de CORS o autenticación, confirma que `VITE_API_URL` apunte al backend activo.

## Despliegue

El build de producción (`npm run build`) genera la carpeta `dist/`. En **Vercel** (recomendado) la plataforma sirve los archivos estáticos directamente; no se requiere `node` ni script `start`.

## Seguridad de dependencias

- **2026-05-20**: cerradas vulnerabilidades reportadas por Snyk/`npm audit`. Cambios: `axios ^1.13.1 → ^1.16.1` (15 CVEs), `vite ^7.1.7 → ^7.3.3` (3 CVEs de dev server). Se eliminó `serve` (era innecesario al desplegar en Vercel). Estado actual: `npm audit` reporta **0 vulnerabilidades**.

## Patrones del Proyecto

- **Autenticación basada en localStorage** — verificación de existencia de token
- **Interceptor Axios** — JWT inyectado automáticamente en cada petición
- **Soft delete** — insumos y usuarios se activan/desactivan, no se eliminan
- **Paginación server-side** — en inventario e historial
- **Validación HTML5 nativa** con feedback visual de Bootstrap
- **Roles en frontend** — Admin (rol 1) ve todas las opciones; Técnico (rol 2) tiene vista limitada
