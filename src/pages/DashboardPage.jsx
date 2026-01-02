import React, { useEffect, useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import authService from "../services/auth.services";
import dashboardService from "../services/dashboard.service";
import movimientoService from "../services/movimiento.service";
import {
  Container,
  Row,
  Col,
  Navbar,
  Nav,
  Button,
  Card,
  ListGroup,
  Spinner,
  Badge,
} from "react-bootstrap";

const DashboardPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [usuarioRol, setUsuarioRol] = useState(null);
  const [nombreUsuario, setNombreUsuario] = useState("Usuario");
  const [alertas, setAlertas] = useState(null);
  const [prestamos, setPrestamos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const usuarioInfo = JSON.parse(localStorage.getItem("usuario"));
    let rol = null;
    if (usuarioInfo) {
      setNombreUsuario(usuarioInfo.usuario.nombre);
      setUsuarioRol(usuarioInfo.usuario.rol);
      rol = usuarioInfo.usuario.rol;
    }

    const loadDashboardData = async () => {
      setLoading(true);
      try {
        const promesas = [movimientoService.getPrestamosActivos()];

        if (rol === 1) {
          promesas.push(dashboardService.getAlertas());
        }

        const [prestamosData, alertasData] = await Promise.all(promesas);

        if (Array.isArray(prestamosData)) {
          setPrestamos(prestamosData);
        }

        if (alertasData) {
          setAlertas(alertasData);
        }
      } catch (error) {
        console.error("Error cargando el dashboard:", error);
      } finally {
        setLoading(false);
      }
    };
    loadDashboardData();
  }, [location]);

  const handleLogout = () => {
    authService.logout();
    navigate("/");
  };

  return (
    <div className="dashboard-wrapper bg-light min-vh-100">
      {/* --- Navbar Moderna --- */}
      <Navbar expand="lg" className="navbar-custom shadow-sm mb-5">
        <Container>
          <Navbar.Brand
            as={Link}
            to="/dashboard"
            className="d-flex align-items-center gap-2"
          >
            <div className="brand-icon">
              <i className="bi bi-box-seam-fill"></i>
            </div>
            <span className="fw-bold text-dark fs-4">BodeTICWeb</span>
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse
            id="basic-navbar-nav"
            className="justify-content-end"
          >
            <Nav className="align-items-center gap-3">
              <div className="user-info d-none d-lg-block text-end">
                <small className="text-muted d-block">Bienvenido,</small>
                <span className="fw-bold text-dark">{nombreUsuario}</span>
              </div>
              <Button
                variant="outline-danger"
                size="sm"
                onClick={handleLogout}
                className="btn-logout"
              >
                <i className="bi bi-box-arrow-right me-2"></i>
                Cerrar Sesión
              </Button>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Container className="pb-5">
        {/* --- Sección de Bienvenida / Header --- */}
        <Row className="mb-4">
          <Col>
            <h4 className="text-secondary fw-light mb-1">Panel de Control</h4>
            <h2 className="fw-bold text-dark">Resumen General</h2>
          </Col>
        </Row>

        {/* --- Tarjetas de Módulos (Accesos Rápidos) --- */}
        <Row xs={1} md={2} lg={4} className="g-4 mb-5">
          {/* Módulo: Inventario */}
          <Col>
            <Card className="h-100 border-0 shadow-hover card-module">
              <Card.Body className="d-flex flex-column align-items-center text-center p-4">
                <div className="icon-circle bg-primary-subtle text-primary mb-3">
                  <i className="bi bi-box-seam-fill fs-3"></i>
                </div>
                <Card.Title className="fw-bold mb-2">Inventario</Card.Title>
                <Card.Text className="text-muted small mb-4">
                  Consulta, gestiona stock y registra movimientos.
                </Card.Text>
                <Button
                  variant="primary"
                  as={Link}
                  to="/inventario"
                  className="mt-auto w-100 rounded-pill"
                >
                  Acceder
                </Button>
              </Card.Body>
            </Card>
          </Col>

          {usuarioRol === 1 && (
            <>
              {/* Módulo: Devoluciones */}
              <Col>
                <Card className="h-100 border-0 shadow-hover card-module">
                  <Card.Body className="d-flex flex-column align-items-center text-center p-4">
                    <div className="icon-circle bg-info-subtle text-info mb-3">
                      <i className="bi bi-arrow-return-left fs-3"></i>
                    </div>
                    <Card.Title className="fw-bold mb-2">
                      Devoluciones
                    </Card.Title>
                    <Card.Text className="text-muted small mb-4">
                      Reingresa insumos prestados a la bodega.
                    </Card.Text>
                    <Button
                      variant="info"
                      as={Link}
                      to="/devoluciones"
                      className="mt-auto w-100 rounded-pill text-white"
                    >
                      Acceder
                    </Button>
                  </Card.Body>
                </Card>
              </Col>

              {/* Módulo: Usuarios */}
              <Col>
                <Card className="h-100 border-0 shadow-hover card-module">
                  <Card.Body className="d-flex flex-column align-items-center text-center p-4">
                    <div className="icon-circle bg-success-subtle text-success mb-3">
                      <i className="bi bi-people-fill fs-3"></i>
                    </div>
                    <Card.Title className="fw-bold mb-2">Usuarios</Card.Title>
                    <Card.Text className="text-muted small mb-4">
                      Administra roles y permisos del personal.
                    </Card.Text>
                    <Button
                      variant="success"
                      as={Link}
                      to="/usuarios"
                      className="mt-auto w-100 rounded-pill"
                    >
                      Acceder
                    </Button>
                  </Card.Body>
                </Card>
              </Col>

              {/* Módulo: Reportes */}
              <Col>
                <Card className="h-100 border-0 shadow-hover card-module">
                  <Card.Body className="d-flex flex-column align-items-center text-center p-4">
                    <div className="icon-circle bg-secondary-subtle text-secondary mb-3">
                      <i className="bi bi-file-earmark-text-fill fs-3"></i>
                    </div>
                    <Card.Title className="fw-bold mb-2">Reportes</Card.Title>
                    <Card.Text className="text-muted small mb-4">
                      Historial completo y exportación a Excel.
                    </Card.Text>
                    <Button
                      variant="secondary"
                      as={Link}
                      to="/historial"
                      className="mt-auto w-100 rounded-pill"
                    >
                      Acceder
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            </>
          )}
        </Row>

        {/* --- Widgets de Información (Dashboard Real) --- */}
        <Row className="g-4">
          {/* Widget: Préstamos Pendientes */}
          <Col lg={usuarioRol === 1 ? 4 : 12}>
            <Card className="border-0 shadow-sm h-100 widget-card">
              <Card.Header className="bg-white border-bottom-0 pt-4 px-4 d-flex justify-content-between align-items-center">
                <h5 className="fw-bold mb-0 text-dark">
                  <i className="bi bi-clock-history me-2 text-primary"></i>
                  Préstamos
                </h5>
                <Badge bg="primary" pill>
                  {prestamos.length}
                </Badge>
              </Card.Header>
              <Card.Body className="px-4 pb-4">
                {loading ? (
                  <div className="text-center py-4">
                    <Spinner animation="border" variant="primary" size="sm" />
                  </div>
                ) : prestamos.length > 0 ? (
                  <ListGroup variant="flush">
                    {prestamos.slice(0, 5).map((p) => (
                      <ListGroup.Item
                        key={`${p.FK_id_insumo}-${p.FK_id_usuario}`}
                        className="px-0 py-3 border-bottom-light"
                      >
                        <div className="d-flex justify-content-between align-items-start">
                          <div>
                            <div className="fw-semibold text-dark">
                              {p.nombre_insumo}
                            </div>
                            {usuarioRol === 1 && (
                              <small className="text-muted">
                                Téc: {p.nombre_usuario}
                              </small>
                            )}
                          </div>
                          <Badge bg="light" text="dark" className="border">
                            x{p.cantidad_pendiente}
                          </Badge>
                        </div>
                      </ListGroup.Item>
                    ))}
                    {prestamos.length > 5 && (
                      <div className="text-center mt-2 small text-muted">
                        Ver más en Reportes...
                      </div>
                    )}
                  </ListGroup>
                ) : (
                  <div className="text-center py-5 text-muted">
                    <i className="bi bi-check-circle fs-1 mb-2 d-block text-success opacity-50"></i>
                    No hay préstamos pendientes
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>

          {/* Widgets de Alertas (Solo Admin) */}
          {usuarioRol === 1 && alertas && (
            <Col lg={8}>
              <Row className="g-4 h-100">
                {/* Alerta Stock */}
                <Col md={6}>
                  <Card className="border-0 shadow-sm h-100 widget-card border-start-danger">
                    <Card.Header className="bg-white border-bottom-0 pt-4 px-4">
                      <h5 className="fw-bold mb-0 text-danger">
                        <i className="bi bi-exclamation-triangle-fill me-2"></i>
                        Stock Crítico
                      </h5>
                    </Card.Header>
                    <Card.Body className="px-4 pb-4">
                      {loading ? (
                        <Spinner animation="border" size="sm" />
                      ) : alertas.stockBajo.length > 0 ? (
                        <div className="alert-list">
                          {alertas.stockBajo.slice(0, 4).map((a) => (
                            <div
                              key={a.PK_id_insumo}
                              className="d-flex justify-content-between align-items-center mb-3 p-2 rounded bg-danger-subtle"
                            >
                              <span className="fw-medium text-danger-emphasis">
                                {a.nombre}
                              </span>
                              <Badge bg="danger">Stock: {a.stock_actual}</Badge>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted">
                          Todo el inventario está saludable.
                        </p>
                      )}
                    </Card.Body>
                  </Card>
                </Col>

                {/* Alerta Vencimiento */}
                <Col md={6}>
                  <Card className="border-0 shadow-sm h-100 widget-card border-start-warning">
                    <Card.Header className="bg-white border-bottom-0 pt-4 px-4">
                      <h5 className="fw-bold mb-0 text-warning">
                        <i className="bi bi-calendar-event-fill me-2"></i>
                        Por Vencer
                      </h5>
                    </Card.Header>
                    <Card.Body className="px-4 pb-4">
                      {loading ? (
                        <Spinner animation="border" size="sm" />
                      ) : alertas.porVencer.length > 0 ? (
                        <div className="alert-list">
                          {alertas.porVencer.slice(0, 4).map((a) => (
                            <div
                              key={a.PK_id_insumo}
                              className="d-flex justify-content-between align-items-center mb-3 p-2 rounded bg-warning-subtle"
                            >
                              <span className="fw-medium text-warning-emphasis">
                                {a.nombre}
                              </span>
                              <small className="text-muted">
                                {new Date(
                                  a.fecha_vencimiento
                                ).toLocaleDateString()}
                              </small>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted">
                          No hay insumos próximos a vencer.
                        </p>
                      )}
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </Col>
          )}
        </Row>
      </Container>

      <style>{`
        /* --- ESTILOS MODERNOS --- */
        .dashboard-wrapper {
            background-color: #f3f6f9; /* Gris muy suave, profesional */
        }
        
        .navbar-custom {
            background-color: #ffffff;
            border-bottom: 1px solid #e9ecef;
        }

        .brand-icon {
            color: #0d6efd;
            font-size: 1.5rem;
        }

        /* Tarjetas de Módulos con Efecto Hover */
        .shadow-hover {
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .shadow-hover:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 20px rgba(0,0,0,0.08) !important;
        }

        .icon-circle {
            width: 60px;
            height: 60px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        /* Widgets Laterales */
        .widget-card {
            border-radius: 12px;
        }
        
        .border-start-danger {
            border-left: 4px solid #dc3545 !important;
        }
        
        .border-start-warning {
            border-left: 4px solid #ffc107 !important;
        }

        .border-bottom-light {
            border-bottom: 1px solid #f0f0f0;
        }

        .btn-logout {
            border-radius: 20px;
            padding-left: 1.5rem;
            padding-right: 1.5rem;
        }
      `}</style>
    </div>
  );
};

export default DashboardPage;
