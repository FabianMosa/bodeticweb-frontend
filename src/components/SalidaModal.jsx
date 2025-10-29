// frontend/src/components/SalidaModal.jsx
import React, { useState } from 'react';
import movimientoService from '../services/movimiento.service';

// --- Estilos para el Modal (Pop-up) ---
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


/**
 * @param {object} props
 * @param {object} props.insumo - El insumo seleccionado { PK_id_insumo, nombre, stock_actual }
 * @param {function} props.onClose - Función para cerrar el modal
 * @param {function} props.onSuccess - Función a ejecutar si la salida es exitosa
 */
const SalidaModal = ({ insumo, onClose, onSuccess }) => {
  // Estado local para el formulario del modal
  const [cantidad, setCantidad] = useState(1);
  const [codigo_ot, setCodigo_ot] = useState('');
  const [tipo_movimiento, setTipo_movimiento] = useState('Salida-Uso'); // Valor por defecto
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const salidaData = {
        id_insumo: insumo.PK_id_insumo,
        cantidad: parseInt(cantidad, 10),
        tipo_movimiento, // 'Salida-Uso' o 'Préstamo'
        codigo_ot
      };

      // Llamamos al servicio
      const response = await movimientoService.registrarSalida(salidaData);

      alert(response.message);
      onSuccess(insumo.PK_id_insumo, response.nuevo_stock); // Pasa el ID y el nuevo stock a la página padre
      onClose(); // Cierra el modal

    } catch (err) {
      // Mostramos el error del backend (ej. "Stock insuficiente")
      setError(err.message || 'Error al registrar la salida');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={modalOverlayStyles} onClick={onClose}>
      <div style={modalContentStyles} onClick={(e) => e.stopPropagation()}>
        <h2 style={{marginTop: 0}}>Registrar Salida</h2>
        <p><strong>Insumo:</strong> {insumo.nombre}</p>
        <p style={{color: '#555'}}><strong>Stock Actual:</strong> {insumo.stock_actual}</p>
        
        <form onSubmit={handleSubmit}>
          {/* Tipo de Movimiento (RF-04 vs RF-05) */}
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

          <label>N° Hoja de Terreno (OT):</label>
          <input 
            type="text"
            value={codigo_ot}
            onChange={(e) => setCodigo_ot(e.target.value)}
            style={inputStyles}
            required 
          />
          
          <label>Cantidad:</label>
          <input 
            type="number"
            value={cantidad}
            onChange={(e) => setCantidad(e.target.value)}
            min="1"
            max={insumo.stock_actual} // No permite poner más del stock
            style={inputStyles}
            required
          />

          {error && <p style={{ color: 'red' }}>{error}</p>}
          
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