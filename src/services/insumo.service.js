import api from "./api";

const getInsumos = async (filtros = {}, page = 1, limit = 9) => {
  try {
    const params = new URLSearchParams({
      activo: filtros.activo,
      categoria: filtros.categoria,
      search: filtros.search,
      page: page,
      limit: limit,
    }).toString();

    const cleanParams = params.replace(/[^&]+=&/g, "").replace(/&[^&]+=$/g, "");

    const response = await api.get(`/insumos?${cleanParams}`);
    return response.data;
  } catch (error) {
    console.error(
      "Error en el servicio de obtener insumos:",
      error.response?.data || error.message
    );
    throw error.response?.data || error;
  }
};

const getCategorias = async () => {
  try {
    const response = await api.get("/categorias");
    return response.data;
  } catch (error) {
    console.error(
      "Error en el servicio de obtener categorías:",
      error.response?.data || error.message
    );
    throw error.response?.data || error;
  }
};

const getProveedores = async () => {
  try {
    const response = await api.get("/proveedores");
    return response.data;
  } catch (error) {
    console.error(
      "Error en el servicio de obtener proveedores:",
      error.response?.data || error.message
    );
    throw error.response?.data || error;
  }
};

const createInsumo = async (insumoData) => {
  try {
    const response = await api.post("/insumos", insumoData);
    return response.data;
  } catch (error) {
    console.error("Error en el servicio de crear insumo:", error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

const getInsumoById = async (id) => {
  try {
    const response = await api.get(`/insumos/${id}`);
    return response.data;
  } catch (error) {
    console.error(
      "Error en el servicio de obtener insumo por ID:",
      error.response?.data || error.message
    );
    throw error.response?.data || error;
  }
};

const updateInsumo = async (id, insumoData) => {
  try {
    const response = await api.put(`/insumos/${id}`, insumoData);
    return response.data;
  } catch (error) {
    console.error(
      "Error en el servicio de actualizar insumo:",
      error.response?.data || error.message
    );
    throw error.response?.data || error;
  }
};

const toggleActivo = async (id, nuevoEstado) => {
  try {
    const response = await api.put(`/insumos/${id}/toggle-activo`, {
      nuevoEstado,
    });
    return response.data;
  } catch (error) {
    console.error(
      "Error en el servicio de toggle activo:",
      error.response?.data || error.message
    );
    throw error.response?.data || error;
  }
};

/** Retira el insumo de la app (papelera); la fila y el historial permanecen en BD. */
const ocultarDeApp = async (id) => {
  try {
    const response = await api.put(`/insumos/${id}/ocultar-app`);
    return response.data;
  } catch (error) {
    console.error(
      "Error al retirar insumo de la aplicación:",
      error.response?.data || error.message
    );
    throw error.response?.data || error;
  }
};

const getInsumoBySku = async (sku) => {
  try {
    const response = await api.get(`/insumos/sku/${sku}`);
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return null;
    }
    console.error(
      "Error en el servicio de obtener insumo por SKU:",
      error.response?.data || error.message
    );
    throw error.response?.data || error;
  }
};

/**
 * Actualiza la ubicación (coordenadas e imagen) de un insumo.
 * CORRECCIÓN: Se eliminó el header Content-Type manual. 
 * Axios lo generará automáticamente con el boundary correcto al detectar FormData.
 */
const updateUbicacion = async (id, formData) => {
  try {
    const response = await api.put(`/insumos/${id}/ubicacion`, formData);
    return response.data;
  } catch (error) {
    console.error(
      "Error en el servicio de actualizar ubicación:",
      error.response?.data || error.message
    );
    // Devolvemos un objeto con mensaje para que el frontend pueda mostrarlo
    throw error.response?.data || { message: error.message || "Error de conexión" };
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
  toggleActivo,
  ocultarDeApp,
  updateUbicacion,
};