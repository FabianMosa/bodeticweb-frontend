
// frontend/src/pages/UsuarioListPage.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import usuarioService from '../services/usuario.service';
import { useNotification } from '../context/NotificationContext'; // <-- 1. Importar Notificaciones

// 2. Importar los componentes de Bootstrap necesarios
import { Container, Row, Col, Card, Button, Alert, Spinner, Table } from 'react-bootstrap';

const UsuarioListPage = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showNotification } = useNotification(); // <-- 3. Usar el hook de notificación

  useEffect(() => {
    setLoading(true);
    usuarioService.getAllUsuarios()
      .then(data => setUsuarios(data))
      .catch((err) => {
        // 4. Usar notificación global para errores
        showNotification(err.message || 'Error al cargar usuarios', 'error');
      })
      .finally(() => setLoading(false));
  }, [showNotification]); // Añadir showNotification a las dependencias
  

  return (
    <Container fluid className={`bg-light min-vh-100 py-4`}>
          <Row className="justify-content-center">
            <Col xs={12} md={10} lg={8} xl={6}>         
              <Button variant="outline-primary" size="sm" as={Link} to="/dashboard" className="mb-3">
            <i className="bi bi-arrow-left me-1"></i> Volver al Inventario
              </Button>
    
              <Card className="shadow-sm border-0">
                <Card.Header as="h2" className="text-center fw-bold bg-primary form-header">
                  Gestión de Usuarios
                </Card.Header>
                
            <Card.Body className="p-0 p-md-3">
              <Button variant="primary" size="sm" as={Link} to="/usuarios/nuevo" className="mb-3">
                <i className="bi bi-plus-circle me-1"></i> Crear Usuario
              </Button>
              {loading ? (
                 <div className="text-center p-5">
                    <Spinner animation="border" role="status" variant="primary">
                      <span className="visually-hidden">Cargando...</span>
                    </Spinner>
                 </div>
              ) : (
                // 5. USAR EL COMPONENTE <Table> CON LA PROP 'responsive="md"'
                <Table striped bordered hover responsive="md" size="sm" className="usuario-table align-middle mb-0">
                  <thead className="table-primary">
                    <tr>
                      <th>Nombre</th>
                      {/* 6. Ocultar RUT en celulares (pantallas 'sm') */}
                      <th className="d-none d-md-table-cell">RUT</th>
                      <th>Rol</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usuarios.length > 0 ? (
                      usuarios.map(user => (
                        <tr key={user.PK_id_usuario} className={!user.activo ? 'table-danger' : ''}>
                          <td>{user.nombre}</td>
                          <td className="d-none d-md-table-cell">{user.rut}</td>
                          <td>{user.nombre_rol}</td>
                          <td>
                            {/* 7. Usar Badges de Bootstrap para el estado */}
                            <span className={`badge ${user.activo ? 'bg-success' : 'bg-secondary'}`}>
                              {user.activo ? 'Activo' : 'Deshabilitado'}
                            </span>
                          </td>
                          <td>
                            {/* 8. Usar Botón de Bootstrap */}
                            <Button 
                              as={Link} 
                              to={`/usuarios/editar/${user.PK_id_usuario}`} 
                              variant="warning" 
                              size="sm"
                              title="Editar"
                            >
                              <i className="bi bi-pencil-fill"></i> Editar
                            </Button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="text-center text-muted py-4">
                          No hay usuarios registrados.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              )}                  
            </Card.Body>
          </Card>
      </Col>
  </Row>

      {/* 9. Estilos autocontenidos */}
      <style>{`
        .section-title {
            color: #495057;
        }
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
        .usuario-table {
            font-size: 0.9rem;
        }
        .btn-sm {
            /* Asegurar que el botón no sea demasiado pequeño */
            padding: 0.25rem 0.5rem;
            font-size: 0.85rem;
        }
        /* Ajustes para móvil */
        @media (max-width: 767.98px) {
             .usuario-table {
                font-size: 0.8rem;
            }
            .usuario-table td, .usuario-table th {
                padding: 0.5rem 0.4rem;
            }
             /* Centrar texto de cabecera en móvil */
            .usuario-table th {
                text-align: center;
            }
        }
      `}</style>

    </Container>
  );
};

export default UsuarioListPage;