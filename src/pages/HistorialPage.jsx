import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import movimientoService from '../services/movimiento.service';
import insumoService from '../services/insumo.service';
import usuarioService from '../services/usuario.service';
import { useNotification } from '../context/NotificationContext';
import { Container, Row, Col, Button, Table, Card, Spinner, ButtonGroup, Form, CardBody, Pagination } from 'react-bootstrap';

const ITEMS_PER_PAGE = 10; // Número de ítems por página

const HistorialPage = () => {
  const [historial, setHistorial] = useState([]);
  const [loading, setLoading] = useState(true);  
  const [loadingDropdowns, setLoadingDropdowns] = useState(true);

  // ------------------------------------------------------Estados para los filtros
  const [filtros, setFiltros] = useState({
    fecha_inicio: '',
    fecha_fin: '',
    id_insumo: '',
    id_usuario: '',
    tipo_movimiento: ''
  });
  
  //------------------------------------------------------- Estados para los desplegables de filtros
  const [insumosList, setInsumosList] = useState([]);
  const [tecnicosList, setTecnicosList] = useState([]);

  // Estado para la paginación 
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const { showNotification } = useNotification();

  useEffect(() => {
    const loadDropdowns = async () => {
      setLoadingDropdowns(true);
      try {
        const [insumosData, tecnicosData] = await Promise.all([
          insumoService.getInsumos(),
          usuarioService.getUsuariosTecnicos()
        ]);
        setInsumosList(insumosData);
        setTecnicosList(tecnicosData);
      } catch (err) {
        showNotification(err.message ||'Error al cargar filtros', 'error');
      } finally {
        setLoadingDropdowns(false);
      }
    };
    loadDropdowns();
  }, []); // No agregar showNotification si causa bucles

  
  // Cargar el historial (SE EJECUTA AL CAMBIAR FILTROS O PÁGINA)
  useEffect(() => {
    // No cargar historial si los desplegables aún no están listos
    if (loadingDropdowns) return;

    const loadHistorial = async () => {
      setLoading(true);
      try {
        const response = await movimientoService.getHistorial(filtros, currentPage, ITEMS_PER_PAGE);
        
        setHistorial(response.data);
        setTotalPages(response.pagination.totalPages);
        
      } catch (err) {
        showNotification(err.message || 'Error al cargar historial', 'error');
      } finally {
        setLoading(false);
      }
    };
    
    loadHistorial();
  }, [filtros, currentPage, loadingDropdowns, showNotification]);
  
  //Handlers para filtros (AHORA SOLO ACTUALIZAN EL ESTADO)
  const handleFilterChange = (e) => {
    setFiltros(prev => ({ ...prev, [e.target.name]: e.target.value }));
    // Al cambiar filtros, reseteamos a la página 1
    setCurrentPage(1);
  };

  // Handler para buscar (refuerza la carga del historial)
  const fetchHistorial = (e) => {
    e.preventDefault();
    // El useEffect se encargará de recargar el historial
  };

  // Handler para descargar (Excel)
  const handleExportar = (e) => {
    e.preventDefault();
    showNotification('Generando reporte Excel... esto puede tardar unos segundos.', 'success');
    // Le pasamos los filtros actuales
    movimientoService.getHistorialExcel(filtros) 
      .catch(err => showNotification(err.message || 'Error al generar el Excel', 'error'));
  };

  // 6. COMPONENTE DE PAGINACIÓN (Ahora usa 'totalPages' del estado)
  const PaginationComponent = () => {
    if (totalPages <= 1) return null;
    let items = [];
    for (let number = 1; number <= totalPages; number++) {
      items.push(
        <Pagination.Item 
          key={number} 
          active={number === currentPage} 
          onClick={() => setCurrentPage(number)} // Solo cambia el estado
        >
          {number}
        </Pagination.Item>,
      );
    }
    return (
      <Pagination className="justify-content-center mt-3">
        <Pagination.Prev onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1} />
        {items}
        <Pagination.Next onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages} />
      </Pagination>
    );
  };

  return (
     <Container fluid className="inventario-container bg-light min-vh-100 py-4">
          {/* ----------------------------------------------------Título y Botón Volver */}
          <Row className="mb-3 align-items-center">
            <Col xs="auto">
              <Button variant="outline-primary" size="sm" as={Link} to="/Dashboard" className="mb-3">
                <i className="bi bi-arrow-left me-1"></i> Volver al Dashboard
              </Button>
            </Col>
            
          </Row>
    
          {/* --------------------------------------------- Barra de Acciones y Filtros --- */}
          <Card className="shadow-sm mb-3">
            <Card.Body className="p-3">
              <Row className="gy-3 align-items-end">
                
                <Card.Header as="h2" className="text-center bg-primary fw-bold form-header">
                  Historial de Movimientos
                </Card.Header>            
                      
              <Card className="shadow-sm mb-3">
        <Card.Header as="h5" className="fw-bold">
          <i className="bi bi-funnel-fill me-2"></i> Filtros de Búsqueda
        </Card.Header>
        <Card.Body className="p-3 p-md-4">
          <Form>
            {/* Fila 1: Fechas */}
            <Row className="mb-3">
              <Col xs={12} md={6}>
                <Form.Group controlId="filtroFechaInicio">
                  <Form.Label className="filter-label mb-1">Desde:</Form.Label>
                  <Form.Control type="date" name="fecha_inicio" value={filtros.fecha_inicio} onChange={handleFilterChange} size="sm" />
                </Form.Group>
              </Col>
              <Col xs={12} md={6} className="mt-2 mt-md-0">
                <Form.Group controlId="filtroFechaFin">
                  <Form.Label className="filter-label mb-1">Hasta:</Form.Label>
                  <Form.Control type="date" name="fecha_fin" value={filtros.fecha_fin} onChange={handleFilterChange} size="sm" />
                </Form.Group>
              </Col>
            </Row>

            {/* Fila 2: Insumo, Técnico, Tipo */}
            <Row className="mb-3">
              <Col xs={12} md={4}>
                <Form.Group controlId="filtroInsumo">
                  <Form.Label className="filter-label mb-1">Insumo:</Form.Label>
                  <Form.Select size="sm" name="id_insumo" value={filtros.id_insumo} onChange={handleFilterChange} className="form-control-focus">
                    <option value="">-- Todos --</option>
                    {insumosList.map(i => <option key={i.PK_id_insumo} value={i.PK_id_insumo}>{i.nombre}</option>)}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col xs={12} md={4} className="mt-2 mt-md-0">
                <Form.Group controlId="filtroTecnico">
                  <Form.Label className="filter-label mb-1">Técnico:</Form.Label>
                  <Form.Select size="sm" name="id_usuario" value={filtros.id_usuario} onChange={handleFilterChange} className="form-control-focus">
                    <option value="">-- Todos --</option>
                    {tecnicosList.map(t => <option key={t.PK_id_usuario} value={t.PK_id_usuario}>{t.nombre}</option>)}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col xs={12} md={4} className="mt-2 mt-md-0">
                <Form.Group controlId="filtroTipo">
                  <Form.Label className="filter-label mb-1">Tipo:</Form.Label>
                  <Form.Select size="sm" name="tipo_movimiento" value={filtros.tipo_movimiento} onChange={handleFilterChange} className="form-control-focus">
                    <option value="">-- Todos --</option>
                    <option value="Entrada">Entrada</option>
                    <option value="Salida-Uso">Salida-Uso</option>
                    <option value="Préstamo">Préstamo</option>
                    <option value="Devolución">Devolución</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            
            {/* --- 3. BOTONES (DEBAJO DE LOS FILTROS) --- */}
            <Row>
              <Col className="d-flex justify-content-end gap-2 mt-3">                
                <Button variant="success" onClick={handleExportar}>
                  <i className="bi bi-file-earmark-excel-fill me-1"></i> Exportar Excel
                </Button>
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>      
                  
        {/* -----------------------------------------------TABLA DE RESULTADOS RESPONSIVA --- */}
      <Card className="shadow-sm">
        <Card.Body className="p-0 p-md-3">
          {loading ? (
             <div className="text-center p-5">
                <Spinner animation="border" role="status" variant="primary">
                  <span className="visually-hidden">Cargando...</span>
                </Spinner>
             </div>
          ) : (
            <>
            <Table striped bordered hover responsive="md" size="sm" className="historial-table align-middle mb-0">
              <thead className="table-primary">
                <tr>
                  <th>Fecha</th>
                  <th>Tipo</th>
                  <th>Insumo</th>
                  <th className="text-center">Cant.</th>
                  {/* Ocultar en móvil */}
                  <th className="d-none d-md-table-cell">Usuario</th>
                  {/* Ocultar en tablet y móvil */}
                  <th className="d-none d-lg-table-cell">OT</th>
                  <th className="d-none d-lg-table-cell">Descripcion</th>
                </tr>
              </thead>
              <tbody>
                {historial.length > 0 ? (
                  historial.map(mov => (
                    <tr key={mov.PK_id_movimiento}>
                      <td>{new Date(mov.fecha_hora).toLocaleString('es-CL')}</td>
                      <td>
                        {/* 5. Usar Badges para Tipo */}
                        <span className={`badge ${mov.tipo_movimiento === 'Entrada' ? 'bg-success' : mov.tipo_movimiento === 'Devolución' ? 'bg-info' : 'bg-danger'}`}>
                          {mov.tipo_movimiento}
                        </span>
                      </td>
                      <td>{mov.nombre_insumo}</td>
                      <td className="text-center fw-bold">{mov.cantidad}</td>
                      <td className="d-none d-md-table-cell">{mov.nombre_usuario}</td>
                      <td className="d-none d-lg-table-cell">{mov.codigo_ot || 'N/A'}</td>
                      <td className="d-none d-lg-table-cell">{mov.descripcion || 'N/A'}</td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan={7} className="text-center text-muted py-4">No se encontraron movimientos con esos filtros.</td></tr>
                )}
              </tbody>
            </Table>
            <PaginationComponent />
            </>
          )}
          </Card.Body>
          </Card>
                  </Row>
                 </Card.Body>
                </Card>           
            
            {/* --- Estilos CSS --- */}
      <style>{`
        .form-container {
          background-color: #f8f9fa;
        }
        .form-header {
          color: white;
          padding: 1rem;
        }
        .form-control-focus:focus {
          border-color: var(--bs-info);
          box-shadow: 0 0 0 0.25rem rgba(var(--bs-info-rgb), 0.25);
        }
      `}</style>
    </Container>
  );
};

export default HistorialPage;