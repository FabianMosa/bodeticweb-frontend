# Frontend - BodeTIC Web App

Aplicación web **SPA** desarrollada con **React 19** y **Vite 7** para la gestión de inventario BodeTIC. Interfaz responsive con Bootstrap 5 que permite administrar insumos, usuarios, movimientos de stock y visualizar alertas del dashboard.

## Stack Tecnológico

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| React | ^19.1.1 | Framework UI |
| Vite | ^7.1.7 | Build tool y dev server (HMR) |
| React Router DOM | ^7.9.5 | Enrutamiento SPA |
| Axios | ^1.13.1 | Cliente HTTP con interceptores |
| Bootstrap | ^5.3.8 | Framework CSS responsive |
| React-Bootstrap | ^2.10.10 | Componentes Bootstrap para React |
| Lucide React | ^0.562.0 | Iconos SVG |
| Bootstrap Icons | ^1.13.1 | Iconos adicionales |
| serve | ^14.2.5 | Servidor estático para producción |

> Proyecto configurado con **ES Modules** y **JavaScript puro** (sin TypeScript).

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
│   │   └── NotificationContext.jsx # Context API para notificaciones
│   ├── pages/                      # Páginas/Vistas
│   │   ├── LoginPage.jsx           # Inicio de sesión (RUT + contraseña)
│   │   ├── DashboardPage.jsx       # Panel con alertas y estadísticas
│   │   ├── InventarioPage.jsx      # Tabla de insumos (paginada + filtros)
│   │   ├── InventarioCreatePage.jsx# Formulario de creación de insumo
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
VITE_API_URL=http://localhost:3000/api
```

> Las variables de Vite deben comenzar con `VITE_` para ser accesibles en el código.

## Sistema de Rutas

### Rutas públicas

| Ruta | Página | Descripción |
|------|--------|-------------|
| `/` | LoginPage | Inicio de sesión |

### Rutas protegidas (requieren JWT)

| Ruta | Página | Descripción |
|------|--------|-------------|
| `/dashboard` | DashboardPage | Panel principal con alertas |
| `/inventario` | InventarioPage | Listado de insumos (paginado, filtros) |
| `/inventario/nuevo` | InventarioCreatePage | Crear insumo |
| `/inventario/editar/:id` | InventarioEditPage | Editar insumo |
| `/devoluciones` | DevolucionesPage | Gestión de devoluciones |
| `/historial` | HistorialPage | Historial de movimientos |
| `/usuarios` | UsuarioListPage | Listado de usuarios |
| `/usuarios/nuevo` | UsuarioCreatePage | Crear usuario |
| `/usuarios/editar/:id` | UsuarioEditPage | Editar usuario |

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
| Función | Endpoint | Descripción |
|---------|----------|-------------|
| `login(rut, password)` | POST `/auth/login` | Autenticación |
| `logout()` | — | Limpia localStorage |

### insumo.service.js
| Función | Endpoint | Descripción |
|---------|----------|-------------|
| `getInsumos(filtros, page, limit)` | GET `/insumos` | Listado paginado con filtros |
| `getCategorias()` | GET `/categorias` | Categorías disponibles |
| `getProveedores()` | GET `/proveedores` | Proveedores disponibles |
| `getInsumoById(id)` | GET `/insumos/:id` | Detalle de insumo |
| `getInsumoBySku(sku)` | GET `/insumos/sku/:sku` | Búsqueda por SKU |
| `createInsumo(data)` | POST `/insumos` | Crear insumo (FormData) |
| `updateInsumo(id, data)` | PUT `/insumos/:id` | Actualizar insumo |
| `toggleActivo(id, estado)` | PUT `/insumos/:id/toggle-activo` | Activar/Desactivar |
| `updateUbicacion(id, formData)` | PUT `/insumos/:id/ubicacion` | Actualizar ubicación visual |

### movimiento.service.js
| Función | Endpoint | Descripción |
|---------|----------|-------------|
| `registrarSalida(data)` | POST `/movimientos/salida` | Registrar salida |
| `registrarDevolucion(data)` | POST `/movimientos/devolucion` | Registrar devolución |
| `getPrestamosActivos()` | GET `/movimientos/prestamos` | Préstamos pendientes |
| `getHistorial(filtros, page, limit)` | GET `/movimientos/historial` | Historial filtrado |
| `getHistorialExcel(filtros)` | GET `/movimientos/historial?formato=excel` | Descarga Excel |

### usuario.service.js
| Función | Endpoint | Descripción |
|---------|----------|-------------|
| `getUsuariosTecnicos()` | GET `/usuarios/tecnicos` | Técnicos activos |
| `getAllUsuarios()` | GET `/usuarios` | Todos los usuarios |
| `getUsuarioById(id)` | GET `/usuarios/:id` | Usuario por ID |
| `createUsuario(data)` | POST `/usuarios` | Crear usuario |
| `updateUsuario(id, data)` | PUT `/usuarios/:id` | Actualizar usuario |
| `changePasswordAdmin(id, newPassword)` | PUT `/usuarios/:id/change-password` | Cambiar contraseña |

### dashboard.service.js
| Función | Endpoint | Descripción |
|---------|----------|-------------|
| `getAlertas()` | GET `/dashboard/alertas` | Alertas de stock bajo y vencimiento |

### documento.service.js
| Función | Endpoint | Descripción |
|---------|----------|-------------|
| `getDocumentoByCodigo(codigo)` | GET `/documentos/buscar/:codigo` | Buscar documento |

### proveedor.service.js / rol.service.js
| Función | Endpoint | Descripción |
|---------|----------|-------------|
| `getProveedores()` | GET `/proveedores` | Listar proveedores |
| `getRoles()` | GET `/roles` | Listar roles |

## Estilos

- **Bootstrap 5** como framework principal (grid, utilidades, componentes). Criterio **mobile-first** con breakpoints estándar de Bootstrap.
- **React-Bootstrap** para componentes interactivos (Modal, Form, Button, etc.)
- **Sistema de diseño propio:**
  - **`src/styles/variables.css`**: tokens (variables CSS) para colores, gradientes, sombras, radios y espaciado. Punto único de verdad para temas.
  - **`src/styles/global.css`**: importa las variables y define todas las clases custom reutilizables (navbar-custom, btn-gradient, btn-modern, card-header-gradient, shadow-hover, icon-circle, input-group-modern, badges de estado, etc.). Se importa en `main.jsx` después de Bootstrap.
- No se usan estilos inline en componentes; toda la personalización está en `global.css` usando las variables.
- **Bootstrap Icons + Lucide React** para iconografía.

## Scripts

```bash
npm install        # Instalar dependencias
npm run dev        # Desarrollo (Vite, puerto 5173)
npm run build      # Build de producción (dist/)
npm run preview    # Preview del build local
npm run lint       # Linting con ESLint
npm start          # Servir build en producción (serve)
```

## Despliegue

El build de producción (`npm run build`) genera la carpeta `dist/` que puede servirse con cualquier servidor estático. El script `npm start` utiliza `serve` para este propósito, leyendo el puerto desde la variable de entorno `$PORT`.

## Patrones del Proyecto

- **Autenticación basada en localStorage** — verificación de existencia de token
- **Interceptor Axios** — JWT inyectado automáticamente en cada petición
- **Soft delete** — insumos y usuarios se activan/desactivan, no se eliminan
- **Paginación server-side** — en inventario e historial
- **Validación HTML5 nativa** con feedback visual de Bootstrap
- **Roles en frontend** — Admin (rol 1) ve todas las opciones; Técnico (rol 2) tiene vista limitada
