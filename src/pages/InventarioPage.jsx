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
  ArrowLeft,
  Plus,
  ScanLine,
  Search,
  MapPin,
  Edit,
  Trash2,
  RotateCcw,
  LogOut,
  Upload,
  Save,
  X,
  Crosshair,
} from "lucide-react";

import insumoService from "../services/insumo.service";
import SalidaModal from "../components/SalidaModal";
import ScannerModal from "../components/ScannerModal";
import LocationViewer from "../components/LocationViewer";
import { useNotification } from "../context/NotificationContext";

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

  // --- Estados para EDICIÓN DE UBICACIÓN ---
  const [isEditingLocation, setIsEditingLocation] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [tempCoords, setTempCoords] = useState({ x: 0, y: 0 });
  const [fileToUpload, setFileToUpload] = useState(null);
  const [savingLocation, setSavingLocation] = useState(false);
  const imageRef = useRef(null);

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

  // --- Manejadores de Eventos Generales ---
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

  // --- LÓGICA DE GESTIÓN DE UBICACIÓN (MODAL) ---

  const handleOpenLocationModal = (insumo) => {
    setSelectedInsumo(insumo);
    // Inicializar estados de edición con los datos actuales
    setIsEditingLocation(false);
    setPreviewImage(insumo.imagen_ubicacion);
    setTempCoords({
      x: insumo.coordenada_x || 50,
      y: insumo.coordenada_y || 50,
    });
    setFileToUpload(null);
    setLocationModalOpen(true);
  };

  const handleCloseLocationModal = () => {
    setLocationModalOpen(false);
    setIsEditingLocation(false);
    setFileToUpload(null);
    setPreviewImage(null);
  };

  // Manejar selección de nueva imagen
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileToUpload(file);
      // Crear URL temporal para previsualización
      const objectUrl = URL.createObjectURL(file);
      setPreviewImage(objectUrl);
      // Resetear coordenadas al centro por defecto al cambiar imagen
      setTempCoords({ x: 50, y: 50 });
    }
  };

  // Manejar clic en la imagen para obtener coordenadas X/Y en porcentaje
  const handleImageClick = (e) => {
    if (!isEditingLocation) return;

    const rect = e.target.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setTempCoords({ x, y });
  };

  // Guardar cambios de ubicación
  const handleSaveLocation = async () => {
    try {
      setSavingLocation(true);

      const formData = new FormData();
      formData.append("coordenada_x", tempCoords.x);
      formData.append("coordenada_y", tempCoords.y);
      if (fileToUpload) {
        formData.append("imagen_ubicacion", fileToUpload);
      }

      // Llamada al servicio (asumiendo que existe el método updateUbicacion)
      // Si el método tiene otro nombre, ajústalo aquí.
      const response = await insumoService.updateUbicacion(
        selectedInsumo.PK_id_insumo,
        formData
      );

      // Actualizar estado local optimista o con la respuesta del servidor
      setInsumos((prev) =>
        prev.map((i) =>
          i.PK_id_insumo === selectedInsumo.PK_id_insumo
            ? {
                ...i,
                // Usar la URL devuelta por el servidor o mantener la anterior si no se subió nueva
                imagen_ubicacion:
                  response.imagen_ubicacion || i.imagen_ubicacion,
                coordenada_x: tempCoords.x,
                coordenada_y: tempCoords.y,
              }
            : i
        )
      );

      showNotification("Ubicación actualizada correctamente", "success");
      handleCloseLocationModal();
    } catch (err) {
      showNotification(err.message || "Error al guardar ubicación", "error");
    } finally {
      setSavingLocation(false);
    }
  };

  return (
    <Container fluid className="bg-light min-vh-100 py-4 ">
      <style>{`
        .table-hover tbody tr:hover { background-color: rgba(13, 110, 253, 0.04); }
        .btn-icon { width: 32px; height: 32px; padding: 0; display: inline-flex; align-items: center; justify-content: center; border-radius: 6px; }
        .btn-icon:hover { background-color: #e9ecef; transform: translateY(-2px); transition: all 0.2s; }
        .location-marker {
            width: 24px;
            height: 24px;
            background-color: rgba(220, 53, 69, 0.8);
            border: 2px solid white;
            border-radius: 50%;
            position: absolute;
            transform: translate(-50%, -50%);
            pointer-events: none;
            box-shadow: 0 2px 5px rgba(0,0,0,0.3);
            transition: all 0.2s ease-out;
            z-index: 10;
        }
        .crosshair-cursor { cursor: crosshair; }
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
              <Table hover responsive="md" className="align-middle mb-0">
                <thead className="bg-light text-secondary text-uppercase small fw-bold">
                  <tr>
                    <th className="py-3 ps-4">Insumo</th>
                    <th className="py-3">Categoría</th>
                    <th className="py-3 text-center">Stock</th>
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

                        <td>
                          <div className="d-flex align-items-center gap-2">
                            <Badge
                              bg="light"
                              text="dark"
                              className="border fw-normal px-2 py-1"
                            >
                              {insumo.nombre_categoria}
                            </Badge>

                            {!!insumo.activo && (
                              <Button
                                variant="link"
                                className="p-1 text-primary rounded-circle bg-primary-subtle"
                                onClick={() => handleOpenLocationModal(insumo)}
                                title="Ver ubicación física"
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

      {/* --- Modales de Interacción --- */}
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

      {/* --- MODAL DE UBICACIÓN (VER Y EDITAR) --- */}
      <Modal
        show={locationModalOpen}
        onHide={handleCloseLocationModal}
        centered
        size="lg"
        backdrop="static"
      >
        <Modal.Header closeButton>
          <Modal.Title className="h5 fw-bold d-flex align-items-center gap-2">
            {isEditingLocation ? (
              <>
                <Crosshair size={20} className="text-danger" /> Definir
                Ubicación
              </>
            ) : (
              <>
                <MapPin size={20} className="text-primary" /> Ubicación en
                Bodega
              </>
            )}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body className="text-center">
          {selectedInsumo && (
            <>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="mb-0 text-secondary text-start">
                  {selectedInsumo.nombre}
                </h5>

                {/* Botón para cambiar a modo edición */}
                {!isEditingLocation && usuarioRol === 1 && (
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => setIsEditingLocation(true)}
                    className="d-flex align-items-center gap-2"
                  >
                    <Edit size={16} /> Modificar Ubicación
                  </Button>
                )}
              </div>

              {/* Controles de Edición */}
              {isEditingLocation && (
                <Card className="mb-3 bg-light border-0">
                  <Card.Body className="py-3">
                    <Form.Group>
                      <Form.Label className="small fw-bold text-muted w-100 text-start">
                        1. Subir nueva fotografía (Opcional)
                      </Form.Label>
                      <div className="d-flex gap-2">
                        <Form.Control
                          type="file"
                          accept="image/*"
                          onChange={handleFileSelect}
                          size="sm"
                        />
                        {fileToUpload && (
                          <Button
                            variant="outline-secondary"
                            size="sm"
                            onClick={() => {
                              setFileToUpload(null);
                              setPreviewImage(selectedInsumo.imagen_ubicacion);
                            }}
                          >
                            <X size={16} />
                          </Button>
                        )}
                      </div>
                      <Form.Text className="text-muted small text-start d-block mt-1">
                        Si no subes una imagen, se usará la actual.
                      </Form.Text>
                    </Form.Group>

                    <div className="mt-3 text-start">
                      <span className="small fw-bold text-muted">
                        2. Marcar posición:{" "}
                      </span>
                      <span className="small text-danger">
                        Haz clic sobre la imagen para mover el indicador.
                      </span>
                    </div>
                  </Card.Body>
                </Card>
              )}

              {/* Visor de Imagen / Área de Clic */}
              <div
                className={`position-relative bg-dark rounded overflow-hidden border ${
                  isEditingLocation ? "crosshair-cursor" : ""
                }`}
                style={{ minHeight: "300px" }}
              >
                {previewImage || selectedInsumo.imagen_ubicacion ? (
                  <div className="position-relative w-100 h-100">
                    <img
                      ref={imageRef}
                      src={previewImage || selectedInsumo.imagen_ubicacion}
                      alt="Ubicación"
                      className="img-fluid w-100"
                      style={{ maxHeight: "500px", objectFit: "contain" }}
                      onClick={handleImageClick}
                    />

                    {/* Marcador Visual (Pin) */}
                    <div
                      className="location-marker d-flex align-items-center justify-content-center shadow-lg"
                      style={{
                        left: `${
                          isEditingLocation
                            ? tempCoords.x
                            : selectedInsumo.coordenada_x || 50
                        }%`,
                        top: `${
                          isEditingLocation
                            ? tempCoords.y
                            : selectedInsumo.coordenada_y || 50
                        }%`,
                      }}
                    >
                      {isEditingLocation && (
                        <div
                          className="bg-white rounded-circle"
                          style={{ width: "6px", height: "6px" }}
                        ></div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="d-flex flex-column align-items-center justify-content-center py-5 text-white-50">
                    <MapPin size={48} className="mb-3 opacity-50" />
                    <p>No hay imagen de ubicación asignada.</p>
                    {isEditingLocation && (
                      <p className="small text-warning">
                        Sube una imagen para comenzar.
                      </p>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </Modal.Body>

        <Modal.Footer>
          {isEditingLocation ? (
            <>
              <Button
                variant="light"
                onClick={() => {
                  setIsEditingLocation(false);
                  setFileToUpload(null);
                  setPreviewImage(selectedInsumo.imagen_ubicacion);
                }}
                disabled={savingLocation}
              >
                Cancelar
              </Button>
              <Button
                variant="primary"
                onClick={handleSaveLocation}
                disabled={savingLocation}
                className="d-flex align-items-center gap-2"
              >
                {savingLocation ? (
                  <>
                    <Spinner size="sm" animation="border" /> Guardando...
                  </>
                ) : (
                  <>
                    <Save size={18} /> Guardar Cambios
                  </>
                )}
              </Button>
            </>
          ) : (
            <Button variant="secondary" onClick={handleCloseLocationModal}>
              Cerrar
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default InventarioPage;
