
import api from './api'; // Importamos la instancia de Axios

/**
 * Registra una salida (Uso o Préstamo)
 * @param {object} salidaData - { id_insumo, cantidad, tipo_movimiento, codigo_ot }
 */
const registrarSalida = async (salidaData) => {
  try {
    // Llamamos al endpoint del backend que creamos
    const response = await api.post('/movimientos/salida', salidaData);
    return response.data;
  } catch (error) {
    console.error('Error en el servicio de registrar salida:', error.response.data);
    // Propagamos el error para que el componente lo pueda mostrar
    throw error.response.data;
  }
};

// Registrar una devolución (solo Admin)
const registrarDevolucion = async (devolucionData) => {
  try {
    // devolucionData = { id_insumo, cantidad_devuelta, id_usuario_tecnico }
    const response = await api.post('/movimientos/devolucion', devolucionData);
    return response.data;
  } catch (error) {
    console.error('Error en el servicio de registrar devolución:', error.response.data);
    throw error.response.data;
  }
};

const getPrestamosActivos = async () => {
  try {
    const response = await api.get('/movimientos/prestamos');
    return response.data;
  } catch (error) {
    console.error('Error en el servicio de obtener préstamos:', error.response.data);
    throw error.response.data;
  }
};

/**
 * Obtiene el historial de movimientos filtrado.
 * @param {object} filtros - { fecha_inicio, fecha_fin, id_insumo, id_usuario, tipo_movimiento }
 */
const getHistorial = async (filtros = {}) => {
  try {
    // Convertimos el objeto de filtros a query string
    const params = new URLSearchParams(filtros).toString();
    
    const response = await api.get(`/movimientos/historial?${params}`);
    return response.data;
  } catch (error) {
    console.error('Error en el servicio de obtener historial:', error.response.data);
    throw error.response.data;
  }
};

// --- AÑADIR ESTA FUNCIÓN PARA EL EXCEL ---
const getHistorialExcel = async (filtros = {}) => {
  try {
    filtros.formato = 'excel'; // Añadimos el parámetro especial
    const params = new URLSearchParams(filtros).toString();
    
    const response = await api.get(`/movimientos/historial?${params}`, {
      responseType: 'blob', // 1. Le decimos a Axios que esperamos un archivo
    });
    
    // --- 2. LA CORRECCIÓN ESTÁ AQUÍ ---
    // response.data ya ES el blob. No lo envolvemos en new Blob([]).
    const url = window.URL.createObjectURL(response.data); 
    
    // 3. (El resto del código de descarga es correcto)
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'Reporte_BodeTIC.xlsx');
    document.body.appendChild(link);
    link.click();
    
    // 4. Limpiar
    link.remove();
    window.URL.revokeObjectURL(url);
    
  } catch (error) {
    // Si el backend falló y envió un error JSON (en lugar de un blob),
    // necesitamos leer ese error.
    if (error.response && error.response.data.toString() === "[object Blob]") {
        try {
            // Intentamos leer el blob como texto (que contiene el error JSON)
            const errorJson = JSON.parse(await error.response.data.text());
            console.error('Error (JSON) al descargar el Excel:', errorJson);
            throw errorJson; // Lanzamos el error legible
        } catch (e) {
            console.error('Error al parsear el blob de error:', e);
            throw new Error('Ocurrió un error desconocido al generar el reporte.');
        }
    } else {
       console.error('Error al descargar el Excel:', error);
       throw error.response ? error.response.data : new Error('Error de red');
    }
  }
};

export default {
  registrarSalida,
  registrarDevolucion,
  getPrestamosActivos,
  getHistorial,
  getHistorialExcel,
};