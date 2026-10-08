# 🤖 Instrucciones para IA (Agent / Copilot) - Frontend BodeTIC

Este archivo define las reglas, restricciones y el contexto arquitectónico para cualquier asistente de IA (como GitHub Copilot, Cursor, Gemini, etc.) que deba modificar, analizar o agregar código en este frontend.

## 🛠️ Stack Tecnológico
- **Core:** React 19 + Vite 7 (Configurado sin TypeScript, JavaScript puro con ES Modules).
- **Enrutamiento:** React Router DOM v6.
- **Peticiones HTTP:** Axios (con interceptores).
- **UI & Estilos:** Bootstrap 5, React-Bootstrap, Lucide React (iconos), Bootstrap Icons.

## 🏗️ Patrones y Reglas de Arquitectura

### 1. Componentes y UI (ESTRICTO)
- **Prohibido el uso de CSS en línea (inline styles):** Jamás usar `style={{ ... }}` en los componentes a menos que sea para valores calculados matemáticamente en tiempo real (ej. posiciones de coordenadas).
- Toda estilización debe basarse en las clases utilitarias de **Bootstrap 5** (ej. `d-flex`, `mt-3`, `text-center`).
- Si Bootstrap no es suficiente, usar las clases globales definidas en `src/styles/global.css`.
- **Estética Glassmorphism:** Respetar los "tokens de diseño" (variables CSS) ubicados en `src/styles/variables.css` que proveen fondos translúcidos, desenfoques y sombras premium. 
- Enfoque **Mobile-First** garantizando que la UI no se rompa ni tenga scroll horizontal en pantallas móviles (usar el grid system `col-12 col-md-6`, etc).

### 2. Autenticación, Sesión y Enrutamiento
- El enrutamiento de la aplicación utiliza `<Routes>` y `<Route>`.
- **Protección de Rutas:** Cualquier ruta privada DEBE estar envuelta (como componente hijo/nested) por el componente Layout `<ProtectedRoute />`, el cual utiliza un `<Outlet />` de React Router v6 para renderizar las vistas hijas si la sesión es válida.
- La persistencia de sesión se basa en el token JWT guardado en `localStorage` bajo la clave `usuario`.
- **Interceptores:** No inyectar tokens manualmente. Axios (`src/services/api.js`) intercepta cada solicitud automáticamente y anexa el header `Authorization: Bearer <token>`.

### 3. Gestión de Estado
- Manejar el estado a nivel local de componentes usando `useState` y efectos con `useEffect`.
- **Notificaciones (Toast/Modales):** Utilizar siempre el Context API existente `NotificationContext`. Para emitir una alerta, invocar el hook `const { showNotification } = useNotification();` y llamar a `showNotification("Mensaje", "success" | "error")`. NO hacer prop drilling para mensajes de error o éxito.
- Evitar usar Redux o Zustand. Todo es manejado por el contexto o el estado local.

### 4. Lógica de Peticiones y Servicios
- Aislar toda la lógica de llamadas HTTP en la carpeta `src/services/`. Los componentes de React NO deben contener sentencias `axios.get()` directamente, sino llamar a las funciones abstractas del servicio (ej. `await getInsumos()`).
- Manejar siempre un bloque `try/catch` para cada petición asíncrona dentro del componente, gestionando un estado `loading` para deshabilitar botones y mostrar _spinners_ para mejorar la UX.

## 📝 Estilo de Código
- Emplear **Componentes Funcionales (Functional Components)** con Hooks en todo lugar. Los Class Components están prohibidos (a excepción del `ErrorBoundary` ya existente).
- Utilizar nomenclatura descriptiva. Comentarios clave en español para decisiones de diseño.
