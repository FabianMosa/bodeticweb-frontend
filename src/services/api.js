import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000/api";
// Instancia Axios con la URL base de la API (en Vercel definir VITE_API_URL apuntando al backend HTTPS de Railway)

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Añadimos un interceptor para incluir el token en cada petición
// Si el token existe en el localStorage
// Lo añadimos al header de autorización
// con el formato 'Bearer <token>'
api.interceptors.request.use(
  (config) => {
    const usuarioStorage = localStorage.getItem("usuario");
    if (usuarioStorage) {
      try {
        const parsed = JSON.parse(usuarioStorage);
        const token = parsed?.token;
        if (token) {
          config.headers["Authorization"] = "Bearer " + token;
        }
      } catch {
        // JSON corrupto en localStorage rompía todas las peticiones (pantalla en blanco tras login)
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
