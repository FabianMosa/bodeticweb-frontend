import React from "react";
import { Container, Button, Alert } from "react-bootstrap";

/**
 * Evita pantalla en blanco ante errores de render en producción (p. ej. datos inesperados o bugs en móvil).
 * Los hijos se renderizan con normalidad hasta que ocurre un error.
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary:", error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <Container className="py-5 min-vh-100 d-flex align-items-center justify-content-center">
          <Alert variant="danger" className="shadow-sm w-100" style={{ maxWidth: 480 }}>
            <Alert.Heading>Algo salió mal</Alert.Heading>
            <p className="mb-3">
              La aplicación encontró un error inesperado. Puedes recargar la página; si el problema
              continúa, prueba limpiar datos del sitio o usar otro navegador.
            </p>
            <Button variant="danger" onClick={this.handleReload}>
              Recargar página
            </Button>
          </Alert>
        </Container>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
