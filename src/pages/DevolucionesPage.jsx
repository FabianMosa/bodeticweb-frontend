import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import usuarioService from "../services/usuario.service";
import movimientoService from "../services/movimiento.service";
import { useNotification } from "../context/NotificationContext";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Spinner,
  InputGroup,
  Badge,
} from "react-bootstrap";

const DevolucionPage = () => {
  // --- Estados de Datos ---
  const [tecnicos, setTecnicos] = useState([]); // Lista de todos los técnicos
  const [allPrestamos, setAllPrestamos] = useState([]); // Lista de TODOS los préstamos activos
  const [insumosFiltrados, setInsumosFiltrados] = useState([]); // Insumos que el técnico seleccionado debe

  // --- Estados del Formulario ---
  const [selectedTecnico, setSelectedTecnico] = useState("");
  const [selectedInsumoId, setSelectedInsumoId] = useState("");
  const [cantidad, setCantidad] = useState(1);
  const [maxCantidad, setMaxCantidad] = useState(1); // Máximo que se puede devolver

  const [loading, setLoading] = useState(true);
  const { showNotification } = useNotification();
  const navigate = useNavigate();

  // --- Cargar datos iniciales (Técnicos y TODOS los Préstamos) ---
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        // Pedimos los técnicos y la lista completa de préstamos pendientes
        const [tecnicosData, prestamosData] = await Promise.all([
          usuarioService.getUsuariosTecnicos(),
          movimientoService.getPrestamosActivos(), // (RF-09)
        ]);

        setTecnicos(tecnicosData);
        setAllPrestamos(prestamosData);

        // Settear valor por defecto para el primer <select>
        if (tecnicosData.length > 0) {
          setSelectedTecnico(tecnicosData[0].PK_id_usuario);
        }
      } catch (err) {
        showNotification(err.message || "Error al cargar datos", "error");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [showNotification]);

  // --- Reaccionar al cambio de Técnico (Dropdown en Cascada) ---
  useEffect(() => {
    if (selectedTecnico) {
      // Filtramos la lista de préstamos para mostrar solo los de este técnico
      const prestamosDelTecnico = allPrestamos.filter(
        (p) => p.FK_id_usuario === parseInt(selectedTecnico)
      );
      setInsumosFiltrados(prestamosDelTecnico);

      // Auto-seleccionar el primer insumo de la nueva lista
      if (prestamosDelTecnico.length > 0) {
        setSelectedInsumoId(prestamosDelTecnico[0].FK_id_insumo);
        setMaxCantidad(prestamosDelTecnico[0].cantidad_pendiente);
      } else {
        setSelectedInsumoId("");
        setMaxCantidad(1);
      }
      setCantidad(1); // Resetear cantidad
    }
  }, [selectedTecnico, allPrestamos]);

  // --- Reaccionar al cambio de Insumo ---
  useEffect(() => {
    if (selectedInsumoId) {
      // Encontrar el préstamo seleccionado para saber su cantidad máxima
      const prestamo = insumosFiltrados.find(
        (p) => p.FK_id_insumo === parseInt(selectedInsumoId)
      );
      if (prestamo) {
        setMaxCantidad(prestamo.cantidad_pendiente);
      }
    }
    setCantidad(1); // Resetear cantidad
  }, [selectedInsumoId, insumosFiltrados]);

  // --- Lógica de Envío (Submit) ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (cantidad > maxCantidad) {
      showNotification(
        `Error: La cantidad a devolver (${cantidad}) es mayor a la pendiente (${maxCantidad}).`,
        "error"
      );
      setLoading(false);
      return;
    }

    try {
      const devolucionData = {
        id_insumo: parseInt(selectedInsumoId),
        cantidad_devuelta: parseInt(cantidad),
        id_usuario_tecnico: parseInt(selectedTecnico),
      };

      const response = await movimientoService.registrarDevolucion(
        devolucionData
      );

      showNotification(response.message, "success");
      navigate("/dashboard");
    } catch (err) {
      showNotification(
        err.message || "Error al registrar la devolución",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading && tecnicos.length === 0) {
    return (
      <Container
        fluid
        className="d-flex min-vh-100 justify-content-center align-items-center bg-light"
      >
        <div className="text-center">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2 text-muted">Cargando módulo de devoluciones...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container fluid className="page-container min-vh-100 py-4 font-sans">
      <Row className="justify-content-center">
        <Col xs={12} md={10} lg={8} xl={6}>
          {/* Header de Navegación */}
          <div className="d-flex align-items-center mb-4">
            <Button
              variant="outline-secondary"
              size="lg"
              as={Link}
              to="/dashboard"
              className="me-3"
            >
              <i className="bi bi-arrow-left"></i>
            </Button>
            <div>
              <h2 className="fw-bold text-dark m-0 h4">Registrar Devolución</h2>
              <p className="text-muted small mb-0">
                Gestión de retorno de insumos en préstamo.
              </p>
            </div>
          </div>

          <Card className="shadow-lg border-0 rounded-4 overflow-hidden card-hover-effect">
            <Card.Header className="bg-white border-bottom-0 pt-4 pb-0">
              <div className="d-flex align-items-center text-info">
                <div className="icon-wrapper bg-info-subtle rounded-circle p-2 me-3">
                  <i className="bi bi-arrow-return-left fs-4 text-info"></i>
                </div>
                <h5 className="fw-bold mb-0 text-dark">
                  Formulario de Reingreso
                </h5>
              </div>
            </Card.Header>
            <Card.Body className="p-4 p-md-5 pt-3">
              <Form onSubmit={handleSubmit}>
                {/* Selección de Técnico */}
                <Form.Group className="mb-4" controlId="formTecnico">
                  <Form.Label className="small fw-bold text-secondary text-uppercase ls-1">
                    Técnico Responsable
                  </Form.Label>
                  <InputGroup>
                    <InputGroup.Text className="bg-light border-end-0 text-muted">
                      <i className="bi bi-person-badge"></i>
                    </InputGroup.Text>
                    <Form.Select
                      value={selectedTecnico}
                      onChange={(e) => setSelectedTecnico(e.target.value)}
                      required
                      className="form-control-lg border-start-0 ps-0 shadow-none bg-light"
                      disabled={loading}
                    >
                      {tecnicos.length === 0 && (
                        <option disabled>No hay técnicos registrados</option>
                      )}
                      {tecnicos.map((tec) => (
                        <option
                          key={tec.PK_id_usuario}
                          value={tec.PK_id_usuario}
                        >
                          {tec.nombre}
                        </option>
                      ))}
                    </Form.Select>
                  </InputGroup>
                </Form.Group>

                {/* Selección de Insumo (Dependiente) */}
                <Form.Group className="mb-4" controlId="formInsumo">
                  <Form.Label className="small fw-bold text-secondary text-uppercase ls-1 d-flex justify-content-between">
                    <span>Insumo a Devolver</span>
                    {insumosFiltrados.length > 0 && (
                      <Badge bg="warning" text="dark" className="fw-normal">
                        {insumosFiltrados.length} pendientes
                      </Badge>
                    )}
                  </Form.Label>
                  <InputGroup>
                    <InputGroup.Text
                      className={`border-end-0 ${
                        insumosFiltrados.length === 0
                          ? "bg-light-subtle text-muted"
                          : "bg-light text-primary"
                      }`}
                    >
                      <i className="bi bi-box-seam"></i>
                    </InputGroup.Text>
                    <Form.Select
                      value={selectedInsumoId}
                      onChange={(e) => setSelectedInsumoId(e.target.value)}
                      required
                      className="form-control-lg border-start-0 ps-0 shadow-none bg-light"
                      disabled={insumosFiltrados.length === 0 || loading}
                    >
                      {insumosFiltrados.length === 0 ? (
                        <option disabled value="">
                          -- Este técnico no tiene préstamos pendientes --
                        </option>
                      ) : (
                        insumosFiltrados.map((prestamo) => (
                          <option
                            key={prestamo.FK_id_insumo}
                            value={prestamo.FK_id_insumo}
                          >
                            {prestamo.nombre_insumo} (Pendiente:{" "}
                            {prestamo.cantidad_pendiente})
                          </option>
                        ))
                      )}
                    </Form.Select>
                  </InputGroup>
                  {insumosFiltrados.length === 0 && selectedTecnico && (
                    <Form.Text className="text-success small mt-1">
                      <i className="bi bi-check-circle-fill me-1"></i>
                      Este técnico está al día con sus devoluciones.
                    </Form.Text>
                  )}
                </Form.Group>

                {/* Cantidad */}
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-4" controlId="formCantidad">
                      <Form.Label className="small fw-bold text-secondary text-uppercase ls-1">
                        Cantidad a Devolver
                      </Form.Label>
                      <InputGroup hasValidation>
                        <Form.Control
                          type="number"
                          value={cantidad}
                          min="1"
                          max={maxCantidad}
                          onChange={(e) => setCantidad(e.target.value)}
                          required
                          className="form-control-lg shadow-none bg-light text-center fw-bold"
                          disabled={insumosFiltrados.length === 0 || loading}
                        />
                        <InputGroup.Text className="bg-light text-muted">
                          unidades
                        </InputGroup.Text>
                      </InputGroup>
                      {insumosFiltrados.length > 0 && (
                        <div className="d-flex justify-content-end mt-1">
                          <small className="text-muted">
                            Máximo disponible:{" "}
                            <strong className="text-dark">{maxCantidad}</strong>
                          </small>
                        </div>
                      )}
                    </Form.Group>
                  </Col>
                </Row>

                <div className="d-grid mt-2">
                  <Button
                    variant="info"
                    type="submit"
                    size="lg"
                    disabled={loading || insumosFiltrados.length === 0}
                    className="text-white shadow-sm btn-gradient-info border-0 py-3 rounded-3"
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
                        Registrando...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-check2-circle me-2"></i> Confirmar
                        Devolución
                      </>
                    )}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* --- Estilos CSS Personalizados --- */}
      <style>{`
        .font-sans { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; }
        .ls-1 { letter-spacing: 0.5px; }
        .page-container { background-color: #f0f2f5; }
        
        .card-hover-effect {
             transition: transform 0.2s ease-in-out;
        }
        
        .icon-wrapper {
            background-color: rgba(13, 202, 240, 0.1);
            width: 48px;
            height: 48px;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        /* Inputs Modernos */
        .form-control-lg, .form-select-lg {
            border: 1px solid #dee2e6;
            font-size: 1rem;
            padding: 0.75rem 1rem;
        }
        .form-control-lg:focus, .form-select:focus {
            border-color: #0dcaf0;
            background-color: #fff;
            box-shadow: 0 0 0 4px rgba(13, 202, 240, 0.15);
        }
        
        /* Botón Gradiente */
        .btn-gradient-info {
            background: linear-gradient(45deg, #0dcaf0, #0d6efd);
            transition: all 0.3s ease;
        }
        .btn-gradient-info:hover {
            background: linear-gradient(45deg, #0bb5d9, #0b5ed7);
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(13, 202, 240, 0.4);
        }
        .btn-gradient-info:disabled {
            background: #adb5bd;
            transform: none;
        }
      `}</style>
    </Container>
  );
};

export default DevolucionPage;
