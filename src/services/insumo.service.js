import api from './api'; 
const getInsumos = async (filtroActivo) => { 
   try {
    // 2. Envía el filtro como query param
    const response = await api.get('/insumos', {
      params: {
        activo: filtroActivo 
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error en el servicio de obtener insumos:', error.response.data);
    throw error.response.data;
  }
};

const getCategorias = async () => {
  try {
    const response = await api.get('/categorias');
    return response.data;
  } catch (error) {
    console.error('Error en el servicio de obtener categorías:', error.response.data);
    throw error.response.data;
  }
};

const getProveedores = async () => {
  try {
    const response = await api.get('/proveedores');
    return response.data;
  } catch (error) {
    console.error('Error en el servicio de obtener proveedores:', error.response.data);
    throw error.response.data;
  }
};

const createInsumo = async (insumoData) => {
  try {
    // insumoData será el objeto con { nombre, sku, stock_inicial, ... }
    const response = await api.post('/insumos', insumoData);
    return response.data;
  } catch (error) {
    console.error('Error en el servicio de crear insumo:', error.response.data);
    throw error.response.data;
  }
};

const getInsumoById = async (id) => {
  try {
    const response = await api.get(`/insumos/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error en el servicio de obtener insumo por ID:', error.response.data);
    throw error.response.data;
  }
};

const updateInsumo = async (id, insumoData) => {
  try {
    const response = await api.put(`/insumos/${id}`, insumoData);
    return response.data;
  } catch (error) {
    console.error('Error en el servicio de actualizar insumo:', error.response.data);
    throw error.response.data;
  }
};

const toggleActivo = async (id, nuevoEstado) => {
  try {
    const response = await api.put(`/insumos/${id}/toggle-activo`, { nuevoEstado });
    return response.data;
  } catch (error) {
    console.error('Error en el servicio de toggle activo:', error.response.data);
    throw error.response.data;
  }
};

const getInsumoBySku = async (sku) => {
  try {
    const response = await api.get(`/insumos/sku/${sku}`);
    return response.data;
  } catch (error) {
    // Si da 404 (no encontrado), no queremos que explote, solo que devuelva null
    if (error.response && error.response.status === 404) {
      return null; 
    }
    console.error('Error en el servicio de obtener insumo por SKU:', error.response.data);
    throw error.response.data;
  }
};

export default {
  getInsumos,
  getCategorias, 
  createInsumo,  
  getProveedores,
  getInsumoBySku,
  getInsumoById, 
  updateInsumo,
  toggleActivo
};