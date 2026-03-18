import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import insumoService from "../services/insumo.service";
import { useNotification } from "../context/NotificationContext";
import {
  Container,
  Row,
  Col,
  Button,
  Card,
  Spinner,
  Form,
  InputGroup,
} from "react-bootstrap";

const InventarioEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState(null);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { showNotification } = useNotification();

  // 1. Cargar datos iniciales
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [insumoData, categoriasData] = await Promise.all([
          insumoService.getInsumoById(id),
          insumoService.getCategorias(),
        ]);

        // Formatear fecha para el input type="date"
        if (insumoData.fecha_vencimiento) {
          insumoData.fecha_vencimiento =
            insumoData.fecha_vencimiento.split("T")[0];
        }

        setFormData(insumoData);
        setCategorias(categoriasData);
      } catch (err) {
        showNotification(err.message || "Error al cargar los datos", "error");
        navigate("/inventario"); // Retornar si no se encuentra
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id, navigate, showNotification]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const dataToUpdate = {
      nombre: formData.nombre,
      sku: formData.sku,
      descripcion: formData.descripcion,
      stock_minimo: formData.stock_minimo,
      id_categoria: formData.FK_id_categoria,
      fecha_vencimiento: formData.fecha_vencimiento,
    };

    try {
      await insumoService.updateInsumo(id, dataToUpdate);
      showNotification("Insumo actualizado con éxito", "success");
      navigate("/inventario");
    } catch (err) {
      showNotification(err.message || "Error al actualizar el insumo", "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading)
    return (
      <Container
        fluid
        className="d-flex min-vh-100 justify-content-center align-items-center bg-light"
      >
        <div className="text-center">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2 text-muted">Cargando información del insumo...</p>
        </div>
      </Container>
    );

  return (
    <Container fluid className="form-container bg-light min-vh-100 py-4">
      <Row className="justify-content-center">
        <Col xs={12} md={10} lg={8} xl={6}>
          {/* Botón Volver */}
          <Button
            variant="outline-secondary"
            size="sm"
            as={Link}
            to="/inventario"
            className="mb-3"
          >
            <i className="bi bi-arrow-left me-1"></i> Volver al Inventario
          </Button>

          <Card className="shadow-sm border-0 rounded-3">
            <Card.Header className="bg-warning text-dark fw-bold py-3">
              <i className="bi bi-pencil-square me-2"></i>Editar Insumo
            </Card.Header>

            <Card.Body className="p-4 p-md-5">
              {formData && (
                <Form onSubmit={handleSubmit}>
                  {/* Fila 1: Nombre y SKU */}
                  <Row className="gy-3 mb-3">
                    <Col md={8}>
                      <Form.Group controlId="formNombre">
                        <Form.Label className="fw-semibold">
                          Nombre del Artículo{" "}
                          <span className="text-danger">*</span>
                        </Form.Label>
                        <Form.Control
                          type="text"
                          name="nombre"
                          value={formData.nombre}
                          onChange={handleChange}
                          required
                          className="form-control-focus"
                          placeholder="Ej: Monitor LED 24''"
                        />
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group controlId="formSku">
                        <Form.Label className="fw-semibold">
                          SKU / Código <span className="text-danger">*</span>
                        </Form.Label>
                        <Form.Control
                          type="text"
                          name="sku"
                          value={formData.sku}
                          onChange={handleChange}
                          required
                          className="form-control-focus bg-light"
                          title="El SKU es el identificador único"
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  {/* Fila 2: Categoría y Stock Mínimo */}
                  <Row className="gy-3 mb-3">
                    <Col md={6}>
                      <Form.Group controlId="formCategoria">
                        <Form.Label className="fw-semibold">
                          Categoría <span className="text-danger">*</span>
                        </Form.Label>
                        <Form.Select
                          name="FK_id_categoria"
                          value={formData.FK_id_categoria}
                          onChange={handleChange}
                          required
                          className="form-control-focus"
                        >
                          <option value="">Seleccione...</option>
                          {categorias.map((cat) => (
                            <option
                              key={cat.PK_id_categoria}
                              value={cat.PK_id_categoria}
                            >
                              {cat.nombre_categoria}
                            </option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group controlId="formStockMinimo">
                        <Form.Label className="fw-semibold">
                          Stock Crítico (Alerta){" "}
                          <span className="text-danger">*</span>
                        </Form.Label>
                        <InputGroup>
                          <Form.Control
                            type="number"
                            name="stock_minimo"
                            value={formData.stock_minimo}
                            min="0"
                            onChange={handleChange}
                            required
                            className="form-control-focus"
                          />
                          <InputGroup.Text className="bg-white text-muted">
                            unid.
                          </InputGroup.Text>
                        </InputGroup>
                        <Form.Text className="text-muted small">
                          Nivel bajo el cual se activará la alerta.
                        </Form.Text>
                      </Form.Group>
                    </Col>
                  </Row>

                  {/* Fila 3: Fecha Vencimiento */}
                  <Form.Group className="mb-3" controlId="formFechaVencimiento">
                    <Form.Label className="fw-semibold">
                      Fecha Vencimiento (Opcional)
                    </Form.Label>
                    <Form.Control
                      type="date"
                      name="fecha_vencimiento"
                      value={formData.fecha_vencimiento || ""}
                      onChange={handleChange}
                      className="form-control-focus"
                    />
                  </Form.Group>

                  {/* Fila 4: Descripción */}
                  <Form.Group className="mb-4" controlId="formDescripcion">
                    <Form.Label className="fw-semibold">
                      Descripción / Observaciones
                    </Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      name="descripcion"
                      value={formData.descripcion || ""}
                      onChange={handleChange}
                      className="form-control-focus"
                      placeholder="Detalles adicionales del insumo..."
                    />
                  </Form.Group>

                  {/* Botón de Acción */}
                  <div className="d-grid">
                    <Button
                      variant="warning" // Color amarillo para indicar "Edición"
                      type="submit"
                      disabled={submitting}
                      size="lg"
                      className="text-dark fw-bold shadow-sm"
                    >
                      {submitting ? (
                        <>
                          <Spinner
                            as="span"
                            animation="border"
                            size="sm"
                            className="me-2"
                          />
                          Guardando cambios...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-save me-2"></i>Actualizar Insumo
                        </>
                      )}
                    </Button>
                  </div>
                </Form>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default InventarioEditPage;
