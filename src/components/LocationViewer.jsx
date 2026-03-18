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

  return (
    <div className="location-viewer-container position-relative">
      <Image
        src={imageUrl}
        alt="Ubicación en Bodega"
        fluid
        className="w-100 d-block"
      />

      {/* Marcador de ubicación con animación de pulso (estilos en global.css) */}
      <div
        className="location-marker-pin"
        style={{ left: `${x}%`, top: `${y}%` }}
        title={`Ubicación: ${x}%, ${y}%`}
      />
    </div>
  );
};

export default LocationViewer;
