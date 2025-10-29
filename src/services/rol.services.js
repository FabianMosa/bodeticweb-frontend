
import api from './api';

const getRoles = async () => {
  try {
    const response = await api.get('/roles');
    return response.data;
  } catch (error) {
    console.error('Error en el servicio de obtener roles:', error.response.data);
    throw error.response.data;
  }
};

export default {
  getRoles,
};