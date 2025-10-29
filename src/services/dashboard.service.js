
import api from './api';

const getAlertas = async () => {
  try {
    // Llama al endpoint de alertas
    const response = await api.get('/dashboard/alertas');
    return response.data;
  } catch (error) {
    console.error('Error en el servicio de obtener alertas:', error.response.data);
    throw error.response.data;
  }
};

export default {
  getAlertas,
};