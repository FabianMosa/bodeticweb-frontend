import React, { useState, useEffect, useRef } from "react";
import { Modal, Button, Alert } from "react-bootstrap";

const ScannerModal = ({ onClose, onScanSuccess }) => {
  const [error, setError] = useState(null);
  const [status, setStatus] = useState("Iniciando cámara...");
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    // ---VERIFICACIÓN DE COMPATIBILIDAD---
    if (!("BarcodeDetector" in window)) {
      setError(
        "Escáner no compatible. Esta función solo está disponible en navegadores móviles (como Chrome en Android) o en versiones de escritorio con las funciones experimentales activadas."
      );
      setStatus("Error");
      return;
    }
    const detector = new window.BarcodeDetector({
      formats: [
        "code_128",
        "code_39",
        "ean_13",
        "ean_8",
        "upc_a",
        "upc_e",
        "qr_code",
      ],
    });

    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "environment",
            focusMode: "continuous",
            width: { ideal: 640 },
            height: { ideal: 480 },
          },
        });

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          setStatus("Cámara activa. Buscando código...");

          intervalRef.current = setInterval(async () => {
            if (!videoRef.current || videoRef.current.readyState < 2) return;
            try {
              const barcodes = await detector.detect(videoRef.current);
              if (barcodes.length > 0) {
                clearInterval(intervalRef.current);
                onScanSuccess(barcodes[0].rawValue);
                onClose();
              }
            } catch (detectError) {
              console.warn("Fallo de detección (normal):", detectError);
            }
          }, 500);
        }
      } catch (camError) {
        console.error("Error de cámara:", camError);
        if (camError.name === "NotAllowedError") {
          setError(
            "Permiso de cámara denegado. Revise la configuración de su navegador."
          );
        } else {
          setError(`Error al acceder a la cámara: ${camError.message}`);
        }
        setStatus("Error");
      }
    };

    startCamera();

    // Función de Limpieza
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [onClose, onScanSuccess]);

  return (
    <Modal show={true} onHide={onClose} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>
          <i className="bi bi-upc-scan me-2"></i>Escanear SKU
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="text-center">
        <p className="text-muted">Apunta la cámara al código de barras</p>

        <video ref={videoRef} className="scanner-video" muted playsInline />

        {error ? (
          <Alert variant="danger" className="mt-3">
            {error}
          </Alert>
        ) : (
          <p className="mt-3">
            <em>{status}</em>
          </p>
        )}
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
          background: #333;
        }
      `}</style>
    </Modal>
  );
};

export default ScannerModal;
