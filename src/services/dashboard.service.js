
import api from './api';

const getAlertas = async () => {
  try {
    // Llama al endpoint de alertas
    const response = await api.get('/dashboard/alertas');
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
}

export default {
  getAlertas,
};