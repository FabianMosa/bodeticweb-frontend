import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Button,
  Table,
  Card,
  Spinner,
  Form,
  Pagination,
  InputGroup,
  Badge,
  Modal,
} from "react-bootstrap";
import {
  Plus,
  ScanLine,
  Search,
  MapPin,
  Edit,
  Trash2,
  RotateCcw,
  LogOut,
  ArrowLeft,
  Save,
  X,
  Crosshair,
  Camera,
} from "lucide-react";

/**
 * Servicios y componentes locales.
 */
import insumoService from "../services/insumo.service";
import SalidaModal from "../components/SalidaModal";
import ScannerModal from "../components/ScannerModal";
import { useNotification } from "../context/NotificationContext";

/**
 * COMPONENTE INTERNO: Modal de Edición de Ubicación
 * Integrado aquí para personalizar la interfaz de carga de archivos (Español).
 */
const LocationEditorModal = ({
  show,
  onHide,
  insumo,
  onUpdateSuccess,
  usuarioRol,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [fileToUpload, setFileToUpload] = useState(null);
  const [coords, setCoords] = useState({ x: 50, y: 50 });
  const [saving, setSaving] = useState(false);
  const imageRef = useRef(null);

  const { showNotification } = useNotification();

  // Reiniciar estados al abrir el modal o cambiar de insumo
  useEffect(() => {
    if (show && insumo) {
      setIsEditing(false);
      setFileToUpload(null);
      setPreviewImage(null);
      setCoords({
        x: insumo.coordenada_x || 50,
        y: insumo.coordenada_y || 50,
      });
    }
  }, [show, insumo]);

  // Limpieza de memoria
  useEffect(() => {
    return () => {
      if (previewImage) URL.revokeObjectURL(previewImage);
    };
  }, [previewImage]);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        showNotification(
          "El archivo seleccionado debe ser una imagen.",
          "error"
        );
        return;
      }

      setFileToUpload(file);
      const objectUrl = URL.createObjectURL(file);
      setPreviewImage(objectUrl);
      setCoords({ x: 50, y: 50 }); // Resetear coordenadas al centro
    }
  };

  const handleImageClick = (e) => {
    if (!isEditing) return;
    const rect = e.target.getBoundingClientRect();
    const x = parseFloat(
      (((e.clientX - rect.left) / rect.width) * 100).toFixed(2)
    );
    const y = parseFloat(
      (((e.clientY - rect.top) / rect.height) * 100).toFixed(2)
    );
    setCoords({ x, y });
  };

  const handleSave = async () => {
    if (!insumo) return;
    try {
      setSaving(true);
      const formData = new FormData();
      formData.append("coordenada_x", coords.x);
      formData.append("coordenada_y", coords.y);
      if (fileToUpload) {
        formData.append("imagen_ubicacion", fileToUpload);
      }

      const response = await insumoService.updateUbicacion(
        insumo.PK_id_insumo,
        formData
      );

      onUpdateSuccess(insumo.PK_id_insumo, {
        imagen_ubicacion:
          response.imagen_ubicacion ||
          (previewImage ? "blob:updated" : insumo.imagen_ubicacion),
        coordenada_x: coords.x,
        coordenada_y: coords.y,
      });

      showNotification("Ubicación actualizada correctamente.", "success");
      onHide();
    } catch (err) {
      showNotification(
        err.message || "Error al guardar la ubicación.",
        "error"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFileToUpload(null);
    setPreviewImage(null);
    setCoords({
      x: insumo.coordenada_x || 50,
      y: insumo.coordenada_y || 50,
    });
  };

  const displayImage = previewImage || insumo?.imagen_ubicacion;

  return (
    <Modal show={show} onHide={onHide} centered size="lg" backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title className="h5 fw-bold d-flex align-items-center gap-2">
          {isEditing ? (
            <>
              <Crosshair size={20} className="text-danger" /> Definir Ubicación
            </>
          ) : (
            <>
              <MapPin size={20} className="text-primary" /> Ubicación en Bodega
            </>
          )}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="text-center bg-light">
        {insumo && (
          <>
            <div className="d-flex justify-content-between align-items-center mb-3 px-1">
              <h5 className="mb-0 text-dark fw-bold text-start">
                {insumo.nombre}
              </h5>

              {!isEditing && usuarioRol === 1 && (
                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                  className="d-flex align-items-center gap-2 shadow-sm"
                >
                  <Edit size={16} /> Editar Ubicación
                </Button>
              )}
            </div>

            {isEditing && (
              <Card className="mb-3 border-0 shadow-sm animate-fade-in">
                <Card.Body className="py-3 text-start">
                  <Form.Group className="mb-3">
                    <Form.Label className="small fw-bold text-uppercase text-secondary d-flex align-items-center gap-2">
                      <Camera size={16} /> 1. Capturar o Subir Foto
                    </Form.Label>

                    {/* CUSTOM FILE INPUT EN ESPAÑOL */}
                    <div className="d-flex flex-column gap-2">
                      <div className="d-flex align-items-center gap-3">
                        <label
                          htmlFor="custom-file-upload"
                          className="btn btn-outline-primary btn-sm d-flex align-items-center gap-2 cursor-pointer"
                          style={{ cursor: "pointer" }}
                        >
                          <Camera size={16} />
                          <span>
                            {fileToUpload
                              ? "Cambiar foto"
                              : "Tomar o Subir Foto"}
                          </span>
                        </label>
                        <input
                          id="custom-file-upload"
                          type="file"
                          accept="image/*"
                          onChange={handleFileSelect}
                          style={{ display: "none" }} // Ocultamos el input nativo (Choose file)
                        />
                        <span
                          className="small text-muted text-truncate"
                          style={{ maxWidth: "250px" }}
                        >
                          {fileToUpload
                            ? fileToUpload.name
                            : "Ningún archivo seleccionado"}
                        </span>
                      </div>
                      <Form.Text className="text-muted small">
                        Compatible con cámara móvil y galería. Formatos: JPG,
                        PNG.
                      </Form.Text>

                      {fileToUpload && (
                        <div className="mt-1">
                          <Button
                            variant="link"
                            className="text-danger p-0 small text-decoration-none"
                            size="sm"
                            onClick={() => {
                              setFileToUpload(null);
                              setPreviewImage(null);
                            }}
                          >
                            <X size={14} className="me-1" /> Eliminar selección
                          </Button>
                        </div>
                      )}
                    </div>
                  </Form.Group>

                  <div className="small text-muted border-top pt-2 mt-2">
                    <span className="fw-bold text-dark">
                      2. Marcar Posición:
                    </span>{" "}
                    Toca la imagen para indicar dónde está el insumo.
                  </div>
                </Card.Body>
              </Card>
            )}

            <div
              className={`position-relative bg-dark rounded-3 overflow-hidden shadow-inner ${
                isEditing ? "cursor-crosshair" : ""
              }`}
              style={{ minHeight: "300px", border: "1px solid #dee2e6" }}
            >
              {displayImage ? (
                <div className="position-relative w-100 h-100">
                  <img
                    ref={imageRef}
                    src={displayImage}
                    alt={`Ubicación de ${insumo.nombre}`}
                    className="img-fluid w-100"
                    style={{ maxHeight: "550px", objectFit: "contain" }}
                    onClick={handleImageClick}
                  />

                  <div
                    className="position-absolute shadow-lg"
                    style={{
                      left: `${coords.x}%`,
                      top: `${coords.y}%`,
                      width: "24px",
                      height: "24px",
                      backgroundColor: "#dc3545",
                      border: "3px solid white",
                      borderRadius: "50%",
                      transform: "translate(-50%, -50%)",
                      pointerEvents: "none",
                      transition:
                        "all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
                      boxShadow: "0 4px 6px rgba(0,0,0,0.3)",
                      zIndex: 10,
                    }}
                  >
                    {isEditing && (
                      <div
                        className="bg-white rounded-circle position-absolute top-50 start-50 translate-middle"
                        style={{ width: "6px", height: "6px" }}
                      />
                    )}
                  </div>
                </div>
              ) : (
                <div className="d-flex flex-column align-items-center justify-content-center py-5 h-100 text-white-50">
                  <MapPin size={48} className="mb-3 opacity-50" />
                  <p className="mb-1">No hay imagen de ubicación.</p>
                  {isEditing && (
                    <p className="small text-warning">
                      Sube una foto para comenzar.
                    </p>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </Modal.Body>

      <Modal.Footer className="bg-white">
        {isEditing ? (
          <>
            <Button
              variant="light"
              onClick={handleCancel}
              disabled={saving}
              className="text-secondary fw-bold"
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={handleSave}
              disabled={saving}
              className="d-flex align-items-center gap-2 fw-bold px-4"
            >
              {saving ? (
                <Spinner size="sm" animation="border" />
              ) : (
                <Save size={18} />
              )}
              Guardar Cambios
            </Button>
          </>
        ) : (
          <Button variant="secondary" onClick={onHide}>
            Cerrar
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
};

// --- COMPONENTE PRINCIPAL ---

const InventarioPage = () => {
  // --- Estados de Aplicación ---
  const [insumos, setInsumos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [usuarioRol, setUsuarioRol] = useState(null);
  const [categorias, setCategorias] = useState([]);

  // --- Estados de Filtrado y Búsqueda ---
  const [filtroActivo, setFiltroActivo] = useState(true);
  const [filtroCategoria, setFiltroCategoria] = useState("");
  const [filtroNombre, setFiltroNombre] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // --- Paginación ---
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const ITEMS_PER_PAGE = 20;

  // --- Control de Modales ---
  const [salidaModalOpen, setSalidaModalOpen] = useState(false);
  const [scannerModalOpen, setScannerModalOpen] = useState(false);
  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const [selectedInsumo, setSelectedInsumo] = useState(null);

  const { showNotification } = useNotification();

  // --- Efecto de Carga de Datos ---
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        if (categorias.length === 0) {
          const categoriasData = await insumoService.getCategorias();
          setCategorias(categoriasData);
        }

        const filtros = {
          activo: filtroActivo,
          categoria: filtroCategoria,
          search: filtroNombre,
        };

        const response = await insumoService.getInsumos(
          filtros,
          currentPage,
          ITEMS_PER_PAGE
        );

        setInsumos(response.data);
        setTotalPages(response.pagination.totalPages);
      } catch (err) {
        showNotification(err.message || "Error al cargar datos", "error");
      } finally {
        setLoading(false);
      }
    };

    loadData();

    const usuarioInfo = JSON.parse(localStorage.getItem("usuario"));
    if (usuarioInfo) setUsuarioRol(usuarioInfo.usuario.rol);
  }, [
    filtroActivo,
    filtroCategoria,
    filtroNombre,
    currentPage,
    categorias.length,
    showNotification,
  ]);

  // --- Manejadores de Eventos ---
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setFiltroNombre(searchTerm);
    setCurrentPage(1);
  };

  const handleToggleActivo = async (insumo) => {
    const nuevoEstado = !insumo.activo;
    const confirmMsg = `¿Está seguro que desea ${
      nuevoEstado ? "habilitar" : "deshabilitar"
    } el insumo "${insumo.nombre}"?`;

    if (window.confirm(confirmMsg)) {
      try {
        await insumoService.toggleActivo(insumo.PK_id_insumo, nuevoEstado);

        setInsumos((prevInsumos) =>
          prevInsumos.map((i) =>
            i.PK_id_insumo === insumo.PK_id_insumo
              ? { ...i, activo: nuevoEstado }
              : i
          )
        );
        showNotification(
          `Insumo ${nuevoEstado ? "habilitado" : "deshabilitado"}`,
          "success"
        );
      } catch (err) {
        showNotification(err.message || "Error al cambiar el estado", "error");
      }
    }
  };

  const handleOpenScanner = () => setScannerModalOpen(true);

  const handleOpenSalidaModal = (insumo) => {
    setSelectedInsumo(insumo);
    setSalidaModalOpen(true);
  };

  const handleOpenLocationModal = (insumo) => {
    setSelectedInsumo(insumo);
    setLocationModalOpen(true);
  };

  const handleLocationUpdate = (insumoId, nuevosDatos) => {
    setInsumos((prevInsumos) =>
      prevInsumos.map((i) =>
        i.PK_id_insumo === insumoId
          ? {
              ...i,
              imagen_ubicacion:
                nuevosDatos.imagen_ubicacion === "blob:updated"
                  ? i.imagen_ubicacion
                  : nuevosDatos.imagen_ubicacion,
              coordenada_x: nuevosDatos.coordenada_x,
              coordenada_y: nuevosDatos.coordenada_y,
            }
          : i
      )
    );
  };

  const handleScanSuccess = async (sku) => {
    setScannerModalOpen(false);
    setLoading(true);
    try {
      const insumoEncontrado = await insumoService.getInsumoBySku(sku);
      if (insumoEncontrado) {
        handleOpenSalidaModal(insumoEncontrado);
      } else {
        showNotification(`SKU "${sku}" no encontrado.`, "error");
      }
    } catch (err) {
      showNotification(err.message || "Error al buscar el SKU", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSalidaSuccess = (insumoId, nuevoStock) => {
    setInsumos((prevInsumos) =>
      prevInsumos.map((insumo) =>
        insumo.PK_id_insumo === insumoId
          ? { ...insumo, stock_actual: nuevoStock }
          : insumo
      )
    );
  };

  return (
    <Container fluid className="bg-light min-vh-100 py-4 ">
      <style>{`
        .table-hover tbody tr:hover { background-color: rgba(13, 110, 253, 0.04); }
        .btn-icon { width: 32px; height: 32px; padding: 0; display: inline-flex; align-items: center; justify-content: center; border-radius: 6px; }
        .btn-icon:hover { background-color: #e9ecef; transform: translateY(-2px); transition: all 0.2s; }
        .cursor-crosshair { cursor: crosshair; }
        .animate-fade-in { animation: fadeIn 0.3s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      {/* Título y Acciones Globales */}
      <Row className="mb-2 align-items-center">
        <Col className="d-flex justify-content-between align-items-center mb-4">
          <Col xs="auto">
            <Button
              variant="outline-secondary"
              size="lg"
              as={Link}
              to="/dashboard"
              className="me-3"
            >
              <ArrowLeft size={24} />
            </Button>
          </Col>
          <Col>
            <h2 className="fw-bold text-dark m-0">Gestión de Inventario</h2>
            <p className="text-muted small mb-0">
              Control de insumos y materiales
            </p>
          </Col>
          <Col xs="auto" className="d-flex gap-2">
            {usuarioRol === 1 && (
              <Button
                variant="success"
                as={Link}
                to="/inventario/nuevo"
                className="shadow-sm rounded-pill px-3 d-flex align-items-center gap-2"
              >
                <Plus size={18} />{" "}
                <span className="d-none d-md-inline">Nuevo Insumo</span>
              </Button>
            )}
            <Button
              variant="primary"
              onClick={handleOpenScanner}
              className="shadow-sm rounded-pill px-3 d-flex align-items-center gap-2"
            >
              <ScanLine size={18} />{" "}
              <span className="d-none d-md-inline">Escanear</span>
            </Button>
          </Col>
        </Col>
      </Row>

      {/* Panel de Filtros */}
      <Card className="shadow-sm border-0 mb-4 rounded-4">
        <Card.Body className="p-4">
          <Form onSubmit={handleSearchSubmit}>
            <Row className="g-3 align-items-end">
              <Col xs={12} lg={5}>
                <Form.Label className="small fw-bold text-secondary text-uppercase">
                  Buscador
                </Form.Label>
                <InputGroup>
                  <InputGroup.Text className="bg-white border-end-0 text-muted">
                    <Search size={16} />
                  </InputGroup.Text>
                  <Form.Control
                    type="text"
                    placeholder="Nombre o SKU..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="border-start-0 shadow-none"
                  />
                  <Button variant="outline-primary" type="submit">
                    Buscar
                  </Button>
                </InputGroup>
              </Col>

              <Col xs={12} md={6} lg={3}>
                <Form.Label className="small fw-bold text-secondary text-uppercase">
                  Categoría
                </Form.Label>
                <Form.Select
                  value={filtroCategoria}
                  onChange={(e) => setFiltroCategoria(e.target.value)}
                  disabled={categorias.length === 0}
                  className="shadow-none"
                >
                  <option value="">Todas</option>
                  {categorias.map((cat) => (
                    <option
                      key={cat.PK_id_categoria}
                      value={cat.PK_id_categoria}
                    >
                      {cat.nombre_categoria}
                    </option>
                  ))}
                </Form.Select>
              </Col>

              <Col xs={12} md={6} lg={4}>
                <div className="bg-light rounded p-1 border d-flex">
                  <Button
                    variant={filtroActivo ? "white" : "light"}
                    className={`flex-grow-1 border-0 small fw-bold ${
                      filtroActivo
                        ? "shadow-sm text-primary bg-white"
                        : "text-muted"
                    }`}
                    onClick={() => {
                      setFiltroActivo(true);
                      setCurrentPage(1);
                    }}
                  >
                    Activos
                  </Button>
                  <Button
                    variant={!filtroActivo ? "white" : "light"}
                    className={`flex-grow-1 border-0 small fw-bold ${
                      !filtroActivo
                        ? "shadow-sm text-danger bg-white"
                        : "text-muted"
                    }`}
                    onClick={() => {
                      setFiltroActivo(false);
                      setCurrentPage(1);
                    }}
                  >
                    Papelera
                  </Button>
                </div>
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>

      {/* Tabla de Resultados */}
      <Card className="shadow-lg border-0 rounded-4 overflow-hidden">
        <Card.Body className="p-0">
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-3 text-muted">Cargando inventario...</p>
            </div>
          ) : (
            <>
              <Table hover responsive="md" className="align-center mb-0">
                <thead className="bg-light text-secondary text-uppercase small fw-bold">
                  <tr>
                    <th className="py-3 ps-4">Insumo</th>
                    <th className="py-3 text-center">Stock</th>
                    <th className="py-3">Categoria</th>
                    <th className="py-3 pe-4 text-end">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {insumos.length > 0 ? (
                    insumos.map((insumo) => (
                      <tr
                        key={insumo.PK_id_insumo}
                        className={`border-bottom ${
                          !insumo.activo ? "bg-light opacity-50" : ""
                        }`}
                      >
                        <td className="ps-4">
                          <div className="fw-bold text-dark">
                            {insumo.nombre}
                          </div>
                          <div className="small text-muted font-monospace">
                            SKU: {insumo.sku}
                          </div>
                        </td>
                        <td className="text-center">
                          <h5
                            className={`m-0 fw-bold ${
                              insumo.stock_actual <= insumo.stock_minimo &&
                              insumo.activo
                                ? "text-danger"
                                : "text-dark"
                            }`}
                          >
                            {insumo.stock_actual}
                          </h5>
                        </td>

                        <td>
                          <div className="d-flex align-items-center gap-2">
                            {/* Botón de Ubicación */}
                            {!!insumo.activo && (
                              <Button
                                variant="link"
                                className="p-1 text-primary rounded-circle bg-primary-subtle"
                                onClick={() => handleOpenLocationModal(insumo)}
                                title="Ver/Editar ubicación física"
                                style={{
                                  width: "28px",
                                  height: "28px",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                }}
                              >
                                <MapPin size={14} />
                              </Button>
                            )}
                            <Badge
                              bg="light"
                              text="dark"
                              className="border fw-normal px-2 py-1"
                            >
                              {insumo.nombre_categoria}
                            </Badge>
                          </div>
                        </td>

                        <td className="pe-4 text-end">
                          <div className="d-flex justify-content-end gap-1">
                            {usuarioRol === 1 && (
                              <>
                                <Button
                                  variant="light"
                                  size="sm"
                                  className="btn-icon border text-warning"
                                  as={Link}
                                  to={`/inventario/editar/${insumo.PK_id_insumo}`}
                                  title="Editar"
                                >
                                  <Edit size={16} />
                                </Button>
                                <Button
                                  variant="light"
                                  size="sm"
                                  className="btn-icon border"
                                  onClick={() => handleToggleActivo(insumo)}
                                  title={
                                    insumo.activo ? "Deshabilitar" : "Habilitar"
                                  }
                                >
                                  {insumo.activo ? (
                                    <Trash2 size={16} className="text-danger" />
                                  ) : (
                                    <RotateCcw
                                      size={16}
                                      className="text-success"
                                    />
                                  )}
                                </Button>
                              </>
                            )}

                            {!!insumo.activo && (
                              <Button
                                variant="primary"
                                size="sm"
                                className="d-flex align-items-center ms-2 px-3 gap-1"
                                onClick={() => handleOpenSalidaModal(insumo)}
                                disabled={insumo.stock_actual === 0}
                              >
                                <LogOut size={16} /> Salida
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="text-center py-5 text-muted">
                        No se encontraron insumos.
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>

              {totalPages > 1 && (
                <div className="d-flex justify-content-center py-3 border-top">
                  <Pagination className="mb-0">
                    <Pagination.First
                      onClick={() => setCurrentPage(1)}
                      disabled={currentPage === 1}
                    />
                    <Pagination.Prev
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    />
                    <Pagination.Item active>{currentPage}</Pagination.Item>
                    <Pagination.Next
                      onClick={() =>
                        setCurrentPage((p) => Math.min(totalPages, p + 1))
                      }
                      disabled={currentPage === totalPages}
                    />
                    <Pagination.Last
                      onClick={() => setCurrentPage(totalPages)}
                      disabled={currentPage === totalPages}
                    />
                  </Pagination>
                </div>
              )}
            </>
          )}
        </Card.Body>
      </Card>

      {/* --- Modales --- */}
      {salidaModalOpen && (
        <SalidaModal
          insumo={selectedInsumo}
          onClose={() => setSalidaModalOpen(false)}
          onSuccess={handleSalidaSuccess}
        />
      )}

      {scannerModalOpen && (
        <ScannerModal
          onClose={() => setScannerModalOpen(false)}
          onScanSuccess={handleScanSuccess}
        />
      )}

      {/* Nuevo Modal de Ubicación (Híbrido Visor/Editor) - Ahora Integrado */}
      <LocationEditorModal
        show={locationModalOpen}
        onHide={() => setLocationModalOpen(false)}
        insumo={selectedInsumo}
        onUpdateSuccess={handleLocationUpdate}
        usuarioRol={usuarioRol}
      />
    </Container>
  );
};

export default InventarioPage;
