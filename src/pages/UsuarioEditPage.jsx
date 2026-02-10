import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import usuarioService from "../services/usuario.service";
import rolService from "../services/rol.service";
import { useNotification } from "../context/NotificationContext";
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

// Componente para Cambiar Contraseña (Separado visualmente)
const ChangePasswordForm = ({ userId }) => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { showNotification } = useNotification();

  const handleSubmitPassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      showNotification(
        "La contraseña debe tener al menos 6 caracteres",
        "error"
      );
      return;
    }
    if (newPassword !== confirmPassword) {
      showNotification("Las contraseñas no coinciden", "error");
      return;
    }

    setLoading(true);
    try {
      await usuarioService.changePasswordAdmin(userId, newPassword);
      showNotification("Contraseña actualizada con éxito", "success");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      showNotification(
        err.message || "Error al actualizar la contraseña",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="shadow-sm border-0 mt-4 mb-5">
      <Card.Header className="bg-secondary text-white fw-bold">
        <i className="bi bi-shield-lock-fill me-2"></i>Seguridad: Cambiar
        Contraseña
      </Card.Header>
      <Card.Body className="p-4">
        <Form onSubmit={handleSubmitPassword}>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3" controlId="formNewPassword">
                <Form.Label>Nueva Contraseña</Form.Label>
                <InputGroup>
                  <Form.Control
                    type={showPassword ? "text" : "password"}
                    placeholder="Mínimo 6 caracteres"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                  <Button
                    variant="outline-secondary"
                    onClick={() => setShowPassword(!showPassword)}
                    title={showPassword ? "Ocultar" : "Mostrar"}
                  >
                    <i
                      className={`bi ${
                        showPassword ? "bi-eye-slash" : "bi-eye"
                      }`}
                    ></i>
                  </Button>
                </InputGroup>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3" controlId="formConfirmPassword">
                <Form.Label>Confirmar Contraseña</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="Repita la nueva contraseña"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </Form.Group>
            </Col>
          </Row>

          <div className="d-grid gap-2 d-md-flex justify-content-md-end">
            <Button
              variant="warning"
              type="submit"
              disabled={loading}
              className="text-dark fw-bold"
            >
              {loading ? (
                <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                    className="me-2"
                  />
                  Actualizando...
                </>
              ) : (
                <>
                  <i className="bi bi-check-circle-fill me-2"></i>Actualizar
                  Contraseña
                </>
              )}
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
          rolService.getRoles(),
        ]);
        setFormData(userData);
        setRoles(rolesData);
      } catch (err) {
        showNotification(err.message || "Error al cargar datos", "error");
        navigate("/usuarios");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id, navigate, showNotification]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (checked ? 1 : 0) : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const dataToUpdate = {
      nombre: formData.nombre,
      rut: formData.rut,
      id_rol: formData.FK_id_rol,
      activo: formData.activo,
    };

    try {
      await usuarioService.updateUsuario(id, dataToUpdate);
      showNotification("Usuario actualizado con éxito", "success");
      navigate("/usuarios");
    } catch (err) {
      showNotification(err.message || "Error al actualizar", "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !formData)
    return (
      <Container
        fluid
        className="d-flex min-vh-100 justify-content-center align-items-center bg-light"
      >
        <div className="text-center">
          <Spinner
            animation="border"
            variant="primary"
            style={{ width: "3rem", height: "3rem" }}
          />
          <p className="mt-3 text-muted">Cargando información del usuario...</p>
        </div>
      </Container>
    );

  return (
    <Container fluid className="bg-light min-vh-100 py-4">
      <Row className="justify-content-center">
        <Col xs={12} lg={10} xl={8}>
          {/* Botón Volver */}
          <div className="d-flex align-items-center mb-4">
            <Button
              variant="outline-secondary"
              size="sm"
              as={Link}
              to="/usuarios"
              className="me-3"
            >
              <i className="bi bi-arrow-left"></i>
            </Button>
            <h4 className="mb-0 text-dark fw-bold">Gestión de Cuentas</h4>
          </div>

          {/* Tarjeta Principal: Datos del Usuario */}
          <Card className="shadow-sm border-0 mb-4">
            <Card.Header className="bg-primary text-white fw-bold py-3">
              <i className="bi bi-person-gear me-2"></i>Editar Información
            </Card.Header>
            <Card.Body className="p-4 p-md-5">
              <Form onSubmit={handleSubmit}>
                <Row className="gy-3">
                  {/* Nombre */}
                  <Col md={6}>
                    <Form.Group controlId="formNombre">
                      <Form.Label className="fw-semibold">
                        Nombre Completo
                      </Form.Label>
                      <Form.Control
                        type="text"
                        name="nombre"
                        value={formData.nombre}
                        onChange={handleChange}
                        required
                        placeholder="Ej: Juan Pérez"
                        className="form-control-lg"
                      />
                    </Form.Group>
                  </Col>

                  {/* RUT */}
                  <Col md={6}>
                    <Form.Group controlId="formRut">
                      <Form.Label className="fw-semibold">
                        RUT (Login)
                      </Form.Label>
                      <Form.Control
                        type="text"
                        name="rut"
                        value={formData.rut}
                        onChange={handleChange}
                        required
                        placeholder="Ej: 12345678-9"
                        className="form-control-lg"
                      />
                    </Form.Group>
                  </Col>

                  {/* Rol */}
                  <Col md={6}>
                    <Form.Group controlId="formRol">
                      <Form.Label className="fw-semibold">
                        Rol de Acceso
                      </Form.Label>
                      <Form.Select
                        name="FK_id_rol"
                        value={formData.FK_id_rol}
                        onChange={handleChange}
                        required
                        className="form-select-lg"
                      >
                        <option value="" disabled>
                          Seleccione un rol
                        </option>
                        {roles.map((rol) => (
                          <option key={rol.PK_id_rol} value={rol.PK_id_rol}>
                            {rol.nombre_rol}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>

                  {/* Estado (Switch Moderno) */}
                  <Col md={6} className="d-flex align-items-center">
                    <Form.Group
                      controlId="formActivo"
                      className="mt-4 p-2 border rounded w-100 bg-light"
                    >
                      <Form.Check
                        type="switch"
                        id="custom-switch"
                        name="activo"
                        label={
                          formData.activo
                            ? "Usuario Activo (Habilitado)"
                            : "Usuario Inactivo (Deshabilitado)"
                        }
                        checked={!!formData.activo}
                        onChange={handleChange}
                        className={
                          formData.activo
                            ? "text-success fw-bold"
                            : "text-danger fw-bold"
                        }
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <hr className="my-4" />

                <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                  <Button
                    variant="success"
                    type="submit"
                    disabled={submitting}
                    size="lg"
                    className="px-5 shadow-sm"
                  >
                    {submitting ? (
                      <>
                        <Spinner
                          as="span"
                          animation="border"
                          size="sm"
                          role="status"
                          aria-hidden="true"
                          className="me-2"
                        />
                        Guardando...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-save me-2"></i>Guardar Cambios
                      </>
                    )}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>

          {/* Tarjeta Secundaria: Cambiar Contraseña */}
          <ChangePasswordForm userId={id} />
        </Col>
      </Row>
    </Container>
  );
};

export default UsuarioEditPage;
