import api from "./api";

const getInsumos = async (filtros = {}, page = 1, limit = 9) => {
  try {
    // 1. Añadir filtros, page y limit a los parámetros
    const params = new URLSearchParams({
      activo: filtros.activo,
      categoria: filtros.categoria,
      search: filtros.search,
      page: page,
      limit: limit,
    }).toString();

    // 2. Limpiar parámetros vacíos (opcional pero limpio)
    const cleanParams = params.replace(/[^&]+=&/g, "").replace(/&[^&]+=$/g, "");

    const response = await api.get(`/insumos?${cleanParams}`);
    return response.data; // Devuelve { data: [...], pagination: {...} }
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
    // insumoData será el objeto con { nombre, sku, stock_inicial, ... }
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

const getInsumoBySku = async (sku) => {
  try {
    const response = await api.get(`/insumos/sku/${sku}`);
    return response.data;
  } catch (error) {
    // Si da 404 (no encontrado), no queremos que explote, solo que devuelva null
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
 * @param {number} id - ID del insumo
 * @param {FormData} formData - Objeto con 'coordenada_x', 'coordenada_y' e 'imagen_ubicacion' (file)
 */
const updateUbicacion = async (id, formData) => {
  try {
    const response = await api.put(`/insumos/${id}/ubicacion`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    console.error(
      "Error en el servicio de actualizar ubicación:",
      error.response?.data || error.message
    );
    throw error.response?.data || error;
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
  updateUbicacion, // Exportación de la nueva función
};