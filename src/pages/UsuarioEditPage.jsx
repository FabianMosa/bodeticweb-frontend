
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import usuarioService from '../services/usuario.service';
import rolService from '../services/rol.service';
import { useNotification } from '../context/NotificationContext';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner,InputGroup} from 'react-bootstrap';

// ----------------------------------------------------------------- Estilos ---
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

const ChangePasswordForm = ({ userId }) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { showNotification } = useNotification();

  const handleSubmitPassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      showNotification('La contraseña debe tener al menos 6 caracteres', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      showNotification('Las contraseñas no coinciden', 'error');
      return;
    }

    setLoading(true);
    try {
      await usuarioService.changePasswordAdmin(userId, newPassword);
      showNotification('Contraseña actualizada con éxito', 'success');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      showNotification(err.message || 'Error al actualizar la contraseña', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="shadow-sm border-0 mt-4">
      <Card.Header as="h5" className="fw-bold form-header">
        <i className="bi bi-key-fill me-2"></i> Cambiar Contraseña
      </Card.Header>
      <Card.Body className="p-4">
        <Form noValidate onSubmit={handleSubmitPassword}>
          <Form.Group className="mb-3" controlId="formNewPassword">
            <Form.Label>Nueva Contraseña:</Form.Label>
            <InputGroup>
              <Form.Control
                type={showPassword ? 'text' : 'password'}
                placeholder="Mínimo 6 caracteres"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="form-control-focus"
              />
              <Button variant="outline-secondary" onClick={() => setShowPassword(!showPassword)}>
                <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
              </Button>
            </InputGroup>
          </Form.Group>

          <Form.Group className="mb-3" controlId="formConfirmPassword">
            <Form.Label>Confirmar Contraseña:</Form.Label>
            <Form.Control
              type="password"
              placeholder="Repita la contraseña"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="form-control-focus"
            />
          </Form.Group>

          <div className="d-grid">
            <Button variant="warning" type="submit" disabled={loading}>
              {loading ? <Spinner as="span" size="sm" animation="border" /> : 'Actualizar Contraseña'}
            </Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
};

const UsuarioEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState(null);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
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
        navigate('/usuarios');// Volver a la lista si hay error
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id, navigate, showNotification]);//

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

  if (loading || !formData) return (
    <Container fluid className="d-flex min-vh-100 justify-content-center align-items-center bg-light">
      <Spinner animation="border" variant="primary" />
    </Container>
  );

  return (
    <Container fluid className={`bg-light min-vh-100 py-4`}>
          <Row className="justify-content-center">
            <Col xs={12} md={10} lg={8} xl={6}>         
                  <Button variant="outline-primary" size="sm" as={Link} to="/usuarios" className="mb-3">
                    <i className="bi bi-arrow-left me-1"></i> Volver a Usuarios
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

                      <Button type="submit" disabled={submitting} style={buttonStyles}>
                        {submitting ? 'Actualizando...' : 'Actualizar Usuario'}
                      </Button>
                    </Form>                 
                </Card.Body>
            </Card>
            {/* Formulario de Contraseña */}
          <ChangePasswordForm userId={id} />
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