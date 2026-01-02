/* eslint-disable no-irregular-whitespace */
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
} from "react-bootstrap"; // Importar Pagination

const ITEMS_PER_PAGE = 20; // Número de ítems por página

const HistorialPage = () => {
  const [historial, setHistorial] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingDropdowns, setLoadingDropdowns] = useState(true); // --- Estados para los filtros ---

  const [filtros, setFiltros] = useState({
    fecha_inicio: "",
    fecha_fin: "",
    id_categoria: "",
    id_usuario: "",
    tipo_movimiento: "",
  }); // --- Estados para los desplegables ---
  const [categoriasList, setCategoriasList] = useState([]);
  const [tecnicosList, setTecnicosList] = useState([]); // --- Estado para la paginación ---

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const { showNotification } = useNotification();

  // 1. Cargar los desplegables (SOLO UNA VEZ)
  useEffect(() => {
    const loadDropdowns = async () => {
      setLoadingDropdowns(true);
      try {
        // --- 4. CORRECCIÓN: Llamar a getCategorias ---
        const [categoriasData, tecnicosData] = await Promise.all([
          insumoService.getCategorias(), // <-- ANTES: getInsumos
          usuarioService.getUsuariosTecnicos(),
        ]);
        // --- FIN CORRECCIÓN ---

        // 'getCategorias' y 'getUsuariosTecnicos' devuelven arrays
        setCategoriasList(categoriasData);
        setTecnicosList(tecnicosData);
      } catch (err) {
        showNotification(err.message || "Error al cargar filtros", "error");
      } finally {
        setLoadingDropdowns(false);
      }
    };
    loadDropdowns();
  }, []); // Quitar 'showNotification' si causa bucles // 3. Cargar el historial (SE EJECUTA AL CAMBIAR FILTROS O PÁGINA)

  useEffect(() => {
    // No cargar historial si los desplegables aún no están listos
    if (loadingDropdowns) return;

    const loadHistorial = async () => {
      setLoading(true);
      try {
        const response = await movimientoService.getHistorial(
          filtros,
          currentPage,
          ITEMS_PER_PAGE
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
  }, [filtros, currentPage, loadingDropdowns, showNotification]); // Handlers para filtros

  const handleFilterChange = (e) => {
    setFiltros((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setCurrentPage(1); // Resetear a página 1
  }; // Handler para descargar (Excel)
  const handleExportar = (e) => {
    e.preventDefault();
    showNotification(
      "Generando reporte Excel... esto puede tardar unos segundos.",
      "success"
    );
    movimientoService
      .getHistorialExcel(filtros)
      .catch((err) =>
        showNotification(err.message || "Error al generar el Excel", "error")
      );
  }; // Componente de Paginación

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

  // JSX CORREGIDO Y ORDENADO
  return (
    <Container fluid className={`bg-light min-vh-100 py-4`}>
      <Row className="justify-content-center">
        <Col
          xs={12}
          md={10}
          lg={8}
          xl={7}
          className="form-container historial-container"
        >
          <Button
            variant="outline-primary"
            size="sm"
            as={Link}
            to="/dashboard"
            className="mb-3"
          >
            <i className="bi bi-arrow-left me-1"></i> Volver al Inventario
          </Button>
          <Card className="shadow-lg border-0">
            <Card.Header
              as="h2"
              className="text-center text-white fw-bold bg-primary form-header"
            >
              Historial de Movimientos
            </Card.Header>
            <Card.Body className="p-4 shadow-lg border-20 bg-white">
                       
              <Form>
                           
                <Row className="mb-3 gy-3">
                               
                  <Col xs={12} md={6}>
                                   
                    <Form.Group controlId="filtroFechaInicio">
                                       
                      <Form.Label className="filter-label mb-1">
                        Desde
                      </Form.Label>
                                       
                      <Form.Control
                        type="date"
                        name="fecha_inicio"
                        value={filtros.fecha_inicio}
                        onChange={handleFilterChange}
                        size="sm"
                      />
                                     
                    </Form.Group>
                                 
                  </Col>
                               
                  <Col xs={12} md={6}>
                                   
                    <Form.Group controlId="filtroFechaFin">
                                       
                      <Form.Label className="filter-label mb-1">
                        Hasta:
                      </Form.Label>
                                       
                      <Form.Control
                        type="date"
                        name="fecha_fin"
                        value={filtros.fecha_fin}
                        onChange={handleFilterChange}
                        size="sm"
                      />
                                     
                    </Form.Group>
                                 
                  </Col>
                                           
                  <Col xs={12} md={4}>
                    <Form.Group controlId="filtroNombre">
                      <Form.Label className="filter-label mb-1">
                        Buscar por Nombre
                      </Form.Label>
                      <InputGroup size="sm">
                        <Form.Control
                          type="text"
                          placeholder="Ej: Cable HDMI..."
                        />
                        <Button variant="outline-secondary" type="submit">
                          <i className="bi bi-search"></i>
                        </Button>
                      </InputGroup>
                    </Form.Group>
                  </Col>
                               
                  <Col xs={12} md={4}>
                    <Form.Group controlId="filtroNombre">
                      <Form.Label className="filter-label mb-1">
                        Buscar por Nro. fáctura
                      </Form.Label>
                      <InputGroup size="sm">
                        <Form.Control type="text" placeholder="..." />
                        <Button variant="outline-secondary" type="submit">
                          <i className="bi bi-search"></i>
                        </Button>
                      </InputGroup>
                    </Form.Group>
                  </Col>
                               
                  <Col xs={12} md={4}>
                    <Form.Group controlId="filtroCategoria">
                                       
                      <Form.Label className="filter-label mb-1">
                        Categoría
                      </Form.Label>
                                       
                      <Form.Select
                        size="sm"
                        name="id_categoria" // <-- Usar el nombre de filtro correcto
                        value={filtros.id_categoria}
                        onChange={handleFilterChange}
                        className="form-control-focus"
                        disabled={loadingDropdowns}
                      >
                                           <option value="">-- Todas --</option>
                        {/* Mapear 'categoriasList' */}                   
                        {categoriasList.map((cat) => (
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
                               
                  <Col xs={12} md={4}>
                                   
                    <Form.Group controlId="filtroTecnico">
                                       
                      <Form.Label className="filter-label mb-1">
                        Técnico
                      </Form.Label>
                                       
                      <Form.Select
                        size="sm"
                        name="id_usuario"
                        value={filtros.id_usuario}
                        onChange={handleFilterChange}
                        className="form-control-focus"
                        disabled={loadingDropdowns} // Deshabilitar mientras carga
                      >
                                           <option value="">-- Todos --</option>
                                           
                        {tecnicosList.map((t) => (
                          <option key={t.PK_id_usuario} value={t.PK_id_usuario}>
                            {t.nombre}
                          </option>
                        ))}
                                         
                      </Form.Select>
                                     
                    </Form.Group>
                                 
                  </Col>
                               
                  <Col xs={12} md={4}>
                                   
                    <Form.Group controlId="filtroTipo">
                                       
                      <Form.Label className="filter-label mb-1">
                        Tipo
                      </Form.Label>
                                       
                      <Form.Select
                        size="sm"
                        name="tipo_movimiento"
                        value={filtros.tipo_movimiento}
                        onChange={handleFilterChange}
                        className="form-control-focus"
                      >
                                           <option value="">-- Todos --</option>
                                           
                        <option value="Entrada">Entrada</option>               
                            <option value="Salida-Uso">Salida-Uso</option>     
                                      <option value="Préstamo">Préstamo</option>
                                           
                        <option value="Devolución">Devolución</option>         
                               
                      </Form.Select>
                                     
                    </Form.Group>
                                 
                  </Col>
                                           
                  <Col
                    className="d-flex justify-content-end gap-2 mt-2"
                    xs={12}
                    md={12}
                  >
                    {/* 7. Botón "Buscar" eliminado (ahora es automático) */}   
                             
                    <Button
                      variant="success"
                      onClick={handleExportar}
                      disabled={loading || loadingDropdowns}
                    >
                      {" "}
                                       
                      <i className="bi bi-file-earmark-excel-fill me-1 "></i>
                      Exportar Excel                
                    </Button>
                                 
                  </Col>
                             
                </Row>
                         
              </Form>
                               
              {loading ? (
                <div className="text-center p-5">
                                 
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
                    className="historial-table align-middle mb-0"
                  >
                                 
                    <thead className="table-primary text-center align-middle">
                      <tr>
                        <th>Fecha y Hora</th>
                        <th>Tipo</th>
                        <th>Insumo</th>
                        <th className="text-center fw-bold">Cantidad</th>
                        <th className="d-none d-md-table-cell">Técnico</th>
                        <th className="d-none d-lg-table-cell">OT</th>
                        <th className="d-none d-lg-table-cell">Descripción</th>
                      </tr>
                                   
                    </thead>
                                 
                    <tbody>
                                     
                      {historial.length > 0 ? (
                        historial.map((mov) => (
                          <tr key={mov.PK_id_movimiento}>
                                                 
                            <td>
                              {new Date(mov.fecha_hora).toLocaleString("es-CL")}
                            </td>
                                                 
                            <td>
                              {" "}
                                                     
                              <span
                                className={`badge ${
                                  mov.tipo_movimiento === "Entrada"
                                    ? "bg-success"
                                    : mov.tipo_movimiento === "Devolución"
                                    ? "bg-info"
                                    : "bg-danger"
                                }`}
                              >
                                                          {mov.tipo_movimiento} 
                                                     
                              </span>
                                                   
                            </td>
                            <td>{mov.nombre_insumo}</td>                     
                            <td className="text-center fw-bold">
                              {mov.cantidad}
                            </td>
                                                 
                            <td className="d-none d-md-table-cell">
                              {mov.nombre_usuario}
                            </td>
                                                 
                            <td className="d-none d-lg-table-cell">
                              {mov.codigo_ot || "N/A"}
                            </td>
                                                 
                            <td className="d-none d-lg-table-cell">
                              {mov.descripcion || "N/A"}
                            </td>
                                               
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan={7}
                            className="text-center text-muted py-4"
                          >
                            No se encontraron movimientos con esos filtros.
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
                                             {/* --- Estilos CSS --- */}     
      <style>{`
                    .form-container {
                      background-color: #f8f9fa;
                    }
                    .form-header {
                      background-color: #0d6efd; /* Azul primario de Bootstrap */
                      color: white;
                      padding: 1rem;
                    }
                    .form-control-focus:focus {
                      border-color: var(--bs-info);
                      box-shadow: 0 0 0 0.25rem rgba(var(--bs-info-rgb), 0.25);
                    }
                    /* Añadido de HistorialPage anterior */
                    .historial-container { padding-bottom: 3rem; }
                    .section-title { color: #495057; }
                    .filter-label { font-size: 0.85rem; font-weight: 500; color: #555; }
                    .historial-table { font-size: 0.9rem; }
                    .historial-table .badge { font-size: 0.8rem; }
                    @media (max-width: 767.98px) {
                        .historial-table { font-size: 0.8rem; }
                        .historial-table td, .historial-table th { padding: 0.5rem 0.4rem; }
                    }
                  `}</style>
         
    </Container>
  );
};

export default HistorialPage;
