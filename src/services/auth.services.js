// frontend/src/services/auth.service.js
import api from './api'; // Importamos la instancia de Axios

const login = async (rut, password) => {
  try {
    // Hacemos el POST a la ruta /auth/login (la URL base ya está en 'api')
    const response = await api.post('/auth/login', {
      rut,
      password
    });

    // Si el login es exitoso, guardamos el token en el Local Storage
    // Esto mantiene al usuario logueado si recarga la página
    if (response.data.token) {
      localStorage.setItem('usuario', JSON.stringify(response.data));
    }

    return response.data;
  } catch (error) {
  if (error.response && error.response.data) {
    // El error vino del backend (ej. 401, 404, 500)
    console.error('Error de servidor:', error.response.data.message);
    throw error.response.data;
  } else {
    // El error es de red (CORS, URL mal, backend caído)
    console.error('Error de red o CORS:', error.message);
    throw new Error(error.message || 'Error de red. Revisa la URL de la API o la configuración CORS.');
  }
}

const logout = () => {
  // Simplemente removemos el token del Local Storage
  localStorage.removeItem('usuario');
};

export default  {
  login,
  logout,
};