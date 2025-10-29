
import { Navigate, Outlet } from 'react-router-dom';

// Esta función simple revisa si tenemos un token en el Local Storage
const useAuth = () => {
  const usuario = localStorage.getItem('usuario');
  if (usuario) {
    return true; // Está logueado
  } else {
    return false; // No está logueado
  }
};

const ProtectedRoute = () => {
  const isAuth = useAuth();

  // Outlet es un marcador de posición para "la página que el usuario quería ver"
  // (ej. el Dashboard).
  
  // Si está autenticado, muestra la página. Si no, lo redirige al login.
  return isAuth ? <Outlet /> : <Navigate to="/" />;
};

export default ProtectedRoute;