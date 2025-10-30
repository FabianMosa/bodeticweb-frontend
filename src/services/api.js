
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
// Creamos una instancia de Axios con la URL base de nuestra API
console.log('API Base URL:', API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL
});

// Añadimos un interceptor para incluir el token en cada petición
// Si el token existe en el localStorage
// Lo añadimos al header de autorización
// con el formato 'Bearer <token>'
api.interceptors.request.use(
  (config) => {
    // 1. Obtenemos los datos del usuario del localStorage
    const usuarioStorage = localStorage.getItem('usuario');
    if (usuarioStorage) {
      // 2. Obtenemos el token
      const token = JSON.parse(usuarioStorage).token;
      
      // 3. Lo añadimos al header de autorización
      if (token) {
        config.headers['Authorization'] = 'Bearer ' + token;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
export default api;