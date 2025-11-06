import React, { useState } from 'react';
import authService from './../services/auth.services';
import{useNavigate} from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner, InputGroup } from 'react-bootstrap';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { useNotification } from '../context/NotificationContext';

const LoginPage = () => {
  // Estados para guardar lo que el usuario escribe
  const [rut, setRut] = useState('');
  const [password, setPassword] = useState('');  
  const [loading, setLoading] = useState(false);

  // (Opcional: hook de navegación)
 const navigate = useNavigate();
const { showNotification } = useNotification();

  const handleLogin = async (e) => {
    e.preventDefault(); // Evita que el formulario recargue la página    
    setLoading(true);
    try {
      // Llamamos a nuestro servicio de autenticación
      const data = await authService.login(rut, password);

      showNotification(`Bienvenido, ${data.usuario.nombre}`, 'success');
      navigate('/dashboard');

    } catch (err) {
      // Si el servicio lanza un error (ej. 401), lo mostramos
      showNotification(err.message || 'Error al iniciar sesión', 'error');
    } finally {
      setLoading(false);
    }
  };

  

  return (
    
    <Container fluid className={`bg-light min-vh-100 py-4`}>
          <Row className="justify-content-center">
            <Col xs={12} md={10} lg={8} xl={6}>         
                      
              <Card className="shadow-sm border-1">
                <Card.Header as="h2" className="text-center fw-bold form-header">
                  BodeTICWeb
                </Card.Header>
                <Card.Body className="p-4 p-md-5">
                  <Card.Title className="text-center fw-bold" as="h2">Iniciar Sesion</Card.Title>
                  <Form onSubmit={handleLogin}>
                    <Form.Group className="mb-3" controlId="formRut">
                      <Form.Label>RUT:</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Ingrese su RUT"
                        value={rut}
                        onChange={(e) => setRut(e.target.value)}
                        required className='form-control-focus'
                      />                
                </Form.Group>

                <Form.Group className="mb-4" controlId="formPassword">
                  <Form.Label>Contraseña:</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Ingrese su contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </Form.Group>
                {/* Botón de Acción (Bootstrap) */}
                <div className="d-grid">
                  <Button variant="primary" type="submit" disabled={loading} size="lg">
                    {loading ? (
                      <>
                        <Spinner
                          as="span"
                          animation="border"
                          size="sm"
                          role="status"
                          aria-hidden="true"
                        />
                        <span className="ms-2">Cargando...</span>
                      </>
                    ) : (
                      'Ingresar'
                    )}
                  </Button>
                </div>

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

export default LoginPage;