
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import insumoService from '../services/insumo.service';
import {useNotification} from '../context/NotificationContext'
import { Container, Row, Col, Button, Table, Card, Spinner, ButtonGroup, Form } from 'react-bootstrap';

// ---------------------------------------------------(Estilos del formulario)
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

const InventarioEditPage = () => {
  // useParams() obtiene el ':id' de la URL
  const { id } = useParams(); 
  const navigate = useNavigate();

  const [formData, setFormData] = useState(null); // Empezar en null
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);  
  const { showNotification } = useNotification();

  // 1. Cargar categorías Y los datos del insumo a editar
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        // Pedimos ambas cosas al mismo tiempo
        const [insumoData, categoriasData] = await Promise.all([
          insumoService.getInsumoById(id),
          insumoService.getCategorias()
        ]);
        
        // Corregir formato de fecha si viene (YYYY-MM-DDTHH:mm:ss.sssZ -> YYYY-MM-DD)
        if (insumoData.fecha_vencimiento) {
          insumoData.fecha_vencimiento = insumoData.fecha_vencimiento.split('T')[0];
        }

        setFormData(insumoData);
        setCategorias(categoriasData);
        
      } catch (err) {
        showNotification(err.message ||'Error al cargar los datos', 'error');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id]); // Se re-ejecuta si el ID de la URL cambia

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Preparamos los datos a enviar
    const dataToUpdate = {
      nombre: formData.nombre,
      sku: formData.sku,
      descripcion: formData.descripcion,
      stock_minimo: formData.stock_minimo,
      id_categoria: formData.FK_id_categoria, // Ojo con el nombre de la FK
      fecha_vencimiento: formData.fecha_vencimiento
    };

    try {
      await insumoService.updateInsumo(id, dataToUpdate);
      showNotification('Insumo actualizado con éxito','success');
      navigate('/inventario'); // Redirige a la lista
    } catch (err) {
      showNotification(err.message || 'Error al actualizar el insumo','error');
    } finally {
      setLoading(false);
    }
  };

  if (loading || !formData) return <div>Cargando datos del insumo...</div>;

  return (
     <Container fluid className={`bg-light min-vh-100 py-4`}>
      <Row className="justify-content-center">
        <Col xs={12} md={10} lg={8} xl={6}>         
          <Button variant="outline-primary" size="sm" as={Link} to="/inventario" className="mb-3">
        <i className="bi bi-arrow-left me-1"></i> Volver al Inventario
          </Button>

          <Card className="shadow-sm border-0">
            <Card.Header as="h2" className="text-center text-white fw-bold bg-primary form-header">
              Editar Insumo
            </Card.Header>
            <Card.Body className="p-4 p-md-5">
              
                <Form onSubmit={handleSubmit} style={formStyles}>           
                  <label>Nombre</label>
                  <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} style={inputStyles} required />
                  
                  <label>SKU (Código de Barras)</label>
                  <input type="text" name="sku" value={formData.sku} onChange={handleChange} style={inputStyles} required />
                  
                  <label>Categoría</label>
                  <select name="FK_id_categoria" value={formData.FK_id_categoria} onChange={handleChange} style={inputStyles} required>
                    {categorias.map(cat => (
                      <option key={cat.PK_id_categoria} value={cat.PK_id_categoria}>
                        {cat.nombre_categoria}
                      </option>
                    ))}
                  </select>
                  
                  {/*----------------------- No editamos el Stock Actual aquí, solo el mínimo */}
                  <label>Stock Mínimo</label>
                  <input type="number" name="stock_minimo" value={formData.stock_minimo} min="0" onChange={handleChange} style={inputStyles} required />
                  
                  <label>Fecha Vencimiento (Opcional)</label>
                  <input type="date" name="fecha_vencimiento" value={formData.fecha_vencimiento || ''} onChange={handleChange} style={inputStyles} />
                  
                  <label>Descripción (Opcional)</label>
                  <textarea name="descripcion" value={formData.descripcion || ''} onChange={handleChange} style={inputStyles}></textarea>

                  <Button type="submit" disabled={loading} style={{...buttonStyles, backgroundColor: '#ffc107'}}>
                    {loading ? 'Actualizando...' : 'Actualizar Insumo'}
                  </Button>
                </Form>    
            </Card.Body>
          </Card>                   
        </Col>
    </Row>
    </Container>
  );
};

export default InventarioEditPage;
