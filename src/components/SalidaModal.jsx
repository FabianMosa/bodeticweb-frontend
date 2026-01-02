import React, { useState } from "react";
import {
  Modal,
  Button,
  Form,
  Row,
  Col,
  Card,
  Badge,
  InputGroup,
  Spinner,
} from "react-bootstrap";
import movimientoService from "../services/movimiento.service";
import { useNotification } from "../context/NotificationContext";

const SalidaModal = ({ insumo, onClose, onSuccess }) => {
  // Guardia: Patrón Early Return para evitar renderizados con props nulas
  if (!insumo) return null;

  const [cantidad, setCantidad] = useState(1);
  const [codigo_ot, setCodigo_ot] = useState("");
  const [tipo_movimiento, setTipo_movimiento] = useState("Salida-Uso");
  const [descripcion, setDescripcion] = useState("");
  const [loading, setLoading] = useState(false);
  const [validated, setValidated] = useState(false); // Para feedback visual de validación nativa

  const { showNotification } = useNotification();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;

    // Validación nativa de HTML5 integrada con Bootstrap
    if (form.checkValidity() === false) {
      e.stopPropagation();
      setValidated(true);
      return;
    }

    setLoading(true);

    try {
      const salidaData = {
        id_insumo: insumo.PK_id_insumo,
        cantidad: parseInt(cantidad, 10),
        tipo_movimiento,
        codigo_ot,
        descripcion,
      };

      const response = await movimientoService.registrarSalida(salidaData);

      showNotification(response.message, "success");

      // Actualización optimista o callback a la tabla padre
      onSuccess(insumo.PK_id_insumo, response.nuevo_stock);
      onClose();
    } catch (err) {
      showNotification(err.message || "Error al registrar la salida", "error");
    } finally {
      setLoading(false);
    }
  };

  // Estilos personalizados mínimos para complementar Bootstrap
  const styles = {
    modalHeader: {
      background: "linear-gradient(45deg, #0d6efd, #0a58ca)",
      color: "white",
      borderBottom: "none",
    },
    stockDisplay: {
      fontSize: "2rem",
      fontWeight: "700",
      lineHeight: "1",
    },
  };

  return (
    <Modal
      show={true}
      onHide={onClose}
      backdrop="static"
      keyboard={false}
      centered
      size="lg"
      aria-labelledby="modal-salida-title"
    >
      {/* Header Moderno con Gradiente */}
      <Modal.Header closeButton closeVariant="white" style={styles.modalHeader}>
        <Modal.Title id="modal-salida-title" className="fw-bold">
          Registrar Salida de Material
        </Modal.Title>
      </Modal.Header>

      <Form noValidate validated={validated} onSubmit={handleSubmit}>
        <Modal.Body className="p-4">
          {/* Sección de Contexto: Resumen del Insumo */}
          <Card className="mb-4 border-0 shadow-sm bg-light">
            <Card.Body className="d-flex justify-content-between align-items-center">
              <div>
                <h6 className="text-uppercase text-muted fw-bold small mb-1">
                  Insumo Seleccionado
                </h6>
                <h4 className="text-dark fw-bold mb-0">{insumo.nombre}</h4>
                <div className="text-muted small mt-1">
                  ID: {insumo.PK_id_insumo}
                </div>
              </div>
              <div className="text-end">
                <Badge
                  bg={insumo.stock_actual > 0 ? "success" : "danger"}
                  className="mb-2"
                >
                  {insumo.stock_actual > 0 ? "DISPONIBLE" : "AGOTADO"}
                </Badge>
                <div className="text-primary" style={styles.stockDisplay}>
                  {insumo.stock_actual}
                </div>
                <small className="text-muted fw-bold">Stock Actual</small>
              </div>
            </Card.Body>
          </Card>

          <Row className="g-3">
            {/* Selección de Tipo de Movimiento (Segmented Control Visual) */}
            <Col xs={12}>
              <Form.Label className="fw-bold text-secondary">
                Tipo de Movimiento
              </Form.Label>
              <div className="d-flex gap-3">
                {["Salida-Uso", "Préstamo"].map((tipo) => (
                  <div key={tipo} className="flex-grow-1">
                    <input
                      type="radio"
                      className="btn-check"
                      name="tipo_movimiento"
                      id={`option-${tipo}`}
                      autoComplete="off"
                      checked={tipo_movimiento === tipo}
                      onChange={() => setTipo_movimiento(tipo)}
                    />
                    <label
                      className={`btn w-100 py-2 fw-medium ${
                        tipo_movimiento === tipo
                          ? "btn-outline-primary shadow-sm active"
                          : "btn-outline-secondary border-light bg-white"
                      }`}
                      htmlFor={`option-${tipo}`}
                    >
                      {tipo === "Salida-Uso" ? "Uso Interno" : "Préstamo"}
                    </label>
                  </div>
                ))}
              </div>
            </Col>

            {/* Columna Izquierda: Cantidad */}
            <Col md={6} className="mt-4">
              <Form.Group controlId="formCantidad">
                <Form.Label className="fw-bold text-secondary">
                  Cantidad a Retirar
                </Form.Label>
                <InputGroup hasValidation>
                  <Form.Control
                    type="number"
                    value={cantidad}
                    onChange={(e) => setCantidad(e.target.value)}
                    min="1"
                    max={insumo.stock_actual}
                    required
                    className="fw-bold form-control-lg"
                  />
                  <InputGroup.Text className="bg-light text-muted">
                    UNID
                  </InputGroup.Text>
                  <Form.Control.Feedback type="invalid">
                    La cantidad debe ser entre 1 y {insumo.stock_actual}.
                  </Form.Control.Feedback>
                </InputGroup>
              </Form.Group>
            </Col>

            {/* Columna Derecha: Código OT */}
            <Col md={6} className="mt-4">
              <Form.Group controlId="formOT">
                <div className="d-flex justify-content-between">
                  <Form.Label className="fw-bold text-secondary">
                    N° Hoja de Terreno (OT)
                  </Form.Label>
                  {tipo_movimiento !== "Salida-Uso" && (
                    <span className="badge bg-light text-dark border fw-normal">
                      Opcional
                    </span>
                  )}
                </div>
                <Form.Control
                  type="text"
                  placeholder="Ej. OT-2024-001"
                  value={codigo_ot}
                  onChange={(e) => setCodigo_ot(e.target.value)}
                  required={tipo_movimiento === "Salida-Uso"}
                  className="form-control-lg"
                />
                <Form.Control.Feedback type="invalid">
                  El código OT es obligatorio para salidas por uso.
                </Form.Control.Feedback>
              </Form.Group>
            </Col>

            {/* Campo Completo: Descripción */}
            <Col xs={12} className="mt-3">
              <Form.Group controlId="formDescripcion">
                <Form.Label className="fw-bold text-secondary">
                  Detalle / Responsable
                </Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  placeholder="Ingrese el nombre del responsable o detalles adicionales..."
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  style={{ resize: "none" }}
                />
              </Form.Group>
            </Col>
          </Row>
        </Modal.Body>

        <Modal.Footer className="border-top-0 pt-0 pb-4 px-4">
          <Button
            variant="link"
            onClick={onClose}
            disabled={loading}
            className="text-decoration-none text-secondary fw-bold me-2"
          >
            Cancelar
          </Button>
          <Button
            variant="primary"
            type="submit"
            disabled={loading}
            className="px-4 py-2 fw-bold shadow-sm d-flex align-items-center gap-2"
          >
            {loading && <Spinner animation="border" size="sm" />}
            {loading ? "Procesando..." : "Confirmar Salida"}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default SalidaModal;
