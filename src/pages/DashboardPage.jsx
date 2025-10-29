import React,{useEffect, useState} from 'react';
import { useNavigate, Link, useLocation} from 'react-router-dom';
import authService from '../services/auth.services';
import dashboardService from '../services/dashboard.service'; 
import movimientoService from '../services/movimiento.service';
import { Container, Row, Col, Navbar, Nav, Button, Card, ListGroup, Spinner, Alert } from 'react-bootstrap';
import styles from '../styles/DashboardPage.module.css';
// (Estilos temporales para el Dashboard)
const dashboardStyles = {
  padding: '20px'
};

const headerStyles = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  borderBottom: '1px solid #ccc',
  paddingBottom: '10px'
};

const logoutButtonStyles = {
  padding: '8px 12px',
  fontSize: '14px',
  backgroundColor: '#dc3545',
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer'
};
// --- ESTILOS DE LOS WIDGETS ---
const widgetContainerStyles = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '20px',
  marginTop: '20px'
};
const widgetStyles = {
  flex: '1',
  minWidth: '300px',
  backgroundColor: '#f9f9f9',
  border: '1px solid #ddd',
  borderRadius: '8px',
  padding: '15px'
};
const listStyles = { listStyleType: 'none', paddingLeft: 0 };
const alertItemStyles = { padding: '5px 0', borderBottom: '1px solid #eee' };

// --- El Componente ---
const DashboardPage = () => {
  const navigate = useNavigate();

// ---OBTENER LA UBICACIÓN ---
  const location = useLocation();

  // --- AÑADIR ESTADO PARA EL ROL ---
  const [usuarioRol, setUsuarioRol] = useState(null);
  const [nombreUsuario, setNombreUsuario] = useState('Usuario');

  // --- ESTADOS PARA LOS WIDGETS ---
  const [alertas, setAlertas] = useState(null);
  const [prestamos, setPrestamos] = useState([]);
  const [loading, setLoading] = useState(true);

useEffect(() => {
  // Obtenemos el rol y nombre del usuario desde el localStorage
    const usuarioInfo = JSON.parse(localStorage.getItem('usuario'));
    let rol = null;
    if (usuarioInfo) {
      setNombreUsuario(usuarioInfo.usuario.nombre);
      setUsuarioRol(usuarioInfo.usuario.rol);
      rol = usuarioInfo.usuario.rol;
    }

    // FUNCIÓN PARA CARGAR DATOS ---
    const loadDashboardData = async () => {
      setLoading(true);
      try {
        // Creamos un array de promesas
        const promesas = [
          movimientoService.getPrestamosActivos()
        ];

        // Solo pedimos las alertas si es Admin (Rol 1)
        if (rol === 1) {
          promesas.push(dashboardService.getAlertas());
        }

        // Ejecutamos las promesas
        const results = await Promise.all(promesas);
        const prestamosData = results[0];
        const alertasData = results[1];

        setPrestamos(prestamosData);
        if (alertasData) {
          setAlertas(alertasData);
        }

      } catch (error) {
        console.error("Error cargando el dashboard:", error);
      } finally {
        setLoading(false);
      }
    };
    // Se ejecuta solo una vez al cargar la página
    loadDashboardData();
   // Esto fuerza al useEffect a ejecutarse de nuevo CADA VEZ
  // que navegas a esta página (el Dashboard).
    }, [location]);

  const handleLogout = () => {
    authService.logout(); // Llama al servicio para borrar el token
    navigate('/'); // Redirige al login
  };

  return (
    <Container>
      {/* --- Navbar Superior --- */}
      <Navbar bg="primary" variant="dark" expand="lg" className="mb-4 shadow-sm main-navbar">
        <Container>
          {/* <Navbar.Brand as={Link} to="/dashboard">
             <img src={logoTic} width="30" height="30" className="d-inline-block align-top me-2 rounded-circle" alt="BodeTIC Logo"/> 
            BodeTICWeb
          </Navbar.Brand> */}
          <Navbar.Brand as={Link} to="/dashboard" className="align-items-center">
            BodeTICWeb
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav" className="justify-content-end">
            <Nav className="align-items-center">
              <Navbar.Text className="text-warning me-3">
                Usuario: <strong className="user-name">{nombreUsuario}</strong>
              </Navbar.Text>
              <Button variant="danger" size="sm" onClick={handleLogout}>
                Cerrar Sesión
              </Button>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
     
        
        <Row xs={1} md={2} lg={3} className="g-4 mb-5">
         
            {/* Tarjeta Inventario (Todos) */}
            <Col>
                <Card className="bg-light h-100 shadow-sm module-card">
                    <Card.Body className="d-flex flex-column align-items-center text-center">
                         <i className="bi bi-box-seam-fill display-4 text-primary mb-3"></i>
                        <Card.Title>Bodega Inventario</Card.Title>                        
                        <Button variant="primary" as={Link} to="/inventario" className="mt-auto">Acceder</Button>
                    </Card.Body>
                </Card>
            </Col>
             {usuarioRol === 1 && (
             <>
             <Col>
                <Card className="bg-light h-100 shadow-sm module-card">
                    <Card.Body className="d-flex flex-column align-items-center text-center">
                         <i className="bi bi-arrow-return-left display-4 text-primary mb-3"></i>
                        <Card.Title>Registrar Devolución</Card.Title>                        
                        <Button variant="primary" as={Link} to="/devoluciones" className="mt-auto">Acceder</Button>
                    </Card.Body>
                </Card>
            </Col>
             <Col>
                <Card className="bg-light h-100 shadow-sm module-card">
                    <Card.Body className="d-flex flex-column align-items-center text-center">
                         <i className="bi bi-people-fill display-4 text-primary mb-3"></i>
                        <Card.Title>Gestionar Usuarios</Card.Title>                        
                        <Button variant="primary" as={Link} to="/usuarios" className="mt-auto">Acceder</Button>
                    </Card.Body>
                </Card>
            </Col>
            <Col>
                <Card className="bg-light h-100 shadow-sm module-card">
                    <Card.Body className="d-flex flex-column align-items-center text-center">
                         <i className="bi bi-file-earmark-text-fill display-4 text-primary mb-3"></i>
                        <Card.Title>Historial y Reportes</Card.Title>                        
                        <Button variant="primary" as={Link} to="/historial" className="mt-auto">Acceder</Button>
                    </Card.Body>
                </Card>
            </Col></>
          )}  
        </Row>
        
       
     
      {/* --- 6. WIDGETS DE DATOS (ALERTAS Y PRÉSTAMOS) --- */}
      <Container style={widgetContainerStyles}>        
      {/* Widget de Préstamos - Visible para Todos */}
        <Card style={widgetStyles}>
          <h3>Mis Préstamos Pendientes</h3>
          {loading ? <p>Cargando...</p> : (
            prestamos.length > 0 ? (
              <ul style={listStyles}>
                {prestamos.map(p => (
                  <li key={`${p.FK_id_insumo}-${p.FK_id_usuario}`} style={alertItemStyles}>
                    <strong>{p.cantidad_pendiente}x</strong> {p.nombre_insumo}
                    {/* Si es Admin, mostramos quién lo tiene */}
                    {usuarioRol === 1 && ` (Téc: ${p.nombre_usuario})`}
                  </li>
                ))}
              </ul>
            ) : <p>No tienes préstamos pendientes.</p>
          )}
        </Card>
        {/* Widget de Alertas - Visible solo para Admin */}
        {usuarioRol === 1 && alertas && (
          <>
            <Card style={widgetStyles}>
              <h3 style={{color: '#dc3545'}}>Alerta: Stock Bajo</h3>
              {loading ? <p>Cargando...</p> : (
                alertas.stockBajo.length > 0 ? (
                  <ul style={listStyles}>
                    {alertas.stockBajo.map(a => (
                      <li key={a.PK_id_insumo} style={alertItemStyles}>
                        <strong>{a.nombre}</strong> (SKU: {a.sku})
                        <br/>
                        <span style={{color: '#dc3545'}}>Quedan: {a.stock_actual} (Mín: {a.stock_minimo})</span>
                      </li>
                    ))}
                  </ul>
                ) : <p>No hay alertas de stock bajo.</p>
              )}
            </Card>
            <Card style={widgetStyles}>
              <h3 style={{color: '#ffc107'}}>Alerta: Próximos a Vencer</h3>
              {loading ? <p>Cargando...</p> : (
                alertas.porVencer.length > 0 ? (
                  <ul style={listStyles}>
                    {alertas.porVencer.map(a => (
                      <li key={a.PK_id_insumo} style={alertItemStyles}>
                        <strong>{a.nombre}</strong> (SKU: {a.sku})
                        <br/>
                        <span>Vence: {new Date(a.fecha_vencimiento).toLocaleDateString()}</span>
                      </li>
                    ))}
                  </ul>
                ) : <p>No hay insumos próximos a vencer.</p>
              )}
            </Card>
          </>
        )}
      </Container>
    
    </Container>
    
  );
};

export default DashboardPage;