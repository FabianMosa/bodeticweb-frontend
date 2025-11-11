// frontend/src/services/documento.service.js
import api from './api';

// Buscar un documento por su código
const getDocumentoByCodigo = async (codigo) => {
  try {
    const response = await api.get(`/documentos/buscar/${codigo}`);
    return response.data; // -------------------------------------Devuelve el documento encontrado
  } catch (error) {
    // Si da 404 (no encontrado), devolvemos null, no es un error
    if (error.response && error.response.status === 404) {
      return null; 
    }
    // Si es otro error, lo lanzamos
    console.error('Error en el servicio de buscar documento:', error.response.data);
    throw error.response.data;
  }
};

export default {
  getDocumentoByCodigo,
};