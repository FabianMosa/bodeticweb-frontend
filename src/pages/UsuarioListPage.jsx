import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import usuarioService from "../services/usuario.service";
import { useNotification } from "../context/NotificationContext";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Spinner,
  Table,
  Badge,
} from "react-bootstrap";

const UsuarioListPage = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showNotification } = useNotification();

  useEffect(() => {
    setLoading(true);
    usuarioService
      .getAllUsuarios()
      .then((data) => setUsuarios(data))
      .catch((err) => {
        showNotification(err.message || "Error al cargar usuarios", "error");
      })
      .finally(() => setLoading(false));
  }, [showNotification]);

  return (
    <Container fluid className="page-container min-vh-100 py-4 font-sans">
      <Row className="justify-content-center">
        <Col xs={12} xl={10}>
          {/* Header de Navegación y Acción */}
          <div className="d-flex align-items-center justify-content-between mb-4">
            <div className="d-flex align-items-center">
              <Button
                variant="link"
                as={Link}
                to="/dashboard"
                className="text-decoration-none text-secondary p-0 me-3"
              >
                <i className="bi bi-arrow-left fs-4"></i>
              </Button>
              <div>
                <h2 className="fw-bold text-dark m-0 h4">
                  Gestión de Usuarios
                </h2>
                <p className="text-muted small mb-0">
                  Administra el acceso y roles del personal.
                </p>
              </div>
            </div>
            <Button
              variant="primary"
              as={Link}
              to="/usuarios/nuevo"
              className="shadow-sm rounded-pill px-4 btn-gradient border-0"
            >
              <i className="bi bi-person-plus-fill me-2"></i>
              <span className="d-none d-md-inline">Nuevo Usuario</span>
            </Button>
          </div>

          <Card className="shadow-lg border-0 rounded-4 overflow-hidden">
            <Card.Body className="p-0">
              {loading ? (
                <div className="text-center py-5">
                  <Spinner
                    animation="border"
                    role="status"
                    variant="primary"
                    style={{ width: "3rem", height: "3rem" }}
                  />
                  <p className="mt-3 text-muted">Cargando usuarios...</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <Table hover className="align-middle mb-0 custom-table">
                    <thead className="bg-light">
                      <tr>
                        <th className="py-3 ps-4 text-secondary text-uppercase small fw-bold">
                          Nombre
                        </th>
                        <th className="py-3 text-secondary text-uppercase small fw-bold d-none d-md-table-cell">
                          RUT
                        </th>
                        <th className="py-3 text-secondary text-uppercase small fw-bold">
                          Rol
                        </th>
                        <th className="py-3 text-center text-secondary text-uppercase small fw-bold">
                          Estado
                        </th>
                        <th className="py-3 pe-4 text-end text-secondary text-uppercase small fw-bold">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {usuarios.length > 0 ? (
                        usuarios.map((user) => (
                          <tr
                            key={user.PK_id_usuario}
                            className="border-bottom"
                          >
                            <td className="ps-4">
                              <div className="d-flex align-items-center">
                                {/* Avatar con inicial */}
                                <div className="avatar-circle me-3 bg-light text-primary fw-bold border">
                                  {user.nombre.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <div className="fw-bold text-dark">
                                    {user.nombre}
                                  </div>
                                  {/* RUT visible en móvil debajo del nombre */}
                                  <div className="small text-muted d-md-none font-monospace">
                                    {user.rut}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="d-none d-md-table-cell text-secondary font-monospace">
                              {user.rut}
                            </td>
                            <td>
                              <Badge
                                bg="light"
                                text="dark"
                                className="border fw-normal px-3 py-2 rounded-pill"
                              >
                                <i
                                  className={`bi ${
                                    user.nombre_rol === "Administrador"
                                      ? "bi-shield-lock-fill text-warning"
                                      : "bi-tools text-info"
                                  } me-2`}
                                ></i>
                                {user.nombre_rol}
                              </Badge>
                            </td>
                            <td className="text-center">
                              <span
                                className={`badge-status ${
                                  user.activo
                                    ? "status-active"
                                    : "status-inactive"
                                }`}
                              >
                                {user.activo ? "Activo" : "Inactivo"}
                              </span>
                            </td>
                            <td className="pe-4 text-end">
                              <Button
                                as={Link}
                                to={`/usuarios/editar/${user.PK_id_usuario}`}
                                variant="light"
                                size="sm"
                                className="btn-icon border"
                                title="Editar Usuario"
                              >
                                <i className="bi bi-pencil-fill text-warning"></i>
                              </Button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="text-center py-5">
                            <div className="d-flex flex-column align-items-center text-muted">
                              <i className="bi bi-people display-4 mb-3 opacity-50"></i>
                              <h5 className="fw-normal">
                                No hay usuarios registrados
                              </h5>
                              <p className="small mb-0">
                                Comienza creando un nuevo usuario con el botón
                                superior.
                              </p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </Table>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Estilos CSS */}
      <style>{`
        .font-sans { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; }
        .page-container { background-color: #f0f2f5; }
        
        .btn-gradient {
            background: linear-gradient(135deg, #0d6efd 0%, #0a58ca 100%);
            color: white;
            transition: transform 0.2s, box-shadow 0.2s;
        }
        .btn-gradient:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(13, 110, 253, 0.3);
            color: white;
        }

        .custom-table thead th {
            border-bottom: 2px solid #f0f0f0;
            background-color: #f8f9fa;
            letter-spacing: 0.5px;
        }
        
        .avatar-circle {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.2rem;
            min-width: 40px; /* Evita que se aplaste */
        }

        .btn-icon {
            width: 32px;
            height: 32px;
            padding: 0;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            border-radius: 8px;
            transition: all 0.2s;
        }
        .btn-icon:hover {
            background-color: #e9ecef;
            transform: translateY(-2px);
        }

        /* Badges de estado personalizados */
        .badge-status {
            padding: 0.35em 0.8em;
            font-size: 0.75em;
            font-weight: 700;
            border-radius: 50rem;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .status-active {
            background-color: rgba(25, 135, 84, 0.1);
            color: #198754;
        }
        .status-inactive {
            background-color: rgba(108, 117, 125, 0.1);
            color: #6c757d;
        }
      `}</style>
    </Container>
  );
};

export default UsuarioListPage;
