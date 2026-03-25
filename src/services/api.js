import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000/api";
// Creamos una instancia de Axios con la URL base de nuestra API
if (import.meta.env.DEV) {
  console.log("API Base URL:", API_BASE_URL);
}

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Añadimos un interceptor para incluir el token en cada petición
// Si el token existe en el localStorage
// Lo añadimos al header de autorización
// con el formato 'Bearer <token>'
api.interceptors.request.use(
  (config) => {
    // Obtenemos el token del localStorage; JSON corrupto no debe tumbar la app
    const usuarioStorage = localStorage.getItem("usuario");
    if (usuarioStorage) {
      try {
        const parsed = JSON.parse(usuarioStorage);
        const token = parsed?.token;
        if (token) {
          config.headers["Authorization"] = "Bearer " + token;
        }
      } catch {
        localStorage.removeItem("usuario");
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
export default api;
