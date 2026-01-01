import React, { useState, useRef } from "react";
import { Button, Form } from "react-bootstrap";

const LocationPicker = ({ onLocationSelect, onImageSelect }) => {
  const [imagePreview, setImagePreview] = useState(null);
  const [marker, setMarker] = useState({ x: 0, y: 0 }); // En porcentajes
  const imageRef = useRef(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImagePreview(URL.createObjectURL(file));
      onImageSelect(file); // Pasamos el archivo al padre
      setMarker(null); // Resetear marcador
    }
  };

  const handleImageClick = (e) => {
    if (!imageRef.current) return;

    const rect = imageRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left; // X relativo a la imagen
    const y = e.clientY - rect.top; // Y relativo a la imagen

    // Convertir a porcentajes para que sea responsivo
    const xPercent = Math.round((x / rect.width) * 100);
    const yPercent = Math.round((y / rect.height) * 100);

    setMarker({ x: xPercent, y: yPercent });
    onLocationSelect({ x: xPercent, y: yPercent }); // Pasamos coords al padre
  };

  return (
    <div className="mb-3">
      <Form.Group controlId="formFile" className="mb-3">
        <Form.Label>Fotografía de Ubicación (Referencial)</Form.Label>
        <Form.Control
          type="file"
          accept="image/*"
          onChange={handleImageChange}
        />
      </Form.Group>

      {imagePreview && (
        <div
          style={{
            position: "relative",
            display: "inline-block",
            border: "2px solid #ccc",
          }}
        >
          <p className="text-muted small mb-1">
            Haz clic en la imagen para marcar la ubicación exacta:
          </p>
          <div style={{ position: "relative" }}>
            <img
              ref={imageRef}
              src={imagePreview}
              alt="Ubicación"
              style={{
                maxWidth: "100%",
                maxHeight: "400px",
                display: "block",
                cursor: "crosshair",
              }}
              onClick={handleImageClick}
            />
            {marker && (
              <div
                style={{
                  position: "absolute",
                  left: `${marker.x}%`,
                  top: `${marker.y}%`,
                  width: "20px",
                  height: "20px",
                  backgroundColor: "red",
                  borderRadius: "50%",
                  border: "2px solid white",
                  transform: "translate(-50%, -50%)",
                  pointerEvents: "none", // Para que no interfiera con el clic
                  boxShadow: "0 0 5px rgba(0,0,0,0.5)",
                }}
              />
            )}
          </div>
          {marker && (
            <div className="text-success mt-1 small">
              Ubicación marcada: {marker.x}%, {marker.y}%
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LocationPicker;
