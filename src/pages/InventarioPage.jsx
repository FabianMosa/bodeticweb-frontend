import React, { useState, useEffect } from "react";
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
} from "lucide-react";

// Importaciones de tus servicios y componentes locales
import insumoService from "../services/insumo.service";
import SalidaModal from "../components/SalidaModal";
import ScannerModal from "../components/ScannerModal";
import LocationViewer from "../components/LocationViewer";
import { useNotification } from "../context/NotificationContext";

const InventarioPage = () => {
  // --- Estados Principales ---
  const [insumos, setInsumos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [usuarioRol, setUsuarioRol] = useState(null);
  const [categorias, setCategorias] = useState([]);

  // --- Estados para Filtros ---
  const [filtroActivo, setFiltroActivo] = useState(true);
  const [filtroCategoria, setFiltroCategoria] = useState("");
  const [filtroNombre, setFiltroNombre] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // --- Estados para Paginación ---
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const ITEMS_PER_PAGE = 20;

  // --- Estados de Modales ---
  const [salidaModalOpen, setSalidaModalOpen] = useState(false);
  const [scannerModalOpen, setScannerModalOpen] = useState(false);
  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const [selectedInsumo, setSelectedInsumo] = useState(null);

  const { showNotification } = useNotification();

  // --- Cargar datos ---
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        // Carga de categorías si no existen
        if (categorias.length === 0) {
          const categoriasData = await insumoService.getCategorias();
          setCategorias(categoriasData);
        }

        // Preparar filtros
        const filtros = {
          activo: filtroActivo,
          categoria: filtroCategoria,
          search: filtroNombre,
        };

        // Llamada al servicio
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

    // Obtener rol del usuario desde localStorage
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

  // --- Handlers de Filtros ---
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setFiltroNombre(searchTerm);
    setCurrentPage(1);
  };

  // --- Handler de Estado (Activar/Desactivar) ---
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

  // --- Handlers de Modales ---
  const handleOpenScanner = () => setScannerModalOpen(true);

  const handleOpenSalidaModal = (insumo) => {
    setSelectedInsumo(insumo);
    setSalidaModalOpen(true);
  };

  const handleOpenLocationModal = (insumo) => {
    setSelectedInsumo(insumo);
    setLocationModalOpen(true);
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
    <Container fluid className="bg-light min-vh-100 py-4 font-sans">
      {/* Estilos CSS Inline para overrides específicos */}
      <style>{`
        .font-sans { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; }
        .table-hover tbody tr:hover { background-color: rgba(13, 110, 253, 0.04); }
        .btn-icon { width: 32px; height: 32px; padding: 0; display: inline-flex; align-items: center; justify-content: center; border-radius: 6px; }
        .btn-icon:hover { background-color: #e9ecef; transform: translateY(-2px); transition: all 0.2s; }
      `}</style>

      {/* HEADER DE LA PÁGINA */}
      <Row className="mb-4 align-items-center">
        <Col xs="auto">
          <Button
            variant="link"
            as={Link}
            to="/dashboard"
            className="text-decoration-none text-secondary p-0 me-3"
          >
            <ArrowLeft size={24} />
          </Button>
        </Col>
        <Col>
          <h2 className="fw-bold text-dark m-0">Gestión de Inventario</h2>
          <p className="text-muted small mb-0">
            Administra y controla el stock y ubicaciones físicas de la bodega.
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
      </Row>

      {/* TARJETA DE CONTROL (FILTROS) */}
      <Card className="shadow-sm border-0 mb-4 rounded-4">
        <Card.Body className="p-4">
          <Form onSubmit={handleSearchSubmit}>
            <Row className="g-3 align-items-end">
              {/* Buscador */}
              <Col xs={12} lg={5}>
                <Form.Label className="small fw-bold text-secondary text-uppercase">
                  Buscar
                </Form.Label>
                <InputGroup>
                  <InputGroup.Text className="bg-white border-end-0 text-muted">
                    <Search size={16} />
                  </InputGroup.Text>
                  <Form.Control
                    type="text"
                    placeholder="Nombre del insumo o SKU..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="border-start-0 shadow-none"
                  />
                  <Button variant="outline-primary" type="submit">
                    Buscar
                  </Button>
                </InputGroup>
              </Col>

              {/* Categoría */}
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
                  <option value="">Todas las Categorías</option>
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

              {/* Estado Toggle */}
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

      {/* TABLA DE RESULTADOS */}
      <Card className="shadow-lg border-0 rounded-4 overflow-hidden">
        <Card.Body className="p-0">
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" role="status" variant="primary" />
              <p className="mt-3 text-muted">Cargando inventario...</p>
            </div>
          ) : (
            <>
              <Table hover responsive="md" className="align-middle mb-0">
                <thead className="bg-light">
                  <tr>
                    <th className="py-3 ps-4 text-secondary text-uppercase small fw-bold">
                      Producto
                    </th>
                    <th className="py-3 text-secondary text-uppercase small fw-bold">
                      Categoría / Ubicación
                    </th>
                    <th className="py-3 text-center text-secondary text-uppercase small fw-bold">
                      Stock
                    </th>
                    <th className="py-3 pe-4 text-end text-secondary text-uppercase small fw-bold">
                      Acciones
                    </th>
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

                        {/* Celda Categoría + Ubicación */}
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            <Badge
                              bg="light"
                              text="dark"
                              className="border fw-normal px-2 py-1"
                            >
                              {insumo.nombre_categoria}
                            </Badge>

                            {/* Botón para ver Ubicación */}
                            {insumo.activo && (
                              <Button
                                variant="link"
                                className="p-1 text-primary rounded-circle bg-primary-subtle"
                                onClick={() => handleOpenLocationModal(insumo)}
                                title="Ver fotografía de ubicación"
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

                            {insumo.activo && (
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
                        No se encontraron resultados
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>

              {/* Paginación */}
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

      {/* Modal de Ubicación */}
      <Modal
        show={locationModalOpen}
        onHide={() => setLocationModalOpen(false)}
        centered
        size="lg"
      >
        <Modal.Header closeButton className="border-bottom-0">
          <Modal.Title className="h5 fw-bold d-flex align-items-center gap-2">
            <MapPin size={20} className="text-primary" /> Ubicación en Bodega
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center pt-0 pb-4">
          {selectedInsumo && (
            <>
              <h5 className="mb-3 text-secondary">{selectedInsumo.nombre}</h5>
              <div className="bg-light border rounded p-1">
                {/* Asegúrate de que este componente reciba las props correctamente */}
                <LocationViewer
                  imageUrl={selectedInsumo.imagen_ubicacion}
                  x={selectedInsumo.coordenada_x}
                  y={selectedInsumo.coordenada_y}
                />
              </div>
              <p className="mt-3 text-muted small">
                La marca azul parpadeante indica la posición exacta del insumo
                en la estantería.
              </p>
            </>
          )}
        </Modal.Body>
        <Modal.Footer className="border-top-0 pt-0">
          <Button
            variant="secondary"
            onClick={() => setLocationModalOpen(false)}
          >
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default InventarioPage;
