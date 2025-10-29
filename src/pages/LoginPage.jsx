import React, { useState } from 'react';
import authService from './../services/auth.services';
import{useNavigate} from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner, InputGroup } from 'react-bootstrap';
import 'bootstrap-icons/font/bootstrap-icons.css';
import styles from '../styles/LoginPage.module.css';

/*/ Opcional: un poco de estilo para empezar
const loginStyles = {
  display: 'flex',
  flexDirection: 'column',
  width: '300px',
  margin: '100px auto',
  padding: '20px',
  border: '1px solid #ccc',
  borderRadius: '8px',
  boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
  texAlign: 'center'
};

const inputStyles = {
  marginBottom: '10px',
  padding: '8px',
  fontSize: '16px'
};

const buttonStyles = {
  padding: '10px',
  fontSize: '16px',
  backgroundColor: '#007bff',
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer'
};*/


const LoginPage = () => {
  // Estados para guardar lo que el usuario escribe
  const [rut, setRut] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // (Opcional: hook de navegación)
 const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault(); // Evita que el formulario recargue la página
    setError('');
    setLoading(true);

    try {
      // Llamamos a nuestro servicio de autenticación
      const data = await authService.login(rut, password);
      
      //console.log('Login exitoso:', data);
      //alert(`Bienvenido, ${data.usuario.nombre}!`);
      
      navigate('/dashboard');

    } catch (err) {
      // Si el servicio lanza un error (ej. 401), lo mostramos
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  

  return (
    
    <Container fluid className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <Row className="w-100 justify-content-center">
        {/* El "Col" define el ancho en diferentes pantallas */}
        <Col xs={12} sm={10} md={8} lg={6} xl={4}>

          <Card className="login-card shadow-sm">
            <Card.Body className="p-4 p-md-5">

              <h2 className="card-title fw-bold text-center mb-4">
                BodeTIC
              </h2>
               <h2 className="card-title fw-bold text-center mb-4">
                Iniciar Sesión
              </h2>
              
              {/* 3. Usa los componentes de Formulario */}
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
                    placeholder="Contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </Form.Group>

                {/* 4. Alerta de Error (Bootstrap) */}
                {error && (
                  <Alert variant="danger" className="text-center small mb-4">
                    {error}
                  </Alert>
                )}

                {/* 5. Botón de Acción (Bootstrap) */}
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
    </Container>
  );
};

export default LoginPage;