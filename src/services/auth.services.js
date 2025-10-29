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
    // Si hay un error (ej. 401 Contraseña incorrecta), lo propagamos
    console.error('Error en el servicio de login:', error.response.data);
    throw error.response.data;
  }
};

const logout = () => {
  // Simplemente removemos el token del Local Storage
  localStorage.removeItem('usuario');
};

export default  {
  login,
  logout,
};