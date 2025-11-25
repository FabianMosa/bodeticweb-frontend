
import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import insumoService from '../services/insumo.service'; // (Lo mantenemos por si se necesita, aunque no en este flujo)
import usuarioService from '../services/usuario.service';
import movimientoService from '../services/movimiento.service';
import { useNotification } from '../context/NotificationContext';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';

const DevolucionPage = () => {
  // --- Estados de Datos ---
  const [tecnicos, setTecnicos] = useState([]); // Lista de todos los técnicos
  const [allPrestamos, setAllPrestamos] = useState([]); // Lista de TODOS los préstamos activos
  const [insumosFiltrados, setInsumosFiltrados] = useState([]); // Insumos que el técnico seleccionado debe

  // --- Estados del Formulario ---
  const [selectedTecnico, setSelectedTecnico] = useState('');
  const [selectedInsumoId, setSelectedInsumoId] = useState('');
  const [cantidad, setCantidad] = useState(1);
  const [maxCantidad, setMaxCantidad] = useState(1); // Máximo que se puede devolver
  
  const [loading, setLoading] = useState(true);
  const { showNotification } = useNotification();
  const navigate = useNavigate();

  // --- Cargar datos iniciales (Técnicos y TODOS los Préstamos) ---
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        // Pedimos los técnicos y la lista completa de préstamos pendientes
        const [tecnicosData, prestamosData] = await Promise.all([
          usuarioService.getUsuariosTecnicos(),
          movimientoService.getPrestamosActivos() // (RF-09)
        ]);
        
        setTecnicos(tecnicosData);
        setAllPrestamos(prestamosData);
        
        // Settear valor por defecto para el primer <select>
        if (tecnicosData.length > 0) {
          setSelectedTecnico(tecnicosData[0].PK_id_usuario);
        }

      } catch (err) {
        showNotification(err.message || 'Error al cargar datos', 'error');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [showNotification]); // Quitar 'insumos' y 'tecnicos' de las dependencias

  // --- Reaccionar al cambio de Técnico (Dropdown en Cascada) ---
  useEffect(() => {
    if (selectedTecnico) {
      // Filtramos la lista de préstamos para mostrar solo los de este técnico
      const prestamosDelTecnico = allPrestamos.filter(
        p => p.FK_id_usuario === parseInt(selectedTecnico)
      );
      setInsumosFiltrados(prestamosDelTecnico);
      
      // Auto-seleccionar el primer insumo de la nueva lista
      if (prestamosDelTecnico.length > 0) {
        setSelectedInsumoId(prestamosDelTecnico[0].FK_id_insumo);
        setMaxCantidad(prestamosDelTecnico[0].cantidad_pendiente);
      } else {
        setSelectedInsumoId('');
        setMaxCantidad(1);
      }
      setCantidad(1); // Resetear cantidad
    }
  }, [selectedTecnico, allPrestamos]); // Este hook depende del técnico seleccionado

  // --- Reaccionar al cambio de Insumo ---
  useEffect(() => {
    if (selectedInsumoId) {
      // Encontrar el préstamo seleccionado para saber su cantidad máxima
      const prestamo = insumosFiltrados.find(
        p => p.FK_id_insumo === parseInt(selectedInsumoId)
      );
      if (prestamo) {
        setMaxCantidad(prestamo.cantidad_pendiente);
      }
    }
    setCantidad(1); // Resetear cantidad
  }, [selectedInsumoId, insumosFiltrados]);

  // --- Lógica de Envío (Submit) ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);    

    if (cantidad > maxCantidad) {
        showNotification(`Error: La cantidad a devolver (${cantidad}) es mayor a la pendiente (${maxCantidad}).`, 'error');
        setLoading(false);
        return;
    }

    try {
      const devolucionData = {
        id_insumo: parseInt(selectedInsumoId),
        cantidad_devuelta: parseInt(cantidad),
        id_usuario_tecnico: parseInt(selectedTecnico)
      };

      const response = await movimientoService.registrarDevolucion(devolucionData);
      
      // Usar Notificación Global (reemplaza el alert())
      showNotification(response.message, 'success');
      navigate('/dashboard'); // Redirige al dashboard

    } catch (err) {
      showNotification(err.message || 'Error al registrar la devolución', 'error');
    } finally {
      setLoading(false);
    }
  };
  
  if (loading && tecnicos.length === 0) {
    return (
        <Container fluid className="bg-light min-vh-100 py-4 text-center">
            <Spinner animation="border" variant="primary" />
            <p>Cargando datos...</p>
        </Container>
    );
  }

  return (
    <Container fluid className={`bg-light min-vh-100 py-4`}>
      <Row className="justify-content-center">
        <Col xs={12} md={10} lg={8} xl={6}>         
          <Button variant="outline-primary" size="sm" as={Link} to="/dashboard" className="mb-3">
        <i className="bi bi-arrow-left me-1"></i> Volver al Inventario
          </Button>

          <Card className="shadow-sm border-0">
            <Card.Header as="h2" className="text-center fw-bold bg-primary form-header">
              Registrar Devolución
            </Card.Header>
            <Card.Body className="p-4 p-md-5">
              
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="formTecnico">
                  <Form.Label className="fw-bold">Técnico que Devuelve:</Form.Label>
                  <Form.Select 
                    value={selectedTecnico} 
                    onChange={(e) => setSelectedTecnico(e.target.value)} 
                    required 
                    className="form-control-focus"
                    disabled={loading}
                  >
                    {tecnicos.length === 0 && <option disabled>No hay técnicos</option>}
                    {tecnicos.map(tec => (
                      <option key={tec.PK_id_usuario} value={tec.PK_id_usuario}>
                        {tec.nombre}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
                
                <Form.Group className="mb-3" controlId="formInsumo">
                  <Form.Label className="fw-bold">Insumo Devuelto (Solo pendientes):</Form.Label>
                  <Form.Select 
                    value={selectedInsumoId} 
                    onChange={(e) => setSelectedInsumoId(e.target.value)} 
                    required 
                    className="form-control-focus"
                    disabled={insumosFiltrados.length === 0 || loading}
                  >
                    {insumosFiltrados.length === 0 ? (
                      <option disabled value="">-- Este técnico no tiene préstamos --</option>
                    ) : (
                      insumosFiltrados.map(prestamo => (
                        <option key={prestamo.FK_id_insumo} value={prestamo.FK_id_insumo}>
                          {prestamo.nombre_insumo} (Pendiente: {prestamo.cantidad_pendiente})
                        </option>
                      ))
                    )}
                  </Form.Select>
                </Form.Group>
                
                <Form.Group className="mb-3" controlId="formCantidad">
                  <Form.Label className="fw-bold">Cantidad Devuelta:</Form.Label>
                  <Form.Control 
                    type="number" 
                    value={cantidad} 
                    min="1" 
                    max={maxCantidad} // Validación de máximo
                    onChange={(e) => setCantidad(e.target.value)} 
                    required 
                    className="form-control-focus"
                    disabled={insumosFiltrados.length === 0 || loading}
                  />
                  {insumosFiltrados.length > 0 && 
                    <Form.Text className="text-muted">
                      Máximo a devolver: {maxCantidad}
                    </Form.Text>
                  }
                </Form.Group>

                <div className="d-grid gap-2 mt-4">
                  <Button 
                    variant="info" 
                    type="submit" 
                    disabled={loading || insumosFiltrados.length === 0} 
                    className="text-white"
                  >
                    {loading ? (
                      <>
                        <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                        <span className="ms-2">Registrando...</span>
                      </>
                    ) : (
                      'Confirmar Devolución'
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

export default DevolucionPage;