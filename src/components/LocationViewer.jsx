import React from "react";
import { Image, Alert } from "react-bootstrap";

const LocationViewer = ({ imageUrl, x, y }) => {
  if (!imageUrl) {
    return (
      <Alert variant="warning" className="text-center m-3">
        <i className="bi bi-geo-alt me-2"></i>
        Este insumo no tiene una ubicación fotográfica registrada.
      </Alert>
    );
  }

  // Estilos para el contenedor relativo
  const containerStyle = {
    position: "relative",
    display: "inline-block",
    width: "100%",
    border: "1px solid #dee2e6",
    borderRadius: "4px",
    overflow: "hidden",
    backgroundColor: "#f8f9fa",
  };

  // Estilos para el marcador (Pin)
  const pinStyle = {
    position: "absolute",
    left: `${x}%`,
    top: `${y}%`,
    width: "24px",
    height: "24px",
    backgroundColor: "#dc3545", // Rojo Bootstrap
    border: "2px solid white",
    borderRadius: "50%",
    transform: "translate(-50%, -50%)", // Centrar el pin en la coordenada exacta
    boxShadow: "0 2px 5px rgba(0,0,0,0.5)",
    zIndex: 10,
    animation: "pulse 2s infinite", // Animación opcional
  };

  // Estilos para la imagen
  const imageStyle = {
    width: "100%",
    height: "auto",
    display: "block",
  };

  return (
    <div style={containerStyle}>
      <Image
        src={imageUrl}
        alt="Ubicación en Bodega"
        style={imageStyle}
        fluid
      />

      {/* El Pin Rojo */}
      <div style={pinStyle} title={`Ubicación: ${x}%, ${y}%`} />

      {/* Estilos de animación embebidos */}
      <style>{`
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(220, 53, 69, 0.7); }
          70% { box-shadow: 0 0 0 10px rgba(220, 53, 69, 0); }
          100% { box-shadow: 0 0 0 0 rgba(220, 53, 69, 0); }
        }
      `}</style>
    </div>
  );
};

export default LocationViewer;
