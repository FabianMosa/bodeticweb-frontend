import { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import LoginPage from './pages/LoginPage.jsx'
import DashboardPage from './pages/DashboardPage.jsx';    
import ProtectedRoute from './components/ProtectedRoute.jsx';
import InventarioPage from './pages/InventarioPage.jsx';
import InventarioCreatePage from './pages/InventarioCreatePage.jsx';
import InventarioEditPage from './pages/InventarioEditPage.jsx';
import DevolucionPage from './pages/DevolucionesPage.jsx';
import UsuarioListPage from './pages/UsuarioListPage.jsx';
import UsuarioCreatePage from './pages/UsuarioCreatePage.jsx';
import UsuarioEditPage from './pages/UsuarioEditPage.jsx';
import HistorialPage from './pages/HistorialPage.jsx';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  const [count, setCount] = useState(0)

  return (
    <div>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route element={<ProtectedRoute />}/>          
          <Route path="/dashboard" element={<DashboardPage />} />          
          <Route path="/inventario" element={<InventarioPage />} />
          <Route path="/inventario/nuevo" element={<InventarioCreatePage />} />
          <Route path="/inventario/editar/:id" element={<InventarioEditPage />} />
          <Route path="/devoluciones" element={<DevolucionPage />} />
          <Route path="/usuarios" element={<UsuarioListPage />} />
          <Route path="/usuarios/nuevo" element={<UsuarioCreatePage />} />
          <Route path="/usuarios/editar/:id" element={<UsuarioEditPage />} />
          <Route path="/historial" element={<HistorialPage />} />
        {/* (Opcional: Ruta para "No encontrado") */}
        <Route path="*" element={<h2>404 - Página No Encontrada</h2>} />

      </Routes>
      
    </div>
  )
}

export default App
