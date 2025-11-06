
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import usuarioService from '../services/usuario.service';
import rolService from '../services/rol.services';
import { useNotification } from '../context/NotificationContext';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';

// --- Estilos ---
const formStyles = {
  display: 'flex',
  flexDirection: 'column',
  maxWidth: '500px',
  margin: '20px auto',
  padding: '20px',
  border: '1px solid #ccc',
  borderRadius: '8px',
};
const inputStyles = { marginBottom: '10px', padding: '8px', fontSize: '16px' };
const buttonStyles = { padding: '10px', fontSize: '16px', backgroundColor: '#28a745', color: 'white', border: 'none', cursor: 'pointer' };
// --- Fin Estilos ---

const UsuarioEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState(null);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
const { showNotification } = useNotification();
  // Cargar Roles y datos del Usuario
  useEffect(() => {
    const loadData = async () => {
      try {
        const [userData, rolesData] = await Promise.all([
          usuarioService.getUsuarioById(id),
          rolService.getRoles()
        ]);
        setFormData(userData);
        setRoles(rolesData);
      } catch (err) {
        showNotification(err.message ||'Error al cargar datos', 'error');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (checked ? 1 : 0) : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
  
    
    // Preparamos los datos (sin password)
    const dataToUpdate = {
      nombre: formData.nombre,
      rut: formData.rut,
      id_rol: formData.FK_id_rol,
      activo: formData.activo
    };

    try {
      await usuarioService.updateUsuario(id, dataToUpdate);
      showNotification('Usuario actualizado con éxito', 'success');
      navigate('/usuarios');
    } catch (err) {
      showNotification(err.message || 'Error al actualizar', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading || !formData) return <div>Cargando...</div>;

  return (
    <Container fluid className={`bg-light min-vh-100 py-4`}>
          <Row className="justify-content-center">
            <Col xs={12} md={10} lg={8} xl={6}>         
                  <Button variant="outline-primary" size="sm" as={Link} to="/dashboard" className="mb-3">
                    <i className="bi bi-arrow-left me-1"></i> Volver al Inventario
                  </Button>
    
              <Card className="shadow-sm border-0">
                <Card.Header as="h2" className="text-center fw-bold form-header">
                  Editar Usuario
                </Card.Header>
                <Card.Body className="p-4 p-md-5">                  
                    <Form onSubmit={handleSubmit} style={formStyles}>                  
                      
                      <label>Nombre:</label>
                      <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} style={inputStyles} required />
                      
                      <label>RUT:</label>
                      <input type="text" name="rut" value={formData.rut} onChange={handleChange} style={inputStyles} required />
                      
                      <label>Rol:</label>
                      <select name="FK_id_rol" value={formData.FK_id_rol} onChange={handleChange} style={inputStyles} required>
                        {roles.map(rol => (
                          <option key={rol.PK_id_rol} value={rol.PK_id_rol}>
                            {rol.nombre_rol}
                          </option>
                        ))}
                      </select>

                      <label>
                        <input 
                          type="checkbox" 
                          name="activo" 
                          checked={formData.activo} 
                          onChange={handleChange} 
                        />
                        Activo (Deshabilitar usuario si se desmarca)
                      </label>

                      <Button type="submit" disabled={loading} style={buttonStyles}>
                        {loading ? 'Actualizando...' : 'Actualizar Usuario'}
                      </Button>
                    </Form>                 
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
                       background-color: #1279e0ff;
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


export default UsuarioEditPage;