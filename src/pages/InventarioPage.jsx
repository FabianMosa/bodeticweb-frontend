// frontend/src/pages/InventarioPage.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import insumoService from '../services/insumo.service';
import SalidaModal from '../components/SalidaModal'; 
import ScannerModal from '../components/ScannerModal';
import { useNotification } from '../context/NotificationContext';
import { Container, Row, Col, Button, Table, Card, Spinner, ButtonGroup, Form, Pagination } from 'react-bootstrap';

// --- Definir cantidad de items por pagina ---
const ITEMS_PER_PAGE = 5;

const InventarioPage = () => {
  const [insumos, setInsumos] = useState([]);
  const [loading, setLoading] = useState(true);  
  const [usuarioRol, setUsuarioRol] = useState(null);

  // --- Estados para Filtros y Paginación ---
  const [categorias, setCategorias] = useState([]);
  const [filtroActivo, setFiltroActivo] = useState(true);
  const [filtroCategoria, setFiltroCategoria] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  
  // --- Estados de Modales (Simplificado) ---
  const [salidaModalOpen, setSalidaModalOpen] = useState(false);
  const [scannerModalOpen, setScannerModalOpen] = useState(false);
  const [selectedInsumo, setSelectedInsumo] = useState(null);
 
  const { showNotification } = useNotification();

  // --- Cargar insumos y categorias al inicio ---
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [insumosData, categoriasData] = await Promise.all([
          // 1. LLAMAMOS A LA API SIN FILTRO (trae todos)
          insumoService.getInsumos(), 
          insumoService.getCategorias()
        ]);
        
        // 2. CORRECCIÓN VITAL: Quitar el .map() que hardcodea 'activo: true'
        setInsumos(insumosData); 
        setCategorias(categoriasData);

      } catch (err) {
        showNotification(err.message || 'Error al cargar datos', 'error');
      } finally {
        setLoading(false);
      }
    };

    loadData();
    const usuarioInfo = JSON.parse(localStorage.getItem('usuario'));
    if (usuarioInfo) setUsuarioRol(usuarioInfo.usuario.rol);
  // 3. CORRECCIÓN VITAL: Quitar [showNotification]. Usar [] para que cargue 1 SOLA VEZ.
  }, []); 

  // --- Lógica de Filtrado (Ahora funciona) ---
  const insumosFiltrados = useMemo(() => {
    return insumos
      .filter(insumo => {
        // Filtro 1: Activo / Deshabilitado
        // Ahora 'insumo.activo' tiene el valor real de la BBDD
        return filtroActivo ? insumo.activo : !insumo.activo;
      })
      .filter(insumo => {
        // Filtro 2: Categoría
        if (filtroCategoria === '') return true;
        return insumo.FK_id_categoria === parseInt(filtroCategoria);
      });
  }, [insumos, filtroActivo, filtroCategoria]);

  // --- Lógica de Paginación ---
  const totalPages = Math.ceil(insumosFiltrados.length / ITEMS_PER_PAGE);
  const currentItems = insumosFiltrados.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // --- Handlers de Filtros ---
  const handleFiltroActivoChange = (isActivo) => {
    setFiltroActivo(isActivo);
    setCurrentPage(1); // Resetear a página 1
  };
  const handleFiltroCategoriaChange = (e) => {
    setFiltroCategoria(e.target.value);
    setCurrentPage(1); // Resetear a página 1
  };
    
  // --- Handler de Toggle (AHORA FUNCIONA) ---
  const handleToggleActivo = async (insumo) => {
    const nuevoEstado = !insumo.activo;
    const confirmMsg = `¿Está seguro que desea ${nuevoEstado ? 'habilitar' : 'deshabilitar'} el insumo "${insumo.nombre}"?`;
    
    if (window.confirm(confirmMsg)) {
      try {
        await insumoService.toggleActivo(insumo.PK_id_insumo, nuevoEstado);
        
        // 4. ESTO AHORA ES PERMANENTE (porque el useEffect no lo revierte)
        setInsumos(prevInsumos => 
          prevInsumos.map(i => 
            i.PK_id_insumo === insumo.PK_id_insumo ? { ...i, activo: nuevoEstado } : i
          )
        );
        showNotification(`Insumo ${nuevoEstado ? 'habilitado' : 'deshabilitado'}`, 'success');
      } catch (err) {
        showNotification(err.message || 'Error al cambiar el estado', 'error');
      }
    }
  };

  // --- Handlers de Modales (Unificados) ---
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
  const handleScanSuccess = async (sku) => {
    setScannerModalOpen(false);
    setLoading(true);
    try {
      const insumoEncontrado = await insumoService.getInsumoBySku(sku);
      if (insumoEncontrado) {
        handleOpenSalidaModal(insumoEncontrado);
      } else {
        showNotification(`SKU "${sku}" no encontrado en la base de datos.`, 'error');
      }
    } catch (err) {
      showNotification(err.message || 'Error al buscar el SKU', 'error');
    } finally {
      setLoading(false);
    }
  }; 
  const handleSalidaSuccess = (insumoId, nuevoStock) => {    
    setInsumos(prevInsumos => 
      prevInsumos.map(insumo => 
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
    for (let number = 1; number <= totalPages; number++) {
      items.push(
        <Pagination.Item key={number} active={number === currentPage} onClick={() => setCurrentPage(number)}>
          {number}
        </Pagination.Item>
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
      
      {/* Título y Botón Volver */}
      <Row className="mb-3 align-items-center">
        <Col xs="auto">
          <Button variant="outline-primary" size="sm" as={Link} to="/Dashboard" className="mb-3">
            <i className="bi bi-arrow-left me-1"></i> Volver al Dashboard
          </Button>
        </Col>
        
      </Row>

      {/* --- Barra de Acciones y Filtros --- */}
      <Card className="shadow-sm mb-3">
        <Card.Body className="p-3">
          <Row className="gy-3 align-items-end">
            
            <div>
          <h1 className="h2 mb-0 section-title text-center text-md-start">Gestión de Inventario</h1>
        </div>
            {/* Botones de Acción */}
            <Col xs={12} md={6} lg={4} className="d-flex gap-2">
              {usuarioRol === 1 && (
                <Button variant="success" as={Link} to="/inventario/nuevo" className="flex-grow-1">
                  <i className="bi bi-plus-circle me-1"></i> Registrar
                </Button>
              )}
              <Button variant="info" onClick={handleOpenScanner} className="text-white flex-grow-1">
                <i className="bi bi-upc-scan me-"></i> Escanear
              </Button>
            </Col>
            <br />
            {/* Filtro por Categoría */}
            <div xs={12} md={6} lg={4} className='mb-3' >
              <Form.Group controlId="filtroCategoria">
                <Form.Label className="filter-label mb-1">Categoría:</Form.Label>
                <Form.Select 
                  size="sm" 
                  value={filtroCategoria} 
                  onChange={handleFiltroCategoriaChange}
                >
                  <option value="">-- Todas las Categorías --</option>
                  {categorias.map(cat => (
                    <option key={cat.PK_id_categoria} value={cat.PK_id_categoria}>
                      {cat.nombre_categoria}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </div>
            
            {/* Filtros de Estado */}
            <Col xs={12} md={6} lg={4}>
              <Form.Group controlId="filtroEstado">
                <Form.Label className="filter-label mb-1">Estado:</Form.Label>
                <ButtonGroup aria-label="Filtro de estado" className="w-100">
                  <Button 
                    size="sm"
                    variant={filtroActivo ? 'primary' : 'outline-secondary'} 
                    onClick={() => handleFiltroActivoChange(true)}
                  >
                    <i className="bi bi-eye-fill me-1"></i> Activos
                  </Button>
                  <Button 
                    size="sm"
                    variant={!filtroActivo ? 'danger' : 'outline-secondary'} 
                    onClick={() => handleFiltroActivoChange(false)}
                  >
                    <i className="bi bi-eye-slash-fill me-1"></i> Deshabilitados
                  </Button>
                </ButtonGroup>
              </Form.Group>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* --- Tabla Responsiva --- */}
      <Row>
        <Col>
          <Card className="shadow-sm">
            <Card.Body className="p-0 p-md-3">
              {loading ? (
                 <div className="text-center p-5">
                    <Spinner animation="border" role="status" variant="primary" />
                 </div>
              ) : (
                <>
                  <Table striped bordered hover responsive="md" size="sm" className="inventario-table align-middle mb-0">
                    <thead className="table-primary text-white">
                      <tr>
                        <th>SKU</th>
                        <th>Nombre</th>
                        <th className="d-none d-md-table-cell">Categoría</th>
                        <th>Stock</th>
                        <th className="d-none d-lg-table-cell">Stock Mín.</th>
                        <th style={{ minWidth: '180px' }}>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentItems.length > 0 ? (
                        currentItems.map((insumo) => (
                          <tr key={insumo.PK_id_insumo} className={!insumo.activo ? 'table-danger' : ''}>
                            <td>{insumo.sku}</td>
                            <td>{insumo.nombre}</td>
                            <td className="d-none d-md-table-cell">{insumo.nombre_categoria}</td>
                            <td className={`fw-bold ${insumo.stock_actual <= insumo.stock_minimo && insumo.activo ? 'stock-low' : ''}`}>
                              {insumo.stock_actual}
                            </td>
                            <td className="d-none d-lg-table-cell">{insumo.stock_minimo}</td>
                            <td style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                              {usuarioRol === 1 && (
                                <>
                                  <Link className='btn' to={`/inventario/editar/${insumo.PK_id_insumo}`} style={{ backgroundColor: '#ffc107'}}>
                                    Editar
                                  </Link>
                                  <Button
                                    style={{ backgroundColor: insumo.activo ? '#dc3545' : '#28a745', color: 'white'}}
                                    onClick={() => handleToggleActivo(insumo)}
                                  >
                                    {insumo.activo ? 'Deshabilitar' : 'Habilitar'}
                                  </Button>
                                </>
                              )}
                              
                              {/* --- CORRECCIÓN DE AMBOS BUGS AQUÍ --- */}
                              {insumo.activo ? ( // 1. Arregla el bug del '0'
                                <Button 
                                  style={{ backgroundColor: '#17a2b8', color: 'white'}}
                                  onClick={() => handleOpenSalidaModal(insumo)} // 2. Llama a la función correcta
                                  disabled={insumo.stock_actual === 0}
                                >
                                  Registrar Salida
                                </Button>
                              ) : null} 
                              
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} className="text-center text-muted py-4">
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

     
      
    </Container>
  );
};

export default InventarioPage;