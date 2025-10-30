
import api from './api';

const getAlertas = async () => {
  try {
    // Llama al endpoint de alertas
    const response = await api.get('/dashboard/alertas');
    return response.data;
  } catch (error) {
  let errorMessage = 'Error desconocido';
  if (error.response && error.response.data && error.response.data.message) {
    // El error vino del backend (ej. 401, 404, 500)
    errorMessage = error.response.data.message;
  } else if (error.message) {
    // El error es de red (CORS, URL mal, backend caído, ERR_CONNECTION_REFUSED)
    errorMessage = error.message;
  }
  
  console.error('Error en el servicio:', errorMessage);
  // Siempre lanza el error para que el componente de la página lo atrape
  throw new Error(errorMessage);
}
}

export default {
  getAlertas,
};