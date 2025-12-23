# AI Coding Instructions for BodeTIC Frontend

## Architecture Overview
This is a React + Vite frontend for a warehouse inventory management system (BodeTIC). It communicates with a Node.js/Express backend via REST API using Axios. Key components:
- **Pages**: Login, Dashboard, Inventory (Inventario), Returns (Devoluciones), Users, History
- **Services**: API calls in `src/services/` (e.g., `insumo.service.js`)
- **Context**: Notification system via `NotificationContext`
- **UI**: React Bootstrap with icons

## Data Flow & API Integration
- Base API URL: `VITE_API_URL` env var (default: `http://localhost:3000/api`)
- Authentication: JWT token stored in localStorage, auto-injected via Axios interceptor
- Pagination: Consistent 9 items per page (`limit=9`) across inventory lists
- Filters: `activo` (boolean), `categoria` (ID), `search` (name partial match)

Example API call:
```javascript
const response = await insumoService.getInsumos({ activo: true, categoria: 1 }, 1, 9);
// Returns { data: [...], pagination: { totalPages, currentPage } }
```

## Developer Workflows
- **Development**: `npm run dev` (Vite dev server on port 5173)
- **Build**: `npm run build` (outputs to `dist/`)
- **Lint**: `npm run lint` (ESLint with React rules)
- **Preview**: `npm run preview` (serve built app)
- **Start**: `serve -s dist -p $PORT` (production serve)

Set `VITE_API_URL` to backend URL (e.g., `http://localhost:3000/api`) for local dev.

## Code Conventions
- **Language**: Spanish variable/function names (e.g., `insumo`, `categoria`, `proveedor`)
- **State Management**: React hooks + context for notifications
- **Routing**: React Router with protected routes via `ProtectedRoute` component
- **Modals**: Custom modals for actions (e.g., `SalidaModal` for stock exits, `ScannerModal`)
- **Error Handling**: Try/catch in services, throw `error.response.data`
- **Imports**: Absolute paths from `src/`

Example component structure:
```jsx
const InventarioPage = () => {
  const [insumos, setInsumos] = useState([]);
  const { showNotification } = useNotification();
  // Load data with filters and pagination
};
```

## Key Files
- `src/services/api.js`: Axios instance with JWT interceptor
- `src/App.jsx`: Route definitions
- `src/pages/InventarioPage.jsx`: Example of filtered/paginated list
- `src/components/ProtectedRoute.jsx`: Auth guard

Focus on maintaining Spanish naming consistency and matching backend pagination/filter logic.</content>
<parameter name="filePath">c:\Users\USUARIO\Documents\Bodeticweb\bodeticweb-frontend\.github\copilot-instructions.md