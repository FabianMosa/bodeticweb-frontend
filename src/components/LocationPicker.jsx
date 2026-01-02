import React, { useState, useRef, useEffect } from "react";
import { Button, Form, InputGroup, Modal } from "react-bootstrap";

const LocationPicker = ({ onLocationSelect, onImageSelect }) => {
  const [imagePreview, setImagePreview] = useState(null);
  const [marker, setMarker] = useState({ x: 0, y: 0 });
  const [fileName, setFileName] = useState("Sin archivo seleccionado");

  // Estados para la cámara
  const [showCamera, setShowCamera] = useState(false);
  const [cameraError, setCameraError] = useState(null);

  // Referencias
  const imageRef = useRef(null);
  const fileInputRef = useRef(null); // Input oculto para subir archivo
  const videoRef = useRef(null); // Elemento video para el stream
  const canvasRef = useRef(null); // Canvas para capturar la foto
  const streamRef = useRef(null); // Referencia al stream de medios

  // Limpieza al desmontar el componente
  useEffect(() => {
    return () => {
      stopCameraStream();
    };
  }, []);

  // Efecto para iniciar/detener la cámara según la visibilidad del modal
  useEffect(() => {
    if (showCamera) {
      startCameraStream();
    } else {
      stopCameraStream();
    }
  }, [showCamera]);

  const startCameraStream = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }, // Intenta usar la cámara trasera en móviles
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Error al acceder a la cámara:", err);
      setCameraError("No se pudo acceder a la cámara. Verifique los permisos.");
    }
  };

  const stopCameraStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  // Función unificada para procesar el archivo (sea subido o capturado)
  const processFile = (file) => {
    setFileName(file.name);
    setImagePreview(URL.createObjectURL(file));
    onImageSelect(file);
    setMarker(null);
  };

  // Manejador para subir archivo desde el input
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      processFile(file);
    }
  };

  // Capturar foto desde el video
  const handleCapturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      // Ajustar dimensiones del canvas al video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Dibujar el frame actual en el canvas
      const context = canvas.getContext("2d");
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Convertir a archivo
      canvas.toBlob(
        (blob) => {
          const file = new File([blob], "foto_captura.jpg", {
            type: "image/jpeg",
          });
          processFile(file);
          setShowCamera(false); // Cerrar modal
        },
        "image/jpeg",
        0.9
      );
    }
  };

  const handleTriggerFileClick = () => {
    fileInputRef.current.click();
  };

  const handleImageClick = (e) => {
    if (!imageRef.current) return;

    const rect = imageRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const xPercent = Math.round((x / rect.width) * 100);
    const yPercent = Math.round((y / rect.height) * 100);

    setMarker({ x: xPercent, y: yPercent });
    onLocationSelect({ x: xPercent, y: yPercent });
  };

  return (
    <div className="mb-3">
      <Form.Group controlId="formFile" className="mb-3">
        <Form.Label>Fotografía de Ubicación (Referencial)</Form.Label>

        {/* Input Oculto */}
        <Form.Control
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          ref={fileInputRef}
          style={{ display: "none" }}
        />

        {/* Botones de Acción */}
        <InputGroup>
          <Button
            variant="outline-primary"
            onClick={handleTriggerFileClick}
            title="Seleccionar archivo del dispositivo"
          >
            <i className="bi bi-upload me-2"></i>
            Subir
          </Button>
          <Button
            variant="outline-secondary"
            onClick={() => setShowCamera(true)}
            title="Usar cámara del dispositivo"
          >
            <i className="bi bi-camera-fill me-2"></i>
            Tomar Foto
          </Button>
          <Form.Control
            type="text"
            readOnly
            value={fileName}
            onClick={handleTriggerFileClick}
            style={{ cursor: "pointer", backgroundColor: "white" }}
          />
        </InputGroup>
        <Form.Text className="text-muted">
          Suba una imagen o tome una foto para marcar la ubicación.
        </Form.Text>
      </Form.Group>

      {/* Vista Previa y Marcador */}
      {imagePreview && (
        <div
          style={{
            position: "relative",
            display: "inline-block",
            border: "1px solid #dee2e6",
            borderRadius: "4px",
            padding: "5px",
            backgroundColor: "#fff",
            width: "100%",
          }}
        >
          <p className="text-primary small mb-2 fw-bold text-center">
            <i className="bi bi-crosshair me-1"></i>
            Haz clic en la imagen para marcar la ubicación exacta:
          </p>

          <div style={{ position: "relative", textAlign: "center" }}>
            <img
              ref={imageRef}
              src={imagePreview}
              alt="Ubicación"
              style={{
                maxWidth: "100%",
                maxHeight: "400px",
                display: "block",
                cursor: "crosshair",
                margin: "0 auto",
              }}
              onClick={handleImageClick}
            />
            {marker && (
              <div
                style={{
                  position: "absolute",
                  left: `${marker.x}%`,
                  top: `${marker.y}%`,
                  width: "24px",
                  height: "24px",
                  backgroundColor: "#dc3545",
                  borderRadius: "50%",
                  border: "2px solid white",
                  transform: "translate(-50%, -50%)",
                  pointerEvents: "none",
                  boxShadow: "0 2px 5px rgba(0,0,0,0.5)",
                  zIndex: 10,
                }}
              />
            )}
          </div>

          {marker && (
            <div className="text-success mt-2 small text-center fw-bold">
              <i className="bi bi-geo-alt-fill me-1"></i>
              Ubicación marcada: {marker.x}%, {marker.y}%
            </div>
          )}
        </div>
      )}

      {/* Modal para la Cámara */}
      <Modal
        show={showCamera}
        onHide={() => setShowCamera(false)}
        centered
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="bi bi-camera-fill me-2"></i>Capturar Ubicación
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center bg-dark p-0">
          {cameraError ? (
            <div className="text-white p-5">{cameraError}</div>
          ) : (
            <div
              style={{
                position: "relative",
                width: "100%",
                height: "100%",
                minHeight: "300px",
              }}
            >
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                style={{
                  width: "100%",
                  height: "auto",
                  maxHeight: "60vh",
                  display: "block",
                }}
              />
            </div>
          )}
          {/* Canvas oculto para procesar la imagen */}
          <canvas ref={canvasRef} style={{ display: "none" }} />
        </Modal.Body>
        <Modal.Footer className="justify-content-center">
          <Button variant="secondary" onClick={() => setShowCamera(false)}>
            Cancelar
          </Button>
          {!cameraError && (
            <Button variant="primary" onClick={handleCapturePhoto}>
              <i className="bi bi-camera me-2"></i>
              Capturar
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default LocationPicker;
