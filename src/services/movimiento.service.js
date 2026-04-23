import api from "./api"; // Importamos la instancia de Axios

/**
 * Registra una salida (Uso o Préstamo)
 * @param {object} salidaData - { id_insumo, cantidad, tipo_movimiento, codigo_ot }
 */
const registrarSalida = async (salidaData) => {
  try {
    // Llamamos al endpoint del backend que creamos
    const response = await api.post("/movimientos/salida", salidaData);
    return response.data;
  } catch (error) {
    console.error(
      "Error en el servicio de registrar salida:",
      error.response.data
    );
    // Propagamos el error para que el componente lo pueda mostrar
    throw error.response.data;
  }
};

// Registrar una devolución (solo Admin)
const registrarDevolucion = async (devolucionData) => {
  try {
    // devolucionData = { id_insumo, cantidad_devuelta, id_usuario_tecnico }
    const response = await api.post("/movimientos/devolucion", devolucionData);
    return response.data;
  } catch (error) {
    console.error(
      "Error en el servicio de registrar devolución:",
      error.response.data
    );
    throw error.response.data;
  }
};

const getPrestamosActivos = async () => {
  try {
    const response = await api.get("/movimientos/prestamos");
    return response.data;
  } catch (error) {
    console.error(
      "Error en el servicio de obtener préstamos:",
      error.response.data
    );
    throw error.response.data;
  }
};

/**
 * Obtiene el historial de movimientos filtrado.
 * @param {object} filtros - { fecha_inicio, fecha_fin, id_insumo, id_usuario, tipo_movimiento }
 */
const getHistorial = async (filtros = {}, page = 1, limit = 10) => {
  try {
    // Normalizamos strings para evitar filtros con espacios al inicio/fin.
    const filtrosNormalizados = Object.fromEntries(
      Object.entries(filtros).map(([key, value]) => [
        key,
        typeof value === "string" ? value.trim() : value,
      ])
    );

    // -------------------------------------Añadir page y limit a los filtros
    const params = new URLSearchParams({
      ...filtrosNormalizados,
      page: page,
      limit: limit,
    }).toString();

    const response = await api.get(`/movimientos/historial?${params}`);
    return response.data; // Esto ahora es { data: [...], pagination: {...} }
  } catch (error) {
    console.error(
      "Error en el servicio de obtener historial:",
      error.response.data
    );
    throw error.response.data;
  }
};

// -------------------------------------------------FUNCIÓN PARA EL EXCEL ---
const getHistorialExcel = async (filtros = {}) => {
  try {
    // --- 1. ESTA ES LA CORRECCIÓN ---
    // Creamos una COPIA de los filtros y añadimos el formato
    const filtrosParaExcel = {
      ...filtros, // Copia todas las propiedades de 'filtros'
      formato: "excel", // Añade la propiedad 'formato'
    };
    // El 'filtros' original NUNCA se modifica
    // --- FIN DE LA CORRECCIÓN ---

    // 2. Usamos la copia para generar los parámetros
    const params = new URLSearchParams(filtrosParaExcel).toString();

    const response = await api.get(`/movimientos/historial?${params}`, {
      responseType: "blob",
    });

    // (Tu lógica de manejo de errores de blob aquí)
    if (response.data.type === "application/json") {
      const errorText = await response.data.text();
      const errorJson = JSON.parse(errorText);
      throw new Error(
        errorJson.message || "Error en el backend al generar Excel"
      );
    }

    // (Tu lógica de descarga de archivo aquí)
    const url = window.URL.createObjectURL(
      new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      })
    );
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "Reporte_BodeTIC.xlsx");
    document.body.appendChild(link);
    link.click();
    link.remove();
  } catch (error) {
    console.error("Error al descargar el Excel:", error);
    throw error;
  }
};

export default {
  registrarSalida,
  registrarDevolucion,
  getPrestamosActivos,
  getHistorial,
  getHistorialExcel,
};
