import React from "react";
import { Modal, Button } from "react-bootstrap";
import { useNotification } from "../context/NotificationContext";

const NotificationModal = () => {
  const { notification, hideNotification } = useNotification();

  // Si no hay notificación, no renderizar nada
  if (!notification) {
    return null;
  }

  const isError = notification.type === "error";

  // Configuración de estilos según el tipo
  const config = isError
    ? {
        variant: "danger",
        icon: "bi-x-circle", // O bi-exclamation-triangle
        title: "¡Atención!",
        btnVariant: "outline-danger",
        iconColor: "text-danger",
        bgColor: "bg-danger-subtle", // Bootstrap 5.3+ variable
      }
    : {
        variant: "success",
        icon: "bi-check-circle",
        title: "¡Operación Exitosa!",
        btnVariant: "success",
        iconColor: "text-success",
        bgColor: "bg-success-subtle",
      };

  return (
    <Modal
      show={true}
      onHide={hideNotification}
      centered
      backdrop="static"
      keyboard={false}
      contentClassName="border-0 shadow-lg rounded-4 overflow-hidden" // Bordes redondeados y sombra profunda
    >
      {/* Botón de cerrar superior derecho (sutil) */}
      <div className="position-absolute top-0 end-0 p-3 z-1">
        <button
          type="button"
          className="btn-close"
          aria-label="Close"
          onClick={hideNotification}
        ></button>
      </div>

      <Modal.Body className="p-0 text-center">
        {/* Sección Superior: Icono y Fondo suave */}
        <div className={`py-5 ${config.bgColor}`}>
          <i
            className={`bi ${config.icon} display-1 ${config.iconColor} icon-animate`}
          ></i>
        </div>

        {/* Sección Inferior: Texto y Acción */}
        <div className="p-4 px-md-5">
          <h3 className={`fw-bold mb-3 ${config.iconColor}`}>{config.title}</h3>

          <p className="text-muted fs-5 mb-4 text-break">
            {notification.message}
          </p>

          <div className="d-grid">
            <Button
              variant={config.btnVariant}
              size="lg"
              onClick={hideNotification}
              className="rounded-pill fw-bold"
            >
              Entendido
            </Button>
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default NotificationModal;
