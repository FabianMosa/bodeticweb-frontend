// frontend/src/components/ScannerModal.jsx
import React, { useState } from 'react';
import { useZxing } from 'react-zxing';

// (Estilos del modal, copiados de SalidaModal)
const modalOverlayStyles = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  backgroundColor: 'rgba(0, 0, 0, 0.7)', // Más oscuro
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 1000,
};

const modalContentStyles = {
  backgroundColor: 'white',
  padding: '20px',
  borderRadius: '8px',
  width: '90%',
  maxWidth: '500px',
  textAlign: 'center'
};

/**
 * @param {object} props
 * @param {function} props.onClose - Función para cerrar el modal
 * @param {function} props.onScanSuccess - Función que se llama con el SKU encontrado
 */
const ScannerModal = ({ onClose, onScanSuccess }) => {
  const [scanStatus, setScanStatus] = useState('Buscando código...');

  const { ref } = useZxing({
    onResult(result) {
      const sku = result.getText();
      setScanStatus(`SKU Encontrado: ${sku}`);
      // Llamamos a la función del padre con el SKU
      onScanSuccess(sku);
      // Cerramos el modal
      onClose();
    },
    onError(error) {
      console.error(error);
      setScanStatus('Error al iniciar la cámara.');
    }
  });

  return (
    <div style={modalOverlayStyles} onClick={onClose}>
      <div style={modalContentStyles} onClick={(e) => e.stopPropagation()}>
        <h2 style={{ marginTop: 0 }}>Escanear SKU</h2>
        <p>Apunta la cámara al código de barras del insumo</p>
        
        {/* Aquí es donde la librería 'react-zxing' activa la cámara */}
        <video 
          ref={ref} 
          style={{ width: '100%', borderRadius: '8px', border: '1px solid grey' }}
        />
        
        <p><em>{scanStatus}</em></p>
        <button onClick={onClose} style={{ padding: '10px 20px' }}>
          Cancelar
        </button>
      </div>
    </div>
  );
};

export default ScannerModal;