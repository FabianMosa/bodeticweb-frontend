// frontend/src/components/NotificationModal.jsx
import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import { useNotification } from '../context/NotificationContext'; // Importamos nuestro hook

const NotificationModal = () => {
  const { notification, hideNotification } = useNotification();

  // Si no hay notificación, no renderizar nada
  if (!notification) {
    return null;
  }

  const isError = notification.type === 'error';
  const headerClass = isError ? 'bg-danger text-white' : 'bg-success text-white';
  const buttonVariant = isError ? 'danger' : 'success';

  return (
    // 'centered' lo pone en el medio, 'backdrop="static"' evita que se cierre al hacer clic afuera
    <Modal show={true} onHide={hideNotification} centered backdrop="static" keyboard={false}>
      
      <Modal.Header closeButton className={headerClass}>
        <Modal.Title>
          {isError ? (
            <>
              <i className="bi bi-exclamation-triangle-fill me-2"></i> Error
            </>
          ) : (
            <>
              <i className="bi bi-check-circle-fill me-2"></i> Éxito
            </>
          )}
        </Modal.Title>
      </Modal.Header>
      
      <Modal.Body className="text-center py-4 fs-5">
        {notification.message}
      </Modal.Body>
      
      <Modal.Footer>
        <Button variant={buttonVariant} onClick={hideNotification}>
          Entendido
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default NotificationModal;