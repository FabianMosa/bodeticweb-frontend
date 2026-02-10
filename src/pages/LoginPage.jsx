import React, { useState } from "react";
import authService from "../services/auth.services";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Spinner,
  InputGroup,
} from "react-bootstrap";
// Asegúrate de que los iconos estén instalados: npm install bootstrap-icons
import "bootstrap-icons/font/bootstrap-icons.css";
import { useNotification } from "../context/NotificationContext";

const LoginPage = () => {
  const [rut, setRut] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); // Nuevo estado para UX
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { showNotification } = useNotification();

  // Lógica de formateo de RUT
  const formatRut = (value) => {
    const cleanValue = value.replace(/[^0-9kK]/g, "").toUpperCase();
    if (cleanValue.length <= 1) return cleanValue;
    const cuerpo = cleanValue.slice(0, -1);
    const dv = cleanValue.slice(-1);
    const cuerpoFormateado = cuerpo.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return `${cuerpoFormateado}-${dv}`;
  };

  const handleRutChange = (e) => {
    const inputValue = e.target.value;
    const formattedRut = formatRut(inputValue);
    setRut(formattedRut);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await authService.login(rut, password);
      showNotification(`Bienvenido, ${data.usuario.nombre}`, "success");
      navigate("/dashboard");
    } catch (err) {
      showNotification(err.message || "Error al iniciar sesión", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container fluid className="vh-100 p-0 overflow-hidden">
      <Row className="h-100 g-0">
        {/* --- PANEL IZQUIERDO (Visual / Branding) --- */}
        {/* d-none d-md-flex: Se oculta en móviles, se muestra flex en tablets+ */}
        <Col
          md={6}
          lg={7}
          className="d-none d-md-flex bg-gradient-primary left-panel position-relative"
        >
          <div className="content-wrapper text-white p-5">
            <div className="mb-4">
              <i className="bi bi-box-seam display-1"></i>
            </div>
            <h1 className="display-4 fw-bold mb-3">BodegaWeb</h1>
            <p className="lead fs-3 mb-4">
              Gestión inteligente de inventario y trazabilidad en tiempo real
            </p>
            <div className="features-list text-start mt-5">
              <div className="d-flex align-items-center mb-3">
                <i className="bi bi-qr-code-scan fs-4 me-3"></i>
                <span>Escaneo móvil integrado</span>
              </div>
              <div className="d-flex align-items-center mb-3">
                <i className="bi bi-shield-lock-fill fs-4 me-3"></i>
                <span>Seguridad y control de acceso</span>
              </div>
              <div className="d-flex align-items-center">
                <i className="bi bi-graph-up-arrow fs-4 me-3"></i>
                <span>Reportes y alertas automáticas</span>
              </div>
            </div>
          </div>
          {/* Elementos decorativos de fondo */}
          <div className="shape-blob shape-1"></div>
          <div className="shape-blob shape-2"></div>
        </Col>

        {/* --- PANEL DERECHO (Formulario) --- */}
        <Col
          md={6}
          lg={5}
          className="d-flex align-items-center justify-content-center bg-white right-panel"
        >
          <div className="w-100 p-4" style={{ maxWidth: "450px" }}>
            <div className="text-center mb-5">
              <h2 className="fw-bold text-dark mb-2">Iniciar Sesión</h2>
              <p className="text-muted">
                Ingresa tus credenciales corporativas
              </p>
            </div>

            <Form onSubmit={handleLogin}>
              <Form.Group className="mb-4" controlId="formRut">
                <Form.Label className="fw-medium text-secondary">
                  RUT
                </Form.Label>
                <InputGroup className="input-group-modern">
                  <InputGroup.Text className="bg-light border-end-0 text-muted">
                    <i className="bi bi-person-fill"></i>
                  </InputGroup.Text>
                  <Form.Control
                    type="text"
                    placeholder="Ej: 12.345.678-9"
                    value={rut}
                    onChange={handleRutChange}
                    required
                    maxLength={12}
                    className="border-start-0 bg-light ps-1 shadow-none"
                  />
                </InputGroup>
              </Form.Group>

              <Form.Group className="mb-4" controlId="formPassword">
                <Form.Label className="fw-medium text-secondary">
                  Contraseña
                </Form.Label>
                <InputGroup className="input-group-modern">
                  <InputGroup.Text className="bg-light border-end-0 text-muted">
                    <i className="bi bi-lock"></i>
                  </InputGroup.Text>
                  <Form.Control
                    type={showPassword ? "text" : "password"}
                    placeholder="Ingresa tu contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="border-start-0 border-end-0 bg-light ps-1"
                  />
                  <Button
                    variant="light"
                    className="border border-start-0 bg-light text-muted"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex="-1"
                  >
                    <i
                      className={`bi ${
                        showPassword ? "bi-eye-slash" : "bi-eye"
                      }`}
                    ></i>
                  </Button>
                </InputGroup>
                <div className="text-end mt-2">
                  <a
                    href="#"
                    className="text-decoration-none small text-primary fw-medium"
                    onClick={(e) => e.preventDefault()}
                  >
                    Si olvidaste tu contraseña, contacta al Administrador
                  </a>
                </div>
              </Form.Group>

              <div className="d-grid mt-5">
                <Button
                  variant="primary"
                  type="submit"
                  disabled={loading}
                  size="lg"
                  className="btn-modern shadow-sm"
                >
                  {loading ? (
                    <>
                      <Spinner
                        as="span"
                        animation="border"
                        size="sm"
                        role="status"
                        aria-hidden="true"
                        className="me-2"
                      />
                      Autenticando...
                    </>
                  ) : (
                    "Ingresar al Sistema"
                  )}
                </Button>
              </div>
            </Form>

            <div className="text-center mt-5">
              <p className="text-muted small">
                © {new Date().getFullYear()} Software Engineer Bernardo Morales
                - Antofagasta
              </p>
            </div>
          </div>
        </Col>
      </Row>

      <style>{`
        /* Estilos personalizados para Layout y Diseño */
        .left-panel {
          background: linear-gradient(135deg, #0d6efd 0%, #0a58ca 100%);
          position: relative;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1;
        }

        .content-wrapper {
          z-index: 2;
          position: relative;
        }

        /* Formas decorativas animadas en el fondo */
        .shape-blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.4;
          z-index: 1;
          animation: float 10s infinite ease-in-out;
        }

        .shape-1 {
          background: #0dcaf0;
          width: 300px;
          height: 300px;
          top: -50px;
          left: -50px;
        }

        .shape-2 {
          background: #6610f2;
          width: 400px;
          height: 400px;
          bottom: -100px;
          right: -100px;
          animation-delay: 5s;
        }

        @keyframes float {
          0% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(20px, 40px) scale(1.1); }
          100% { transform: translate(0, 0) scale(1); }
        }

        /* Inputs modernos */
        .input-group-modern .form-control, 
        .input-group-modern .input-group-text,
        .input-group-modern button {
          border-color: #dee2e6;
          padding: 0.75rem 1rem;
        }

        .form-control:focus {
          box-shadow: none;
          border-color: #86b7fe;
          background-color: #fff !important;
        }
        
        .input-group-modern:focus-within .input-group-text,
        .input-group-modern:focus-within .form-control,
        .input-group-modern:focus-within button {
          border-color: #86b7fe;
          background-color: #fff !important;
        }

        .btn-modern {
          padding: 0.8rem;
          font-weight: 600;
          letter-spacing: 0.5px;
          transition: all 0.3s ease;
        }

        .btn-modern:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(13, 110, 253, 0.3) !important;
        }
      `}</style>
    </Container>
  );
};

export default LoginPage;
