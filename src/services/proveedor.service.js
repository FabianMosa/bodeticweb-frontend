
import api from './api';

const getProveedores = async () => {
  try {
    const response = await api.get('/proveedores');
    return response.data;
  } catch (error) {
    console.error('Error en el servicio de obtener proveedores:', error.response.data);
    throw error.response.data;
  }
};

export default {
  getProveedores,
};