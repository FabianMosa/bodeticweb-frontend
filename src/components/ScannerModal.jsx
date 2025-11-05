
import React, { useState } from 'react';
import { Modal, Button, Alert, Spinner } from 'react-bootstrap';

// 1. Importar la librería original (Plan A)
import { useZxing } from 'react-zxing'; 
// 2. Importar los "formatos" (hints) desde la librería @zxing/library
import { DecodeHintType } from '@zxing/library';

const ScannerModal = ({ onClose, onScanSuccess }) => {
  const [error, setError] = useState(null);

  // 3. DEFINIR LOS FORMATOS QUE QUEREMOS BUSCAR
  // Esta es la clave que faltaba: le decimos a ZXing
  // que no solo busque QR, sino también códigos de barras 1D.
  const hints = new Map();
  const formats = [
    DecodeHintType.CODE_128,
    DecodeHintType.CODE_39,
    DecodeHintType.EAN_13,
    DecodeHintType.EAN_8,
    DecodeHintType.UPC_A,
    DecodeHintType.UPC_E,
    DecodeHintType.QR_CODE, // Aún queremos leer QRs
  ];
  hints.set(DecodeHintType.POSSIBLE_FORMATS, formats);
  // También le pedimos que intente con más esfuerzo
  hints.set(DecodeHintType.TRY_HARDER, true);

  const { ref } = useZxing({
    // 4. PASAR LOS HINTS A LA CONFIGURACIÓN
    hints,

    constraints: { 
      video: { 
        facingMode: 'environment', // Usar cámara trasera
        focusMode: 'continuous'  // Forzar auto-enfoque
      } 
    },
    
    onResult(result) {
      const sku = result.getText();
      onScanSuccess(sku);
      onClose();
    },
    onError(error) {
      console.error("Error de ZXing:", error);
      setError(error);
    }
  });

  return (
    <Modal show={true} onHide={onClose} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>
          <i className="bi bi-upc-scan me-2"></i>Escanear SKU
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="text-center">
        <p className="text-muted">Apunta la cámara al código de barras</p>

        {error && (
          <Alert variant="danger" className="mt-3">
            Error al iniciar la cámara: {error.message}
          </Alert>
        )}

        {/* El <video> donde se muestra la cámara */}
        <video 
          ref={ref} 
          className="scanner-video"
        />

      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Cancelar
        </Button>
      </Modal.Footer>

      {/* Estilos */}
      <style>{`
        .scanner-video {
          width: 100%;
          max-width: 600px;
          height: auto;
          border-radius: 8px;
          border: 1px solid #dee2e6;
        }
      `}</style>
    </Modal>
  );
};

export default ScannerModal;