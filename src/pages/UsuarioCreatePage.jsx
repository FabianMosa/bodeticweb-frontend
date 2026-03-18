import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import usuarioService from "../services/usuario.service";
import rolService from "../services/rol.service"; // Fixed import path if it was wrong in your previous context
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Spinner,
  InputGroup,
} from "react-bootstrap";
import { useNotification } from "../context/NotificationContext";

const UsuarioCreatePage = () => {
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  // Estado para el formulario
  const [formData, setFormData] = useState({
    nombre: "",
    rut: "",
    password: "",
    id_rol: "",
  });

  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true); // Loading inicial para roles
  const [submitting, setSubmitting] = useState(false); // Loading para el envío
  const [showPassword, setShowPassword] = useState(false); // UX: Mostrar/Ocultar contraseña

  // 1. Cargar los roles para el desplegable
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const data = await rolService.getRoles();
        setRoles(data);

        // Seleccionar rol por defecto si existe
        if (data.length > 0) {
          const defaultRole =
            data.find((r) => r.nombre_rol === "Técnico") || data[0];
          setFormData((prev) => ({ ...prev, id_rol: defaultRole.PK_id_rol }));
        }
      } catch (error) {
        showNotification("Error al cargar los roles del sistema", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchRoles();
  }, [showNotification]);

  // 2. Manejar cambios en el formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // 3. Manejar el envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validación local básica
    if (formData.password.length < 6) {
      showNotification(
        "La contraseña debe tener al menos 6 caracteres",
        "warning"
      );
      return;
    }

    setSubmitting(true);

    try {
      await usuarioService.createUsuario(formData);
      showNotification("Usuario creado exitosamente", "success");
      navigate("/usuarios");
    } catch (err) {
      showNotification(err.message || "Error al crear el usuario", "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Container
        fluid
        className="d-flex min-vh-100 justify-content-center align-items-center bg-light"
      >
        <Spinner animation="border" variant="primary" />
      </Container>
    );
  }

  return (
    <Container fluid className="bg-light min-vh-100 py-4 font-sans">
      <Row className="justify-content-center">
        <Col xs={12} md={8} lg={6} xl={5}>
          {/* Header de Navegación */}
          <div className="d-flex align-items-center mb-4">
            <Button
              variant="link"
              as={Link}
              to="/usuarios"
              className="text-decoration-none text-secondary p-0 me-3"
            >
              <i className="bi bi-arrow-left fs-4"></i>
            </Button>
            <div>
              <h2 className="fw-bold text-dark m-0 h4">Nuevo Usuario</h2>
              <p className="text-muted small mb-0">
                Registra un nuevo miembro del equipo.
              </p>
            </div>
          </div>

          <Card className="shadow-lg border-0 rounded-4 overflow-hidden card-hover">
            <div className="card-header-gradient p-4 text-center text-white">
              <div className="icon-circle mb-2 mx-auto bg-white text-primary">
                <i className="bi bi-person-plus-fill fs-3"></i>
              </div>
              <h3 className="h5 fw-bold mb-0">Crear Cuenta</h3>
            </div>

            <Card.Body className="p-4 p-md-5 bg-white">
              <Form onSubmit={handleSubmit}>
                {/* Campo: Nombre */}
                <Form.Group className="mb-4" controlId="formNombre">
                  <Form.Label className="small fw-bold text-secondary text-uppercase ls-1">
                    Nombre Completo
                  </Form.Label>
                  <InputGroup className="input-group-modern">
                    <InputGroup.Text className="bg-light border-end-0 text-muted">
                      <i className="bi bi-person"></i>
                    </InputGroup.Text>
                    <Form.Control
                      type="text"
                      name="nombre"
                      placeholder="Ej: Juan Pérez"
                      value={formData.nombre}
                      onChange={handleChange}
                      required
                      className="border-start-0 ps-0 bg-light"
                    />
                  </InputGroup>
                </Form.Group>

                {/* Campo: RUT */}
                <Form.Group className="mb-4" controlId="formRut">
                  <Form.Label className="small fw-bold text-secondary text-uppercase ls-1">
                    RUT (Login)
                  </Form.Label>
                  <InputGroup className="input-group-modern">
                    <InputGroup.Text className="bg-light border-end-0 text-muted">
                      <i className="bi bi-card-heading"></i>
                    </InputGroup.Text>
                    <Form.Control
                      type="text"
                      name="rut"
                      placeholder="Ej: 12345678-9"
                      value={formData.rut}
                      onChange={handleChange}
                      required
                      className="border-start-0 ps-0 bg-light"
                    />
                  </InputGroup>
                  <Form.Text className="text-muted small">
                    Sin puntos y con guion.
                  </Form.Text>
                </Form.Group>

                {/* Campo: Contraseña */}
                <Form.Group className="mb-4" controlId="formPassword">
                  <Form.Label className="small fw-bold text-secondary text-uppercase ls-1">
                    Contraseña Temporal
                  </Form.Label>
                  <InputGroup className="input-group-modern">
                    <InputGroup.Text className="bg-light border-end-0 text-muted">
                      <i className="bi bi-lock"></i>
                    </InputGroup.Text>
                    <Form.Control
                      type={showPassword ? "text" : "password"}
                      name="password"
                      placeholder="Mínimo 6 caracteres"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      minLength="6"
                      className="border-start-0 ps-0 bg-light"
                    />
                    <Button
                      variant="link"
                      className="bg-light border border-start-0 text-secondary text-decoration-none"
                      onClick={() => setShowPassword(!showPassword)}
                      tabIndex="-1"
                    >
                      <i
                        className={`bi ${
                          showPassword ? "bi-eye-slash" : "bi-eye"
                        }`}
                      ></i>
                    </Button>
                  </InputGroup>
                </Form.Group>

                {/* Campo: Rol */}
                <Form.Group className="mb-5" controlId="formRol">
                  <Form.Label className="small fw-bold text-secondary text-uppercase ls-1">
                    Rol de Acceso
                  </Form.Label>
                  <InputGroup className="input-group-modern">
                    <InputGroup.Text className="bg-light border-end-0 text-muted">
                      <i className="bi bi-shield-lock"></i>
                    </InputGroup.Text>
                    <Form.Select
                      name="id_rol"
                      value={formData.id_rol}
                      onChange={handleChange}
                      required
                      className="border-start-0 ps-0 bg-light cursor-pointer"
                    >
                      <option value="" disabled>
                        -- Seleccione un rol --
                      </option>
                      {roles.map((rol) => (
                        <option key={rol.PK_id_rol} value={rol.PK_id_rol}>
                          {rol.nombre_rol}
                        </option>
                      ))}
                    </Form.Select>
                  </InputGroup>
                </Form.Group>

                <div className="d-grid">
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="btn-lg shadow-sm btn-gradient-success border-0"
                  >
                    {submitting ? (
                      <>
                        <Spinner
                          as="span"
                          animation="border"
                          size="sm"
                          className="me-2"
                        />
                        Guardando...
                      </>
                    ) : (
                      "Crear Usuario"
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

export default UsuarioCreatePage;
