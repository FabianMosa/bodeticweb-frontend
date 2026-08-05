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

/**
 * Descarga el inventario actual en formato Excel respetando los filtros aplicados
 * (estado activo, categoría y búsqueda por nombre). Genera y dispara la descarga del archivo.
 * @param {object} filtros - { activo, categoria, search } filtros actuales del listado.
 * @returns {Promise<void>} Resuelve cuando la descarga fue disparada.
 */
const getInsumosExcel = async (filtros = {}) => {
  try {
    const params = new URLSearchParams({
      activo: filtros.activo,
      categoria: filtros.categoria,
      search: filtros.search,
    }).toString();

    const clean_params = params
      .replace(/[^&]+=&/g, "")
      .replace(/&[^&]+=$/g, "");

    const response = await api.get(`/insumos/export?${clean_params}`, {
      responseType: "blob",
    });

    // El backend puede responder un JSON de error aún pidiendo blob; lo detectamos.
    if (response.data.type === "application/json") {
      const error_text = await response.data.text();
      const error_json = JSON.parse(error_text);
      throw new Error(
        error_json.message || "Error en el servidor al generar el Excel"
      );
    }

    const url = window.URL.createObjectURL(
      new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      })
    );
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "Inventario_BodeTIC.xlsx");
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error(
      "Error en el servicio de exportar inventario:",
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
  getInsumosExcel,
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