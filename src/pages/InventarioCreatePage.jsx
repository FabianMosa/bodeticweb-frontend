import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import insumoService from "../services/insumo.service";
import proveedorService from "../services/proveedor.service";
import documentoService from "../services/documento.service";
import ScannerModal from "../components/ScannerModal";
import LocationPicker from "../components/LocationPicker";
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
} from "react-bootstrap";

const InventarioCreatePage = () => {
  // --- Estados del Formulario ---
  const [formData, setFormData] = useState({
    nombre: "",
    sku: "",
    descripcion: "",
    stock_inicial: 0,
    stock_minimo: 1,
    id_categoria: "",
    fecha_vencimiento: "",
    id_proveedor: "",
    codigo_documento: "",
    fecha_emision: new Date().toISOString().split("T")[0],
  });

  // --- Estados de Archivos y Coordenadas ---
  const [imagenFile, setImagenFile] = useState(null);
  const [coordenadas, setCoordenadas] = useState(null);

  // --- Estados de Lógica de UI ---
  const [idDocumentoExistente, setIdDocumentoExistente] = useState(null);
  const [docLoading, setDocLoading] = useState(false);
  const [docReadOnly, setDocReadOnly] = useState(false);
  const [showScanner, setShowScanner] = useState(false);

  // --- Datos Maestros ---
  const [categorias, setCategorias] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [loadingDropdowns, setLoadingDropdowns] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const { showNotification } = useNotification();
  const navigate = useNavigate();

  // 1. Cargar desplegables
  useEffect(() => {
    const loadDropdowns = async () => {
      setLoadingDropdowns(true);
      try {
        const [categoriasData, proveedoresData] = await Promise.all([
          insumoService.getCategorias(),
          proveedorService.getProveedores(),
        ]);

        setCategorias(categoriasData);
        setProveedores(proveedoresData);

        // Valores por defecto
        if (categoriasData.length > 0) {
          setFormData((f) => ({
            ...f,
            id_categoria: categoriasData[0].PK_id_categoria,
          }));
        }
        if (proveedoresData.length > 0) {
          setFormData((f) => ({
            ...f,
            id_proveedor: proveedoresData[0].PK_id_proveedor,
          }));
        }
      } catch (err) {
        showNotification(
          err.message || "Error al cargar datos iniciales",
          "error"
        );
      } finally {
        setLoadingDropdowns(false);
      }
    };
    loadDropdowns();
  }, []);

  // Handler de inputs de texto
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "codigo_documento" && value === "") {
      resetDocumento();
    }
  };

  // Lógica: Buscar Documento
  const handleBuscarDocumento = async () => {
    if (!formData.codigo_documento) {
      showNotification("Ingrese un N° de Documento para buscar", "warning");
      return;
    }
    setDocLoading(true);
    try {
      const doc = await documentoService.getDocumentoByCodigo(
        formData.codigo_documento
      );
      if (doc) {
        showNotification(
          `Documento encontrado: ${doc.codigo_documento}`,
          "success"
        );
        setIdDocumentoExistente(doc.PK_id_documento);
        setFormData((prev) => ({
          ...prev,
          id_proveedor: doc.FK_id_proveedor,
          fecha_emision: doc.fecha_emision.split("T")[0],
        }));
        setDocReadOnly(true);
      } else {
        showNotification(
          "Documento no registrado. Complete los datos para crearlo.",
          "info"
        );
        resetDocumento(true);
      }
    } catch (err) {
      showNotification(err.message || "Error al buscar documento", "error");
    } finally {
      setDocLoading(false);
    }
  };

  const resetDocumento = (mantenerCodigo = false) => {
    setIdDocumentoExistente(null);
    setDocReadOnly(false);
    setFormData((prev) => ({
      ...prev,
      codigo_documento: mantenerCodigo ? prev.codigo_documento : "",
      id_proveedor:
        proveedores.length > 0 ? proveedores[0].PK_id_proveedor : "",
      fecha_emision: new Date().toISOString().split("T")[0],
    }));
  };

  const handleScanSuccess = (skuScaneado) => {
    setFormData((prev) => ({ ...prev, sku: skuScaneado }));
    setShowScanner(false);
    showNotification("Código escaneado correctamente", "success");
  };

  // 2. Envío del Formulario (Usando FormData para la imagen)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Crear objeto FormData para enviar archivos + texto
      const formDataToSend = new FormData();

      // Agregar campos de texto
      Object.keys(formData).forEach((key) => {
        // Enviar null si fecha_vencimiento está vacía
        if (key === "fecha_vencimiento" && !formData[key]) return;
        formDataToSend.append(key, formData[key]);
      });

      if (idDocumentoExistente) {
        formDataToSend.append("id_documento_existente", idDocumentoExistente);
      }

      // Agregar Imagen
      if (imagenFile) {
        formDataToSend.append("imagen", imagenFile);
      }

      // Agregar Coordenadas
      if (coordenadas) {
        formDataToSend.append("coordenada_x", coordenadas.x);
        formDataToSend.append("coordenada_y", coordenadas.y);
      }

      await insumoService.createInsumo(formDataToSend);

      showNotification("Insumo registrado exitosamente.", "success");
      navigate("/inventario");
    } catch (err) {
      showNotification(err.message || "Error al crear el insumo", "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingDropdowns)
    return (
      <Container
        fluid
        className="d-flex min-vh-100 justify-content-center align-items-center bg-light"
      >
        <div className="text-center">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2 text-muted">Cargando formulario...</p>
        </div>
      </Container>
    );

  return (
    <Container className="py-4">
      <Row className="justify-content-center">
        <Col xs={12} lg={10} xl={8}>
          {/* Header y Botón Volver */}
          <div className="d-flex align-items-center mb-4">
            <Button
              variant="outline-secondary"
              size="sm"
              as={Link}
              to="/inventario"
              className="me-3"
            >
              <i className="bi bi-arrow-left"></i>
            </Button>
            <h2 className="h4 mb-0 text-dark fw-bold">
              Nuevo Ingreso de Material
            </h2>
          </div>

          <Form onSubmit={handleSubmit}>
            {/* --- SECCIÓN 1: DATOS DE ORIGEN (DOCUMENTO) --- */}
            <Card className="shadow-sm mb-4 border-0 rounded-3">
              <Card.Header className="bg-white border-bottom pt-4 pb-2">
                <h5 className="text-primary fw-bold mb-0">
                  <i className="bi bi-file-earmark-text me-2"></i>1. Origen del
                  Insumo
                </h5>
              </Card.Header>
              <Card.Body>
                <Row className="gy-3">
                  <Col md={12}>
                    <Form.Group controlId="formCodigoDoc">
                      <Form.Label className="fw-semibold">
                        N° Documento (Factura/Guía){" "}
                        <span className="text-danger">*</span>
                      </Form.Label>
                      <InputGroup>
                        <Form.Control
                          type="text"
                          name="codigo_documento"
                          value={formData.codigo_documento}
                          onChange={handleChange}
                          required
                          placeholder="Ej: 123456"
                          className="form-control-lg"
                          readOnly={docReadOnly}
                        />
                        <Button
                          variant={docReadOnly ? "outline-danger" : "primary"}
                          onClick={
                            docReadOnly
                              ? () => resetDocumento(false)
                              : handleBuscarDocumento
                          }
                          disabled={docLoading}
                          title={
                            docReadOnly
                              ? "Limpiar búsqueda"
                              : "Buscar si existe"
                          }
                        >
                          {docLoading ? (
                            <Spinner as="span" size="sm" animation="border" />
                          ) : docReadOnly ? (
                            <i className="bi bi-x-lg"></i>
                          ) : (
                            <i className="bi bi-search"></i>
                          )}
                        </Button>
                      </InputGroup>
                      <Form.Text className="text-muted">
                        Si el documento ya existe, los datos se completarán
                        automáticamente.
                      </Form.Text>
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group controlId="formProveedor">
                      <Form.Label>
                        Proveedor <span className="text-danger">*</span>
                      </Form.Label>
                      <Form.Select
                        name="id_proveedor"
                        onChange={handleChange}
                        required
                        value={formData.id_proveedor}
                        disabled={docReadOnly || proveedores.length === 0}
                        className="form-select"
                      >
                        {proveedores.map((prov) => (
                          <option
                            key={prov.PK_id_proveedor}
                            value={prov.PK_id_proveedor}
                          >
                            {prov.nombre_proveedor}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group controlId="formFechaEmision">
                      <Form.Label>
                        Fecha Emisión <span className="text-danger">*</span>
                      </Form.Label>
                      <Form.Control
                        type="date"
                        name="fecha_emision"
                        value={formData.fecha_emision}
                        onChange={handleChange}
                        required
                        readOnly={docReadOnly}
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            {/* --- SECCIÓN 2: DATOS DEL INSUMO --- */}
            <Card className="shadow-sm mb-4 border-0 rounded-3">
              <Card.Header className="bg-white border-bottom pt-4 pb-2">
                <h5 className="text-success fw-bold mb-0">
                  <i className="bi bi-box-seam me-2"></i>2. Detalle del Insumo
                </h5>
              </Card.Header>
              <Card.Body>
                <Row className="gy-3">
                  <Col md={8}>
                    <Form.Group controlId="formNombre">
                      <Form.Label>
                        Nombre del Artículo{" "}
                        <span className="text-danger">*</span>
                      </Form.Label>
                      <Form.Control
                        type="text"
                        name="nombre"
                        value={formData.nombre}
                        onChange={handleChange}
                        required
                        placeholder="Ej: Disco Duro SSD 1TB"
                      />
                    </Form.Group>
                  </Col>

                  <Col md={4}>
                    <Form.Group controlId="formSku">
                      <Form.Label>
                        SKU / Código Barra{" "}
                        <span className="text-danger">*</span>
                      </Form.Label>
                      <InputGroup>
                        <Form.Control
                          type="text"
                          name="sku"
                          value={formData.sku}
                          onChange={handleChange}
                          required
                          placeholder="Escanee o escriba..."
                        />
                        <Button
                          variant="secondary"
                          onClick={() => setShowScanner(true)}
                          title="Activar cámara"
                        >
                          <i className="bi bi-upc-scan"></i>
                        </Button>
                      </InputGroup>
                    </Form.Group>
                  </Col>

                  <Col md={4}>
                    <Form.Group controlId="formCategoria">
                      <Form.Label>
                        Categoría <span className="text-danger">*</span>
                      </Form.Label>
                      <Form.Select
                        name="id_categoria"
                        onChange={handleChange}
                        required
                        value={formData.id_categoria}
                        disabled={categorias.length === 0}
                      >
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

                  <Col md={4}>
                    <Form.Group controlId="formStockInicial">
                      <Form.Label>
                        Cantidad (Stock Inicial){" "}
                        <span className="text-danger">*</span>
                      </Form.Label>
                      <Form.Control
                        type="number"
                        name="stock_inicial"
                        min="1"
                        value={formData.stock_inicial}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                  </Col>

                  <Col md={4}>
                    <Form.Group controlId="formStockMinimo">
                      <Form.Label>
                        Stock Crítico (Alerta){" "}
                        <span className="text-danger">*</span>
                      </Form.Label>
                      <Form.Control
                        type="number"
                        name="stock_minimo"
                        min="0"
                        value={formData.stock_minimo}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                  </Col>

                  <Col md={12}>
                    <Form.Group controlId="formDescripcion">
                      <Form.Label>Descripción / Observaciones</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={2}
                        name="descripcion"
                        value={formData.descripcion}
                        onChange={handleChange}
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group controlId="formFechaVencimiento">
                      <Form.Label>Fecha Vencimiento (Opcional)</Form.Label>
                      <Form.Control
                        type="date"
                        name="fecha_vencimiento"
                        value={formData.fecha_vencimiento}
                        onChange={handleChange}
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            {/* --- SECCIÓN 3: UBICACIÓN VISUAL --- */}
            <Card className="shadow-sm mb-4 border-0 rounded-3">
              <Card.Header className="bg-white border-bottom pt-4 pb-2">
                <h5 className="text-info fw-bold mb-0">
                  <i className="bi bi-geo-alt-fill me-2"></i>3. Ubicación Física
                </h5>
              </Card.Header>
              <Card.Body>
                <LocationPicker
                  onImageSelect={setImagenFile}
                  onLocationSelect={setCoordenadas}
                />
              </Card.Body>
            </Card>

            {/* --- BOTÓN FINAL --- */}
            <div className="d-grid gap-2 mb-5">
              <Button
                variant="success"
                type="submit"
                disabled={submitting || docLoading}
                size="lg"
                className="shadow-sm py-3 fw-bold"
              >
                {submitting ? (
                  <>
                    <Spinner
                      as="span"
                      size="sm"
                      animation="border"
                      className="me-2"
                    />
                    Registrando Insumo...
                  </>
                ) : (
                  <>
                    <i className="bi bi-check-circle-fill me-2"></i>Confirmar
                    Ingreso
                  </>
                )}
              </Button>
            </div>
          </Form>
        </Col>
      </Row>

      {/* Modal de Escáner */}
      {showScanner && (
        <ScannerModal
          onClose={() => setShowScanner(false)}
          onScanSuccess={handleScanSuccess}
        />
      )}

      {/* Estilos Adicionales */}
      <style>{`
        .form-control:focus, .form-select:focus {
          border-color: #86b7fe;
          box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
        }
      `}</style>
    </Container>
  );
};

export default InventarioCreatePage;
