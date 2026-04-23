import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import movimientoService from "../services/movimiento.service";
import insumoService from "../services/insumo.service";
import usuarioService from "../services/usuario.service";
import { useNotification } from "../context/NotificationContext";
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
} from "react-bootstrap";

const ITEMS_PER_PAGE = 20;

const HistorialPage = () => {
  const [historial, setHistorial] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingDropdowns, setLoadingDropdowns] = useState(true);

  // --- Estados para los filtros ---
  const [filtros, setFiltros] = useState({
    fecha_inicio: "",
    fecha_fin: "",
    id_categoria: "",
    id_usuario: "",
    tipo_movimiento: "",
    codigo_documento: "",
  });
  const [filtrosAplicados, setFiltrosAplicados] = useState(filtros);

  // --- Estados para los desplegables ---
  const [categoriasList, setCategoriasList] = useState([]);
  const [tecnicosList, setTecnicosList] = useState([]);

  // --- Estado para la paginación ---
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const { showNotification } = useNotification();

  // 1. Cargar desplegables (Categorías y Técnicos)
  useEffect(() => {
    const loadDropdowns = async () => {
      setLoadingDropdowns(true);
      try {
        const [categoriasData, tecnicosData] = await Promise.all([
          insumoService.getCategorias(),
          usuarioService.getUsuariosTecnicos(),
        ]);
        setCategoriasList(categoriasData);
        setTecnicosList(tecnicosData);
      } catch (err) {
        showNotification(err.message || "Error al cargar filtros", "error");
      } finally {
        setLoadingDropdowns(false);
      }
    };
    loadDropdowns();
  }, []);

  // 2. Cargar historial (Reactivo a filtros y paginación)
  useEffect(() => {
    // Aplicamos debounce para la búsqueda por documento y evitar consultas por cada tecla.
    const debounceMs = filtros.codigo_documento ? 300 : 0;
    const debounceId = window.setTimeout(
      () => setFiltrosAplicados(filtros),
      debounceMs,
    );

    return () => window.clearTimeout(debounceId);
  }, [filtros]);

  // 3. Cargar historial (Reactivo a filtros aplicados y paginación)
  useEffect(() => {
    if (loadingDropdowns) return;

    const loadHistorial = async () => {
      setLoading(true);
      try {
        const response = await movimientoService.getHistorial(
          filtrosAplicados,
          currentPage,
          ITEMS_PER_PAGE,
        );
        setHistorial(response.data);
        setTotalPages(response.pagination.totalPages);
      } catch (err) {
        showNotification(err.message || "Error al cargar historial", "error");
      } finally {
        setLoading(false);
      }
    };

    loadHistorial();
  }, [filtrosAplicados, currentPage, loadingDropdowns]);

  // --- Handlers ---
  const handleFilterChange = (e) => {
    setFiltros((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setCurrentPage(1); // Resetear a página 1 al filtrar
  };

  const handleLimpiarFiltros = () => {
    // Restauramos el estado inicial para reiniciar la búsqueda completa.
    setFiltros({
      fecha_inicio: "",
      fecha_fin: "",
      id_categoria: "",
      id_usuario: "",
      tipo_movimiento: "",
      codigo_documento: "",
    });
    setCurrentPage(1);
  };

  const handleExportar = (e) => {
    e.preventDefault();
    showNotification(
      "Generando reporte Excel... esto puede tardar unos segundos.",
      "success",
    );
    movimientoService
      .getHistorialExcel(filtros)
      .catch((err) =>
        showNotification(err.message || "Error al generar el Excel", "error"),
      );
  };

  // --- Renderizado de Badges para Tipos de Movimiento ---
  const renderTipoBadge = (tipo) => {
    let variant = "secondary";
    let icon = "bi-circle";

    switch (tipo) {
      case "Entrada":
        variant = "success";
        icon = "bi-arrow-down-circle-fill";
        break;
      case "Salida-Uso":
        variant = "danger";
        icon = "bi-arrow-up-circle-fill";
        break;
      case "Préstamo":
        variant = "warning";
        icon = "bi-clock-history";
        break;
      case "Devolución":
        variant = "info";
        icon = "bi-arrow-counterclockwise";
        break;
      default:
        variant = "secondary";
    }

    return (
      <Badge bg={variant} className="px-3 py-2 rounded-pill fw-normal">
        <i className={`bi ${icon} me-1`}></i> {tipo}
      </Badge>
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
        >
          {number}
        </Pagination.Item>,
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
    <Container fluid className="page-container min-vh-100 py-4 font-sans">
      <Row className="justify-content-center">
        <Col xs={12} xl={10}>
          {/* --- Encabezado y Navegación --- */}
          <Col className="d-flex justify-content-between align-items-center mb-4">
            <Col xs="auto">
              <Button
                variant="outline-secondary"
                size="lg"
                as={Link}
                to="/dashboard"
                className="me-3"
              >
                <i className="bi bi-arrow-left"></i>
              </Button>
            </Col>
            <Col>
              <h2 className="fw-bold text-dark m-0">
                Historial de Movimientos{" "}
              </h2>
              <p className="text-muted small mb-0">
                Consulta de trazabilidad completa del inventario
              </p>
            </Col>

            {/* Botón Exportar (Visible en Desktop) */}
            <Button
              variant="success"
              onClick={handleExportar}
              disabled={loading || loadingDropdowns}
              className="d-none d-md-flex align-items-center shadow-sm px-4 rounded-pill"
            >
              <i className="bi bi-file-earmark-excel-fill me-2"></i> Exportar
              Excel
            </Button>
          </Col>

          {/* --- Panel de Filtros --- */}
          <Card className="shadow-sm border-0 mb-4 rounded-4 overflow-hidden">
            <Card.Header className="bg-white border-bottom py-3 px-4">
              <div className="d-flex flex-wrap gap-2 align-items-center justify-content-between">
                <h5 className="mb-0 fw-bold text-primary">
                  <i className="bi bi-sliders me-2"></i>Filtros de Búsqueda
                </h5>
                <Button
                  type="button"
                  variant="outline-secondary"
                  size="sm"
                  onClick={handleLimpiarFiltros}
                  className="rounded-pill"
                >
                  <i className="bi bi-eraser me-1"></i>
                  Limpiar filtros
                </Button>
              </div>
            </Card.Header>
            <Card.Body className="p-4 bg-white">
              <Form>
                <Row className="g-3">
                  {/* Rango de fechas: placeholder MM-DD-YYYY solo como guía visual (input nativo sigue en formato ISO al enviar) */}
                  <Col md={12} lg={4}>
                    <label className="small text-muted fw-bold mb-1">
                      Rango de Fechas
                    </label>
                    <InputGroup className="mb-3">
                      <InputGroup.Text className="bg-light border-end-0">
                        <i className="bi bi-calendar-event"></i>
                      </InputGroup.Text>
                      <Form.Control
                        type="date"
                        name="fecha_inicio"
                        value={filtros.fecha_inicio}
                        onChange={handleFilterChange}
                        className="border-start-0 ps-0 bg-light"
                        placeholder="MM-DD-YYYY"
                      />
                      <InputGroup.Text className="bg-light border-0">
                        <i className="bi bi-arrow-right"></i>
                      </InputGroup.Text>
                      <Form.Control
                        type="date"
                        name="fecha_fin"
                        value={filtros.fecha_fin}
                        onChange={handleFilterChange}
                        className="bg-light border-start-0"
                        placeholder="MM-DD-YYYY"
                      />
                    </InputGroup>
                  </Col>

                  {/* Filtros de Selección */}
                  <Col md={6} lg={4}>
                    <Form.Group>
                      <Form.Label className="small text-muted fw-bold mb-1">
                        Categoría
                      </Form.Label>
                      <InputGroup>
                        <InputGroup.Text className="bg-white">
                          <i className="bi bi-tags"></i>
                        </InputGroup.Text>
                        <Form.Select
                          name="id_categoria"
                          value={filtros.id_categoria}
                          onChange={handleFilterChange}
                          disabled={loadingDropdowns}
                          className="shadow-none"
                        >
                          <option value="">-- Todas las Categorías --</option>
                          {categoriasList.map((cat) => (
                            <option
                              key={cat.PK_id_categoria}
                              value={cat.PK_id_categoria}
                            >
                              {cat.nombre_categoria}
                            </option>
                          ))}
                        </Form.Select>
                      </InputGroup>
                    </Form.Group>
                  </Col>

                  <Col md={6} lg={4}>
                    <Form.Group>
                      <Form.Label className="small text-muted fw-bold mb-1">
                        Tipo de Movimiento
                      </Form.Label>
                      <InputGroup>
                        <InputGroup.Text className="bg-white">
                          <i className="bi bi-arrow-left-right"></i>
                        </InputGroup.Text>
                        <Form.Select
                          name="tipo_movimiento"
                          value={filtros.tipo_movimiento}
                          onChange={handleFilterChange}
                          className="shadow-none"
                        >
                          <option value="">-- Todos los Tipos --</option>
                          <option value="Entrada">Entrada</option>
                          <option value="Salida-Uso">Salida - Uso</option>
                          <option value="Préstamo">Préstamo</option>
                          <option value="Devolución">Devolución</option>
                        </Form.Select>
                      </InputGroup>
                    </Form.Group>
                  </Col>

                  {/* Filtros Secundarios */}
                  <Col md={6} lg={4}>
                    <Form.Group>
                      <Form.Label className="small text-muted fw-bold mb-1">
                        Técnico Responsable
                      </Form.Label>
                      <InputGroup>
                        <InputGroup.Text className="bg-white">
                          <i className="bi bi-person"></i>
                        </InputGroup.Text>
                        <Form.Select
                          name="id_usuario"
                          value={filtros.id_usuario}
                          onChange={handleFilterChange}
                          disabled={loadingDropdowns}
                          className="shadow-none"
                        >
                          <option value="">-- Todos los Técnicos --</option>
                          {tecnicosList.map((t) => (
                            <option
                              key={t.PK_id_usuario}
                              value={t.PK_id_usuario}
                            >
                              {t.nombre}
                            </option>
                          ))}
                        </Form.Select>
                      </InputGroup>
                    </Form.Group>
                  </Col>

                  <Col md={6} lg={4}>
                    <Form.Group>
                      <Form.Label className="small text-muted fw-bold mb-1">
                        Nro. documento
                      </Form.Label>
                      <InputGroup>
                        <InputGroup.Text className="bg-white">
                          <i className="bi bi-receipt"></i>
                        </InputGroup.Text>
                        <Form.Control
                          type="text"
                          name="codigo_documento"
                          value={filtros.codigo_documento}
                          onChange={handleFilterChange}
                          className="shadow-none"
                          placeholder="Factura o guía"
                        />
                      </InputGroup>
                    </Form.Group>
                  </Col>

                  {/* Botón Exportar Móvil (Visible solo en md o menor) */}
                  <Col xs={12} className="d-md-none mt-4">
                    <Button
                      variant="success"
                      onClick={handleExportar}
                      disabled={loading || loadingDropdowns}
                      className="w-100 rounded-pill"
                    >
                      <i className="bi bi-file-earmark-excel-fill me-2"></i>{" "}
                      Exportar Excel
                    </Button>
                  </Col>
                </Row>
              </Form>
            </Card.Body>
          </Card>

          {/* --- Tabla de Resultados --- */}
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
                  <p className="mt-3 text-muted">Cargando movimientos...</p>
                </div>
              ) : (
                <>
                  <div className="table-responsive">
                    <Table hover className="align-middle mb-0 custom-table">
                      <thead className="bg-light">
                        <tr>
                          <th
                            className="py-3 ps-4 text-secondary text-uppercase small fw-bold"
                            style={{ minWidth: "150px" }}
                          >
                            Fecha
                          </th>
                          <th className="py-3 text-secondary text-uppercase small fw-bold">
                            Tipo
                          </th>
                          <th className="py-3 text-secondary text-uppercase small fw-bold">
                            Insumo
                          </th>
                          <th className="py-3 text-center text-secondary text-uppercase small fw-bold">
                            Cant.
                          </th>
                          <th
                            className="py-3 text-secondary text-uppercase small fw-bold"
                            style={{ minWidth: "140px" }}
                          >
                            Usuario
                          </th>
                          <th className="py-3 text-secondary text-uppercase small fw-bold">
                            Nro. documento
                          </th>
                          <th className="py-3 text-secondary text-uppercase small fw-bold">
                            Detalle / OT
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {historial.length > 0 ? (
                          historial.map((mov) => (
                            <tr
                              key={mov.PK_id_movimiento}
                              className="border-bottom"
                            >
                              <td className="ps-4">
                                <div className="fw-bold text-dark">
                                  {new Date(mov.fecha_hora).toLocaleDateString(
                                    "es-CL",
                                  )}
                                </div>
                                <div className="small text-muted">
                                  {new Date(mov.fecha_hora).toLocaleTimeString(
                                    "es-CL",
                                    { hour: "2-digit", minute: "2-digit" },
                                  )}
                                </div>
                              </td>
                              <td>{renderTipoBadge(mov.tipo_movimiento)}</td>
                              <td>
                                <span className="fw-semibold text-dark">
                                  {mov.nombre_insumo}
                                </span>
                              </td>
                              <td className="text-center">
                                <span className="fw-bold fs-6">
                                  {mov.cantidad}
                                </span>
                              </td>
                              <td>
                                <div className="d-flex align-items-center">
                                  <div className="bg-light rounded-circle p-2 me-2 text-secondary">
                                    <i className="bi bi-person-fill"></i>
                                  </div>
                                  <span className="text-secondary">
                                    {mov.nombre_usuario}
                                  </span>
                                </div>
                              </td>
                              <td>
                                <small className="text-muted fw-semibold">
                                  {mov.codigo_documento || "-"}
                                </small>
                              </td>
                              <td>
                                {mov.codigo_ot ? (
                                  <div className="d-flex flex-column">
                                    <span
                                      className="badge bg-light text-dark border mb-1"
                                      style={{ width: "fit-content" }}
                                    >
                                      OT: {mov.codigo_ot}
                                    </span>
                                    <small className="text-muted fst-italic">
                                      {mov.descripcion}
                                    </small>
                                  </div>
                                ) : (
                                  <small className="text-muted">
                                    {mov.descripcion ||
                                      mov.codigo_documento ||
                                      "-"}
                                  </small>
                                )}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={7} className="text-center py-5">
                              <div className="d-flex flex-column align-items-center">
                                <i className="bi bi-inbox display-4 text-muted mb-3 opacity-50"></i>
                                <h5 className="text-muted fw-normal">
                                  No se encontraron movimientos
                                </h5>
                                <p className="text-secondary small">
                                  Intenta ajustar los filtros de búsqueda.
                                </p>
                              </div>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </Table>
                  </div>

                  {/* Paginación */}
                  <div className="p-3 bg-white border-top">
                    <PaginationComponent />
                  </div>
                </>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default HistorialPage;
