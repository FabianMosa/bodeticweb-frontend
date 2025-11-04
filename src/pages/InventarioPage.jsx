
import React, { useState, useEffect,useMemo } from 'react';
import { Link } from 'react-router-dom';
import insumoService from '../services/insumo.service';
import SalidaModal from '../components/SalidaModal'; 
import ScannerModal from '../components/ScannerModal';
import {useNotification} from '../context/NotificationContext';
import { Container, Row, Col, Button, Table, Card, Spinner, ButtonGroup, Form,Pagination } from 'react-bootstrap';

// --- Estilos ---

const tdStyles = {
  border: '1px solid #ddd',
  padding: '8px'
};
const buttonStyles = { 
  padding: '5px 10px', 
  fontSize: '14px', 
  cursor: 'pointer',
  border: 'none',
  borderRadius: '4px',
  marginRight: '5px'
};
// --- Definir cantidad de items por pagina ---
const ITEMS_PER_PAGE = 5;

const InventarioPage = () => {
  const [insumos, setInsumos] = useState([]);
  const [loading, setLoading] = useState(true);  
  const [usuarioRol, setUsuarioRol] = useState(null);

// --- Estados para Filtros y Paginación ---
  const [categorias, setCategorias] = useState([]);
  const [filtroActivo, setFiltroActivo] = useState(true);
  const [filtroCategoria, setFiltroCategoria] = useState(''); // '' significa "Todas"
  const [currentPage, setCurrentPage] = useState(1);
  
  // --- ESTADO PARA EL MODAL ---
   const [salidaModalOpen,setSalidaModalOpen] = useState(false);// Nuevo estado para el modal de Salida
  // --- ESTADO PARA EL MODAL DEL ESCÁNER ---
  const [scannerModalOpen, setScannerModalOpen] = useState(false);
  const [selectedInsumo, setSelectedInsumo] = useState(null);
 
  const { showNotification } = useNotification(); // Para mostrar notificaciones

  // ------------------------- Cargar insumos y categorias al inicio ---
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        // Pedimos ambas listas al mismo tiempo
        const [insumosData, categoriasData] = await Promise.all([
          insumoService.getInsumos(),
          insumoService.getCategorias()
        ]);
        
        // Asumimos que getInsumos() solo trae activos. Añadimos 'activo: true' manualmente.      
        setInsumos(insumosData.map(insumo => ({ ...insumo, activo: true })));
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
  }, [showNotification]); // Cargar solo una vez

    // --------------------------------Lógica de Filtrado y Paginación ---
  const insumosFiltrados = useMemo(() => {
    // Reseteamos la página a 1 CADA VEZ que los filtros cambien
    //setCurrentPage(1);
    
    return insumos
      .filter(insumo => {
        // Filtro 1: Activo / Deshabilitado
        return filtroActivo ? insumo.activo : !insumo.activo;
      })
      .filter(insumo => {
        // Filtro 2: Categoría
        // Si filtroCategoria es '', no filtrar (devuelve true)
        if (filtroCategoria === '') return true;
        // Si no, comparar
        return insumo.FK_id_categoria === parseInt(filtroCategoria);
      });
  }, [insumos, filtroActivo, filtroCategoria]);

  // ---------------------Lógica de Paginación (sobre los datos ya filtrados) ---
  const totalPages = Math.ceil(insumosFiltrados.length / ITEMS_PER_PAGE);
  
  const currentItems = insumosFiltrados.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );
// ------------------------------Handlers para los filtros que resetean la paginación
  const handleFiltroActivoChange = (isActivo) => {
    setFiltroActivo(isActivo);
    setCurrentPage(1); // Resetear a página 1
  };
  const handleFiltroCategoriaChange = (e) => {
    setFiltroCategoria(e.target.value);
    setCurrentPage(1); // Resetear a página 1
  };
    // ------------------------- NUEVA FUNCIÓN PARA EL BOTÓN  ---
  const handleToggleActivo = async (insumo) => {
    const nuevoEstado = !insumo.activo;
    const confirmMsg = `¿Está seguro que desea ${nuevoEstado ? 'habilitar' : 'deshabilitar'} el insumo "${insumo.nombre}"?`;
    
    if (window.confirm(confirmMsg)) {
      try {
        await insumoService.toggleActivo(insumo.PK_id_insumo, nuevoEstado);
        // Actualizar el estado localmente para reflejar el cambio
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
  //-----------------NUEVAS FUNCIONES PARA EL ESCÁNER ---
  const handleOpenScanner = () => {
    setScannerModalOpen(true);
  };

  const handleCloseScanner = () => {
    setScannerModalOpen(false);
  };

  const handleScanSuccess = async (sku) => {
    setScannerModalOpen(false); // Cerramos el escáner
    setLoading(true); // Ponemos la UI en modo "cargando"
    
    try {
      const insumoEncontrado = await insumoService.getInsumoBySku(sku);
      
      if (insumoEncontrado) {
        // ¡Éxito! Insumo encontrado
        // Abrimos el modal de Salida para este insumo
        handleOpenSalidaModal(insumoEncontrado);// Abrimos el modal de Salida handleOpenSalidaModal
      } else {
        // Error: El SKU se leyó, pero no existe en la BBDD
        showNotification(`SKU "${sku}" no encontrado en la base de datos.`, 'error');
      }
    } catch (err) {
      showNotification(err.message || 'Error al buscar el SKU', 'error');
    } finally {
      setLoading(false);
    }
  }; 
  
  // ---------------------------------- FUNCIONES PARA MANEJAR EL MODAL DE SALIDA ---
  const handleOpenSalidaModal = (insumo) => {
    setSelectedInsumo(insumo);
    setSalidaModalOpen(true);
  };

  const handleCloseSalidaModal = () => {
    setSalidaModalOpen(false);
    setSelectedInsumo(null);
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
  // ----------------------------------------omponente de Paginación (React-Bootstrap) ---
  const PaginationComponent = () => {
    if (totalPages <= 1) return null; // No mostrar paginación si solo hay 1 página
    
    let items = [];
    // Lógica simple de paginación (se puede mejorar para '...')
    for (let number = 1; number <= totalPages; number++) {
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
      <Pagination className="justify-content-center mt-3">
        <Pagination.Prev 
          onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} 
          disabled={currentPage === 1} 
        />
        {items}
        <Pagination.Next 
          onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} 
          disabled={currentPage === totalPages} 
        />
      </Pagination>
    );
  };
  if (loading) return <div>Cargando inventario...</div>;  

  return (
    <Container className="form-container bg-light min-vh-100">
          <Row className="mb-3 align-items-center justify-content-center  rounded" style={{
          padding: '10px 15px',
          backgroundColor: '#ccd6e0ff',
          borderRadius: '5px'
        }}>
            <Col xs="12" md="10" lg="8" className='bg-light p-3 rounded'>            
          <Button variant="outline-primary" size="sm" as={Link} to="/dashboard" className="mb-3">
                <i className="bi bi-arrow-left me-1"></i> Volver al Inventario
          </Button>      
      <div>
        <Col>
          <h1 className="h1 mb-0 section-title p-3 text-center">Gestión de Inventario</h1>
        </Col>
      </div>
      <div>
      {usuarioRol === 1 && ( // Si el ROL es 1 (Admin)
        <Link className='btn' to="/inventario/nuevo" style={{
          padding: '10px 15px',
          backgroundColor: '#007bff',
          color: 'white',
          textDecoration: 'none',
          borderRadius: '5px'
        }}>
          Registrar Nuevo Insumo
        </Link>        
      )}
      </div>      
      <div style={{ marginTop: '20px' }}>
          <Button 
          onClick={handleOpenScanner}
          style={{ padding: '10px 15px', backgroundColor: '#17a2b8', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
        >📷 Escanear Salida (Móvil)
        </Button>
        </div>
      <div >
        {/* --- FILTROS --- */}
        <Row className="mb-3">
          <Col md={6} className="mb-2">
      <Form>
        <Form.Label className="filter-label mb-1">Filtrar por Estado:</Form.Label>
              <ButtonGroup aria-label="Filtro de estado" className="w-100 p-1">
                <Button 
                  size="sm"
                  variant={filtroActivo ? 'primary' : 'outline-secondary'} 
                  onClick={() => handleFiltroActivoChange(true)}
                >
                  <i className="bi bi-eye-fill me-1"></i> Ver Activos
                </Button>
                <Button 
                  size="sm"
                  variant={!filtroActivo ? 'danger' : 'outline-secondary'} 
                  onClick={() => handleFiltroActivoChange(false)}
                >
                  <i className="bi bi-eye-slash-fill me-1"></i> Ver Deshabilitados
                </Button>
              </ButtonGroup>
      </Form>
      <Form>
        <Form.Group controlId="filtroCategoria">
                <Form.Label className="filter-label mb-1">Filtrar por Categoría:</Form.Label>
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
      </Form>
      {/* ----------------------------------- TABLA DE INSUMOS --- */}
      </Col>  
          </Row>       
            <Table striped bordered hover responsive="md" size="sm" className="inventario-table align-middle mb-0">
                    <thead className="table-light">
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
                      {/* Renderizar solo los 'currentItems' de la paginación */}
                      {currentItems.length > 0 ? (
                        currentItems.map((insumo) => (
                          <tr key={insumo.PK_id_insumo} className={!insumo.activo ? 'table-danger' : ''}>
                            {/* ... (código de las <td> existente, no cambia) ... */}
                            <td>{insumo.sku}</td>
                            <td>{insumo.nombre}</td>
                            <td className="d-none d-md-table-cell">{insumo.nombre_categoria}</td>
                            <td className={`fw-bold ${insumo.stock_actual <= insumo.stock_minimo && insumo.activo ? 'stock-low' : ''}`}>
                              {insumo.stock_actual}
                            </td>
                            <td className="d-none d-lg-table-cell">{insumo.stock_minimo}</td>
                            <td style={tdStyles}>
                  {usuarioRol === 1 && (
                    <>
                      <Link className='btn' to={`/inventario/editar/${insumo.PK_id_insumo}`} style={{...buttonStyles, backgroundColor: '#ffc107'}}>
                        Editar
                      </Link>
                       <button 
                        style={{...buttonStyles, backgroundColor: insumo.activo ? '#dc3545' : '#28a745', color: 'white'}}
                        onClick={() => handleToggleActivo(insumo)}
                      >
                        {insumo.activo ? 'Deshabilitar' : 'Habilitar'}
                      </button>
                    </>
                  )}
                  {/* El botón de Salida solo debe aparecer si el insumo está ACTIVO */}
                  {insumo.activo && (
                    <button 
                      style={{...buttonStyles, backgroundColor: '#17a2b8', color: 'white'}}
                      onClick={() => handleOpenSalidaModal(insumo)}
                      disabled={insumo.stock_actual === 0}
                    >
                      Registrar Salida
                    </button>
                  )}
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
                  
                  {/* --------------------------- Añadir el componente de Paginación --- */}
                  <PaginationComponent />
                </div>
                {/* --- 5. RENDERIZAR EL MODAL (si está abierto) --- */}
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
         </Col>
    </Row>
    </Container>
  );
}; 


export default InventarioPage;