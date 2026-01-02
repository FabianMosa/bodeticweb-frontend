import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import insumoService from "../services/insumo.service";
import SalidaModal from "../components/SalidaModal";
import ScannerModal from "../components/ScannerModal";
import LocationViewer from "../components/LocationViewer";
import { useNotification } from "../context/NotificationContext";
import {
  Container,
  Row,
  Col,
  Button,
  Table,
  Card,
  Spinner,
  ButtonGroup,
  Form,
  Pagination,
  InputGroup,
  Badge,
  Modal,
} from "react-bootstrap";

const ITEMS_PER_PAGE = 20;

const InventarioPage = () => {
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
  }, [filtroActivo, filtroCategoria, filtroNombre, currentPage]);

  // --- Handlers de Filtros ---
  const handleFiltroActivoChange = (isActivo) => {
    setFiltroActivo(isActivo);
    setCurrentPage(1);
  };
  const handleFiltroCategoriaChange = (e) => {
    setFiltroCategoria(e.target.value);
    setCurrentPage(1);
  };
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setFiltroNombre(searchTerm);
    setCurrentPage(1);
  };

  // --- Handler de Toggle ---
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
  const handleCloseScanner = () => setScannerModalOpen(false);

  const handleOpenSalidaModal = (insumo) => {
    setSelectedInsumo(insumo);
    setSalidaModalOpen(true);
  };

  const handleCloseSalidaModal = () => {
    setSalidaModalOpen(false);
    setSelectedInsumo(null);
  };

  const handleOpenLocationModal = (insumo) => {
    setSelectedInsumo(insumo);
    setLocationModalOpen(true);
  };

  const handleCloseLocationModal = () => {
    setLocationModalOpen(false);
    setSelectedInsumo(null);
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

  // --- Componente de Paginación ---
  const PaginationComponent = () => {
    if (totalPages <= 1) return null;
    let items = [];
    const maxPagesToShow = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    for (let number = startPage; number <= endPage; number++) {
      items.push(
        <Pagination.Item
          key={number}
          active={number === currentPage}
          onClick={() => setCurrentPage(number)}
          className="custom-page-item"
        >
          {number}
        </Pagination.Item>
      );
    }
    return (
      <Pagination className="justify-content-center mt-4 custom-pagination">
        <Pagination.First
          onClick={() => setCurrentPage(1)}
          disabled={currentPage === 1}
        />
        <Pagination.Prev
          onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
          disabled={currentPage === 1}
        />
        {startPage > 1 && <Pagination.Ellipsis />}
        {items}
        {endPage < totalPages && <Pagination.Ellipsis />}
        <Pagination.Next
          onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
          disabled={currentPage === totalPages}
        />
        <Pagination.Last
          onClick={() => setCurrentPage(totalPages)}
          disabled={currentPage === totalPages}
        />
      </Pagination>
    );
  };

  return (
    <Container
      fluid
      className="inventario-container bg-light min-vh-100 py-4 font-sans"
    >
      {/* HEADER DE LA PÁGINA */}
      <Row className="mb-4 align-items-center">
        <Col xs="auto">
          <Button
            variant="link"
            as={Link}
            to="/dashboard"
            className="text-decoration-none text-secondary p-0 me-3"
          >
            <i className="bi bi-arrow-left fs-4"></i>
          </Button>
        </Col>
        <Col>
          <h2 className="fw-bold text-dark m-0">Gestión de Inventario</h2>
          <p className="text-muted small mb-0">
            Administra y controla el stock de la bodega.
          </p>
        </Col>
        <Col xs="auto" className="d-flex gap-2">
          {/* Botones de Acción Principal Flotantes (Mobile/Desktop) */}
          {usuarioRol === 1 && (
            <Button
              variant="success"
              as={Link}
              to="/inventario/nuevo"
              className="shadow-sm rounded-pill px-3"
            >
              <i className="bi bi-plus-lg me-1"></i>{" "}
              <span className="d-none d-md-inline">Nuevo Insumo</span>
            </Button>
          )}
          <Button
            variant="primary"
            onClick={handleOpenScanner}
            className="shadow-sm rounded-pill px-3 text-white"
          >
            <i className="bi bi-qr-code-scan me-1"></i>{" "}
            <span className="d-none d-md-inline">Escanear</span>
          </Button>
        </Col>
      </Row>

      {/* TARJETA DE CONTROL (FILTROS) */}
      <Card className="shadow-sm border-0 mb-4 rounded-4 card-hover-effect">
        <Card.Body className="p-4">
          <Form onSubmit={handleSearchSubmit}>
            <Row className="g-3 align-items-end">
              {/* Buscador */}
              <Col xs={12} lg={5}>
                <Form.Group controlId="filtroNombre">
                  <Form.Label className="small fw-bold text-secondary text-uppercase ls-1">
                    Buscar
                  </Form.Label>
                  <InputGroup>
                    <InputGroup.Text className="bg-white border-end-0 text-muted">
                      <i className="bi bi-search"></i>
                    </InputGroup.Text>
                    <Form.Control
                      type="text"
                      placeholder="Nombre del insumo o SKU..."
                      value={searchTerm}
                      onChange={handleSearchChange}
                      className="border-start-0 ps-0 shadow-none"
                    />
                    <Button
                      variant="outline-primary"
                      type="submit"
                      className="px-4"
                    >
                      Buscar
                    </Button>
                  </InputGroup>
                </Form.Group>
              </Col>

              {/* Categoría */}
              <Col xs={12} md={6} lg={3}>
                <Form.Group controlId="filtroCategoria">
                  <Form.Label className="small fw-bold text-secondary text-uppercase ls-1">
                    Categoría
                  </Form.Label>
                  <Form.Select
                    value={filtroCategoria}
                    onChange={handleFiltroCategoriaChange}
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
                </Form.Group>
              </Col>

              {/* Estado Toggle */}
              <Col xs={12} md={6} lg={4}>
                <Form.Group controlId="filtroEstado">
                  <Form.Label className="small fw-bold text-secondary text-uppercase ls-1">
                    Estado Visualización
                  </Form.Label>
                  <div className="d-flex w-100 bg-light rounded p-1 border">
                    <Button
                      variant={filtroActivo ? "white" : "light"}
                      className={`flex-grow-1 border-0 rounded py-1 small fw-bold ${
                        filtroActivo
                          ? "shadow-sm text-primary bg-white"
                          : "text-muted"
                      }`}
                      onClick={() => handleFiltroActivoChange(true)}
                    >
                      Activos
                    </Button>
                    <Button
                      variant={!filtroActivo ? "white" : "light"}
                      className={`flex-grow-1 border-0 rounded py-1 small fw-bold ${
                        !filtroActivo
                          ? "shadow-sm text-danger bg-white"
                          : "text-muted"
                      }`}
                      onClick={() => handleFiltroActivoChange(false)}
                    >
                      Papelera
                    </Button>
                  </div>
                </Form.Group>
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
              <Spinner
                animation="border"
                role="status"
                variant="primary"
                style={{ width: "3rem", height: "3rem" }}
              />
              <p className="mt-3 text-muted">Cargando inventario...</p>
            </div>
          ) : (
            <>
              <Table
                hover
                responsive="md"
                className="align-middle mb-0 custom-table"
              >
                <thead className="bg-light">
                  <tr>
                    <th className="py-3 ps-4 text-secondary text-uppercase small fw-bold">
                      Producto
                    </th>
                    <th className="py-3 text-secondary text-uppercase small fw-bold d-none d-md-table-cell">
                      Categoría
                    </th>
                    <th className="py-3 text-center text-secondary text-uppercase small fw-bold">
                      Stock
                    </th>
                    <th className="py-3 text-center text-secondary text-uppercase small fw-bold d-none d-lg-table-cell">
                      Mínimo
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
                          !insumo.activo ? "bg-light opacity-75" : ""
                        }`}
                      >
                        <td className="ps-4">
                          <div className="d-flex align-items-center">
                            {!insumo.activo && (
                              <i
                                className="bi bi-slash-circle-fill text-danger me-2"
                                title="Deshabilitado"
                              ></i>
                            )}
                            <div>
                              <div
                                className={`fw-bold ${
                                  !insumo.activo
                                    ? "text-decoration-line-through text-muted"
                                    : "text-dark"
                                }`}
                              >
                                {insumo.nombre}
                              </div>
                              <div className="small text-muted font-monospace">
                                SKU: {insumo.sku}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="d-none d-md-table-cell">
                          <Badge
                            bg="light"
                            text="dark"
                            className="border fw-normal"
                          >
                            {insumo.nombre_categoria}
                          </Badge>
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
                        <td className="text-center d-none d-lg-table-cell text-muted">
                          {insumo.stock_minimo}
                        </td>
                        <td className="pe-4 text-end">
                          <div className="d-flex justify-content-end gap-1">
                            {/* Botón Ubicación */}
                            <Button
                              variant="light"
                              size="sm"
                              className="btn-icon border"
                              onClick={() => handleOpenLocationModal(insumo)}
                              title="Ver Ubicación"
                            >
                              <i className="bi bi-geo-alt-fill text-primary"></i>
                            </Button>

                            {usuarioRol === 1 && (
                              <>
                                <Button
                                  variant="light"
                                  size="sm"
                                  className="btn-icon border"
                                  as={Link}
                                  to={`/inventario/editar/${insumo.PK_id_insumo}`}
                                  title="Editar"
                                >
                                  <i className="bi bi-pencil-fill text-warning"></i>
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
                                  <i
                                    className={`bi ${
                                      insumo.activo
                                        ? "bi-archive-fill text-danger"
                                        : "bi-arrow-counterclockwise text-success"
                                    }`}
                                  ></i>
                                </Button>
                              </>
                            )}

                            {insumo.activo && (
                              <Button
                                variant="primary"
                                size="sm"
                                className="d-flex align-items-center ms-2 px-3"
                                onClick={() => handleOpenSalidaModal(insumo)}
                                disabled={insumo.stock_actual === 0}
                              >
                                <i className="bi bi-box-arrow-right me-1"></i>{" "}
                                Salida
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="text-center py-5">
                        <div className="d-flex flex-column align-items-center text-muted">
                          <i className="bi bi-search display-4 mb-3 opacity-50"></i>
                          <h5 className="fw-normal">
                            No se encontraron resultados
                          </h5>
                          <p className="small mb-0">
                            Intenta ajustar los filtros de búsqueda.
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>

              {/* Paginación */}
              <div className="p-3 bg-white border-top">
                <PaginationComponent />
              </div>
            </>
          )}
        </Card.Body>
      </Card>

      {/* --- Modales --- */}
      {salidaModalOpen && (
        <SalidaModal
          insumo={selectedInsumo}
          onClose={handleCloseSalidaModal}
          onSuccess={handleSalidaSuccess}
        />
      )}
      {scannerModalOpen && (
        <ScannerModal
          onClose={handleCloseScanner}
          onScanSuccess={handleScanSuccess}
        />
      )}
      <Modal
        show={locationModalOpen}
        onHide={handleCloseLocationModal}
        centered
        size="lg"
      >
        <Modal.Header closeButton className="border-bottom-0">
          <Modal.Title className="h5 fw-bold">
            <i className="bi bi-geo-alt-fill me-2 text-primary"></i>Ubicación en
            Bodega
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center pt-0">
          {selectedInsumo && (
            <>
              <h5 className="mb-3 text-secondary">{selectedInsumo.nombre}</h5>
              <div className="rounded-3 overflow-hidden border">
                <LocationViewer
                  imageUrl={selectedInsumo.imagen_ubicacion}
                  x={selectedInsumo.coordenada_x}
                  y={selectedInsumo.coordenada_y}
                />
              </div>
            </>
          )}
        </Modal.Body>
        <Modal.Footer className="border-top-0">
          <Button variant="secondary" onClick={handleCloseLocationModal}>
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>

      {/* --- Estilos CSS Modernos --- */}
      <style>{`
        .font-sans { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; }
        .ls-1 { letter-spacing: 1px; }
        
        /* Inputs modernos */
        .form-control:focus, .form-select:focus {
          border-color: #86b7fe;
          box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.15);
        }

        /* Tabla personalizada */
        .custom-table thead th {
            border-bottom: 2px solid #f0f0f0;
            background-color: #f8f9fa;
        }
        .btn-icon {
            width: 32px;
            height: 32px;
            padding: 0;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            border-radius: 6px;
            transition: all 0.2s;
        }
        .btn-icon:hover {
            background-color: #e9ecef;
            transform: translateY(-2px);
        }

        /* Paginación personalizada */
        .custom-pagination .page-link {
            border: none;
            color: #6c757d;
            border-radius: 8px;
            margin: 0 2px;
            font-weight: 500;
        }
        .custom-pagination .page-item.active .page-link {
            background-color: #0d6efd;
            color: white;
            box-shadow: 0 4px 6px rgba(13, 110, 253, 0.3);
        }
        
        /* Ajustes responsivos */
        @media (max-width: 767.98px) {
             .btn-icon { width: 36px; height: 36px; } /* Más grandes para touch */
        }
      `}</style>
    </Container>
  );
};

export default InventarioPage;
