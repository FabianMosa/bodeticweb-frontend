import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import insumoService from "../services/insumo.service";
import SalidaModal from "../components/SalidaModal";
import ScannerModal from "../components/ScannerModal";
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
} from "react-bootstrap";

const ITEMS_PER_PAGE = 9; // ¡Debe coincidir con el 'limit' del backend!

const InventarioPage = () => {
  const [insumos, setInsumos] = useState([]); // Almacena los insumos de la PÁGINA ACTUAL
  const [loading, setLoading] = useState(true);
  const [usuarioRol, setUsuarioRol] = useState(null);
  const [categorias, setCategorias] = useState([]);

  // ------------------------------------------------------------- Estados para Filtros ---
  const [filtroActivo, setFiltroActivo] = useState(true);
  const [filtroCategoria, setFiltroCategoria] = useState("");
  const [filtroNombre, setFiltroNombre] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // -------------------------------------------------------------- Estados para Paginación ---
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // -------------------------------------------------------------    Estados de Modales (Simplificado) ---
  const [salidaModalOpen, setSalidaModalOpen] = useState(false);
  const [scannerModalOpen, setScannerModalOpen] = useState(false);
  const [selectedInsumo, setSelectedInsumo] = useState(null);

  const { showNotification } = useNotification();

  // ------------------------------------------------------------- Cargar datos (Insumos y Categorías) ---
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        // Cargar categorías (solo si no se han cargado)
        if (categorias.length === 0) {
          const categoriasData = await insumoService.getCategorias();
          setCategorias(categoriasData);
        }

        // Cargar Insumos Paginados y Filtrados
        const filtros = {
          activo: filtroActivo,
          categoria: filtroCategoria,
          search: filtroNombre,
        };
        // El backend hace todo el trabajo de filtrar y paginar
        const response = await insumoService.getInsumos(
          filtros,
          currentPage,
          ITEMS_PER_PAGE
        );

        setInsumos(response.data); // 'insumos' ahora SÍ tiene los 5 ítems
        setTotalPages(response.pagination.totalPages); // El backend nos dice cuántas páginas hay
      } catch (err) {
        showNotification(err.message || "Error al cargar datos", "error");
      } finally {
        setLoading(false);
      }
    };

    loadData();
    const usuarioInfo = JSON.parse(localStorage.getItem("usuario"));
    if (usuarioInfo) setUsuarioRol(usuarioInfo.usuario.rol);
    // EL USE EFFECT AHORA DEPENDE DE LOS FILTROS Y LA PÁGINA
  }, [filtroActivo, filtroCategoria, filtroNombre, currentPage]); //

  // ------------------------------------------------- Handlers de Filtros (actualizan el estado y resetean la página) ---
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

  // ------------------------------------------------------------- Handler de Toggle (Deshabilitar/Habilitar) ---
  const handleToggleActivo = async (insumo) => {
    const nuevoEstado = !insumo.activo;
    const confirmMsg = `¿Está seguro que desea ${
      nuevoEstado ? "habilitar" : "deshabilitar"
    } el insumo "${insumo.nombre}"?`;

    if (window.confirm(confirmMsg)) {
      try {
        await insumoService.toggleActivo(insumo.PK_id_insumo, nuevoEstado);

        // Actualizamos el estado localmente
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

  // ------------------------------------------------------------- Handlers de Modales (Unificados) ---
  const handleOpenScanner = () => setScannerModalOpen(true);
  const handleCloseScanner = () => setScannerModalOpen(false);

  const handleOpenSalidaModal = (insumo) => {
    setSelectedInsumo(insumo);
    setSalidaModalOpen(true); // Solo usamos este estado
  };

  const handleCloseSalidaModal = () => {
    setSalidaModalOpen(false); // Solo usamos este estado
    setSelectedInsumo(null);
  };

  const handleScanSuccess = async (sku) => {
    setScannerModalOpen(false);
    setLoading(true);
    try {
      const insumoEncontrado = await insumoService.getInsumoBySku(sku);
      if (insumoEncontrado) {
        handleOpenSalidaModal(insumoEncontrado); // handler unificado
      } else {
        showNotification(
          `SKU "${sku}" no encontrado en la base de datos.`,
          "error"
        );
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

  // --- Componente de Paginación (Sin cambios) ---
  const PaginationComponent = () => {
    if (totalPages <= 1) return null;
    let items = [];
    for (let number = 1; number <= totalPages; number++) {
      items.push(
        <Pagination.Item
          key={number}
          active={number === currentPage}
          onClick={() => setCurrentPage(number)}
        >
          {number}
        </Pagination.Item>
      );
    }
    return (
      <Pagination className="justify-content-center mt-3">
        <Pagination.Prev
          onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
          disabled={currentPage === 1}
        />
        {items}
        <Pagination.Next
          onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
          disabled={currentPage === totalPages}
        />
      </Pagination>
    );
  };

  // --- RENDERIZADO (JSX) ---
  return (
    <Container fluid className="bg-light min-vh-100 py-4">
      {/* Título y Botón Volver */}
      <Row className="mb-3 align-items-center">
        <Col xs="auto">
          <Button
            variant="outline-primary"
            size="sm"
            as={Link}
            to="/dashboard"
            className="mb-3"
          >
            <i className="bi bi-arrow-left me-1"></i> Volver al Dashboard
          </Button>
        </Col>
      </Row>

      {/* Barra de Acciones y Filtros */}
      <Card className="shadow-sm mb-3">
        <Card.Header
          as="h2"
          className="text-center fw-bold bg-primary text-white form-header"
        >
          Gestión de Inventario
        </Card.Header>
        <Card.Body className="p-3">
          {/* Fila 1: Botones */}
          <Row className="gy-2 mb-3">
            <Col xs={12} md="auto" className="d-flex gap-2">
              {usuarioRol === 1 && (
                <Button variant="success" as={Link} to="/inventario/nuevo">
                  <i className="bi bi-plus-circle me-1"></i> Registrar
                </Button>
              )}
              <Button
                variant="info"
                onClick={handleOpenScanner}
                className="text-white"
              >
                <i className="bi bi-upc-scan me-1"></i> Escanear
              </Button>
            </Col>
          </Row>

          {/* Fila 2: Filtros */}
          <Form onSubmit={handleSearchSubmit}>
            <Row className="gy-3 align-items-end">
              <Col xs={12} md={6} lg={4}>
                <Form.Group controlId="filtroNombre">
                  <Form.Label className="filter-label mb-1">
                    Buscar por Nombre
                  </Form.Label>
                  <InputGroup size="sm">
                    <Form.Control
                      type="text"
                      placeholder="Ej: Cable HDMI..."
                      value={searchTerm}
                      onChange={handleSearchChange}
                    />
                    <Button variant="outline-secondary" type="submit">
                      <i className="bi bi-search"></i>
                    </Button>
                  </InputGroup>
                </Form.Group>
              </Col>

              <Col xs={12} md={6} lg={4}>
                <Form.Group controlId="filtroCategoria">
                  <Form.Label className="filter-label mb-1">
                    Categoría
                  </Form.Label>
                  <Form.Select
                    size="sm"
                    value={filtroCategoria}
                    onChange={handleFiltroCategoriaChange}
                    disabled={categorias.length === 0} // Deshabilitar si aún no cargan
                  >
                    <option value="">-- Todas las Categorías --</option>
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

              <Col xs={12} md={12} lg={4}>
                <Form.Group controlId="filtroEstado">
                  <Form.Label className="filter-label mb-1">Estado</Form.Label>
                  <ButtonGroup aria-label="Filtro de estado" className="w-100">
                    <Button
                      size="sm"
                      variant={filtroActivo ? "primary" : "outline-secondary"}
                      onClick={() => handleFiltroActivoChange(true)}
                    >
                      <i className="bi bi-eye-fill me-1"></i> Activos
                    </Button>
                    <Button
                      size="sm"
                      variant={!filtroActivo ? "danger" : "outline-secondary"}
                      onClick={() => handleFiltroActivoChange(false)}
                    >
                      <i className="bi bi-eye-slash-fill me-1"></i>{" "}
                      Deshabilitados
                    </Button>
                  </ButtonGroup>
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>

      {/* Tabla Responsiva */}
      <Row>
        <Col>
          <Card className="shadow-sm mb-4">
            <Card.Body className="p-0 p-md-3">
              {loading ? (
                <div className="text-center p-4">
                  <Spinner animation="border" role="status" variant="primary" />
                </div>
              ) : (
                <>
                  <Table
                    striped
                    bordered
                    hover
                    responsive="md"
                    size="sm"
                    className="inventario-table align-middle mb-0 text-center"
                  >
                    <thead className="table-light">
                      <tr>
                        <th>SKU</th>
                        <th>Nombre</th>
                        <th className="d-none d-md-table-cell">Categoría</th>
                        <th>Stock</th>
                        <th className="d-none d-lg-table-cell">Stock Mín.</th>
                        <th style={{ minWidth: "180px", textAlign: "center" }}>
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* ------------------------------------------RENDERIZAR 'insumos' (el array de la página actual) */}
                      {insumos.length > 0 ? (
                        insumos.map((insumo) => (
                          <tr
                            key={insumo.PK_id_insumo}
                            style={
                              !insumo.activo
                                ? { opacity: 0.8, backgroundColor: "#f8f9fa" }
                                : {}
                            }
                            className={
                              !insumo.activo
                                ? "border-start border-danger border-5"
                                : ""
                            }
                          >
                            <td>{insumo.sku}</td>
                            <td>{insumo.nombre}</td>
                            <td className="d-none d-md-table-cell">
                              {insumo.nombre_categoria}
                            </td>
                            <td
                              className={`fw-bold ${
                                insumo.stock_actual <= insumo.stock_minimo &&
                                insumo.activo
                                  ? "stock-low"
                                  : ""
                              }`}
                            >
                              {insumo.stock_actual}
                            </td>
                            <td className="d-none d-lg-table-cell">
                              {insumo.stock_minimo}
                            </td>
                            <td
                              style={{
                                display: "flex",
                                gap: "0.5rem",
                                flexWrap: "wrap",
                                justifyContent: "center",
                              }}
                            >
                              {usuarioRol === 1 && (
                                <>
                                  <Link
                                    className="btn"
                                    to={`/inventario/editar/${insumo.PK_id_insumo}`}
                                    style={{ backgroundColor: "#ffc107" }}
                                  >
                                    Editar
                                  </Link>
                                  <br />
                                  <Button
                                    style={{
                                      backgroundColor: insumo.activo
                                        ? "#dc3545"
                                        : "#28a745",
                                      color: "white",
                                    }}
                                    onClick={() => handleToggleActivo(insumo)}
                                  >
                                    {insumo.activo
                                      ? "Deshabilitar"
                                      : "Habilitar"}
                                  </Button>
                                </>
                              )}
                              {/* ----------------------------------------------------Llama al modal de Salida */}
                              {insumo.activo ? (
                                <Button
                                  style={{
                                    backgroundColor: "#17a2b8",
                                    color: "white",
                                  }}
                                  onClick={() => handleOpenSalidaModal(insumo)}
                                  disabled={insumo.stock_actual === 0}
                                >
                                  Salida
                                </Button>
                              ) : null}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan={6}
                            className="text-center text-muted py-4"
                          >
                            No hay insumos que coincidan con los filtros.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </Table>

                  <PaginationComponent />
                </>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Modales */}
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

      {/* Estilos CSS (Autocontenidos) */}
      <style>{`
        .inventario-container { padding-bottom: 3rem; }
        .section-title { color: #495057; }
        .filter-label { font-size: 0.85rem; font-weight: 500; color: #555; }
        .inventario-table { font-size: 0.9rem; }
        .stock-low { color: var(--bs-danger); font-weight: bold; }
        .btn-sm i { font-size: 0.9rem; vertical-align: middle; }
        @media (max-width: 767.98px) {
             .inventario-table { font-size: 0.8rem; }
             .inventario-table td, .inventario-table th { padding: 0.5rem 0.4rem; }
             .button-group-actions { display: flex; flex-direction: column; gap: 4px; }
        }
      `}</style>
    </Container>
  );
};

export default InventarioPage;
