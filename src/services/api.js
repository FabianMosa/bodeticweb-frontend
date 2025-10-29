
import axios from 'axios';

// Creamos una instancia de Axios con la URL base de nuestra API
const api = axios.create({
  baseURL: 'http://localhost:3000/api' // La URL de tu backend
});
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