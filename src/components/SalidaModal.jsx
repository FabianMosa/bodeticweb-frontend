
import React, { useState } from 'react';
import movimientoService from '../services/movimiento.service';
import { useNotification } from '../context/NotificationContext';

// --- Estilos para el Modal (Tus estilos originales) ---
const modalOverlayStyles = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 1000,
};

const modalContentStyles = {
  backgroundColor: 'white',
  padding: '20px',
  borderRadius: '8px',
  width: '400px',
  boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
};

const inputStyles = { width: '95%', marginBottom: '10px', padding: '8px', fontSize: '16px' };
const buttonStyles = { padding: '10px', fontSize: '16px', border: 'none', cursor: 'pointer', borderRadius: '4px', marginRight: '10px' };
// --- Fin Estilos ---


const SalidaModal = ({ insumo, onClose, onSuccess }) => {
  
  // ---------------------------------------------"CANNOT READ PROPERTIES OF NULL" ---
  // Añadimos esta "Guardia". Si el 'insumo' es nulo
  // (porque el modal se está cerrando), no renderizar nada.
  // Esto previene el error "Cannot read properties of null (reading 'nombre')"
  if (!insumo) {
    return null;
  }
  // --- FIN DE LA CORRECCIÓN 1 ---

  // Estado local para el formulario del modal
  const [cantidad, setCantidad] = useState(1);
  const [codigo_ot, setCodigo_ot] = useState('');
  const [tipo_movimiento, setTipo_movimiento] = useState('Salida-Uso');
  const [loading, setLoading] = useState(false);
  const [descripcion, setDescripcion] = useState(''); // Estado para la descripción
  const { showNotification } = useNotification();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const salidaData = {
        id_insumo: insumo.PK_id_insumo,
        cantidad: parseInt(cantidad, 10),
        tipo_movimiento,
        codigo_ot,
        descripcion 
      };
 
      const response = await movimientoService.registrarSalida(salidaData);

      // -------------------------------------------------"NO SE CIERRA" ---
      // Reemplazamos el 'alert()' (que bloquea el código)
      // por la notificación global.
      // alert(response.message);
      showNotification(response.message, 'success'); // <-- ESTA ES LA SOLUCIÓN

      // Ahora estas líneas SÍ se ejecutarán inmediatamente
      onSuccess(insumo.PK_id_insumo, response.nuevo_stock); // Actualiza la tabla
      onClose(); // Cierra el modal     

    } catch (err) {
      // Mostramos el error en nuestro modal de notificación global
      showNotification(err.message || 'Error al registrar la salida', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    
    <div style={modalOverlayStyles} onClick={onClose}>
      <div style={modalContentStyles} onClick={(e) => e.stopPropagation()}>
        <h2 style={{marginTop: 0}} className='text-center'>Registrar Salida</h2>
        <br />
        <p><strong>Insumo:</strong> {insumo.nombre}</p>
        <p style={{color: '#555'}}><strong>Stock Actual:</strong> {insumo.stock_actual}</p>
        
        <form onSubmit={handleSubmit}>
          {/* Tipo de Movimiento */}
          <div style={{ marginBottom: '15px' }}>
            <label>
              <input 
                type="radio" 
                value="Salida-Uso"
                checked={tipo_movimiento === 'Salida-Uso'}
                onChange={(e) => setTipo_movimiento(e.target.value)}
              /> Uso
            </label>
            <label style={{ marginLeft: '20px' }}>
              <input 
                type="radio" 
                value="Préstamo"
                checked={tipo_movimiento === 'Préstamo'}
                onChange={(e) => setTipo_movimiento(e.target.value)}
              /> Préstamo
            </label>
          </div>

          {/* N° Hoja de Terreno (OT) */}
          <label>
            N° Hoja de Terreno (OT)
            {tipo_movimiento === 'Salida-Uso' ? 
              <span style={{color: 'red'}}>*</span> : 
              <span style={{color: 'grey'}}> (Opcional)</span>
            }
          </label>
          <input 
            type="text"
            value={codigo_ot}
            onChange={(e) => setCodigo_ot(e.target.value)}
            style={inputStyles}
            required={tipo_movimiento === 'Salida-Uso'} // Lógica de 'required'
          />
          
          {/* Cantidad */}
          <label>Cantidad:</label>
          <input 
            type="number"
            value={cantidad}
            onChange={(e) => setCantidad(e.target.value)}
            min="1"
            max={insumo.stock_actual}
            style={inputStyles}
            required
          />
          
          {/* ------------------------------------------ CAMPO DE DESCRIPCIÓN AÑADIDO --- */}
          <label>Detalle (Opcional):</label>
          <input
            type="text"
            placeholder="A quién se entrega, motivo..."
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            style={inputStyles}
          />
         
          <div style={{ marginTop: '20px', textAlign: 'right' }}>
            <button type="button" onClick={onClose} style={{...buttonStyles, backgroundColor: '#6c757d', color: 'white'}}>
              Cancelar
            </button>
            <button type="submit" disabled={loading} style={{...buttonStyles, backgroundColor: '#007bff', color: 'white'}}>
              {loading ? 'Registrando...' : 'Confirmar Salida'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SalidaModal;