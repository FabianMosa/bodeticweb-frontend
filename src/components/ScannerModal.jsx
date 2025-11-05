// frontend/src/components/ScannerModal.jsx
import React, { useState } from 'react';
import { useZxing } from 'react-zxing';
import{Modal,Button,Alert, Container} from 'react-bootstrap';
import { DecodeHintType } from '@zxing/library';
//----------------------------------------------------------
/**
 * @param {object} props
 * @param {function} props.onClose - Función para cerrar el modal
 * @param {function} props.onScanSuccess - Función que se llama con el SKU encontrado
 */
const ScannerModal = ({ onClose, onScanSuccess }) => {
  const [scanStatus, setScanStatus] = useState('Buscando código...');
  const [error, setError] = useState(null);

  const hints = new Map();
  const formats = [
    DecodeHintType.QR_CODE,
    DecodeHintType.CODE_128,
    DecodeHintType.CODE_39,
    DecodeHintType.EAN_13,
    DecodeHintType.EAN_8,
    DecodeHintType.UPC_A,
    DecodeHintType.UPC_E,
    // ... puedes añadir más si es necesario
  ];

  hints.set(DecodeHintType.POSSIBLE_FORMATS, formats);
  const { ref } = useZxing({
    // --- 1. LA SOLUCIÓN: FORZAR EL ENFOQUE AUTOMÁTICO ---
    // Le pedimos al navegador que use la cámara trasera (environment)
    // y que active el modo de enfoque continuo.
    constraints: { 
      video: { 
        facingMode: 'environment',
        focusMode: 'continuous' 
      } 
    },
    // --- Fin de la Solución ---
hints,
    onResult(result) {
      const sku = result.getText();
      setScanStatus(`SKU Encontrado: ${sku}`);
      
      // Llamamos a la función del padre con el SKU
      onScanSuccess(sku);
      
      // Cerramos el modal
      onClose();
    },
    onError(error) {
      console.error("Error de ZXing:", error);
      // --- 2. MEJORA: MOSTRAR ERRORES EN LA UI ---
      // Si la cámara falla, lo mostramos al usuario
      setError(error.message || 'Error al iniciar la cámara.');
      setScanStatus('Error');
    }
  });

  return (
    // 3. REFACTORIZAR A MODAL DE REACT-BOOTSTRAP
   
      <Modal show={true} onHide={onClose} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="bi bi-upc-scan me-2"></i>Escanear SKU
          </Modal.Title>
        </Modal.Header>
      <Modal.Body className="text-center">
        
        <p className="text-muted">Apunta la cámara al código de barras del insumo</p>
        
        {/* Aquí es donde la librería 'react-zxing' activa la cámara */}
        <video 
          ref={ref} 
          className="scanner-video"
        />
        
        {/* Mostrar el estado o el error */}
        {!error && <p className="mt-3"><em>{scanStatus}</em></p>}
        {error && <Alert variant="danger" className="mt-3">{error}</Alert>}

      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Cancelar
        </Button>
      </Modal.Footer>

      {/*---------------ESTILOS (El video necesita un tamaño) */}
      <style>{`
        .scanner-video {
          width: 100%;
          border-radius: 8px;
          border: 1px solid #dee2e6;
        }
      `}</style>
    </Modal>
    
  );
};

export default ScannerModal;