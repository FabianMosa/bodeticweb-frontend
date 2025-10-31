import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import insumoService from '../services/insumo.service';
import usuarioService from '../services/usuario.service';
import movimientoService from '../services/movimiento.service';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner, InputGroup } from 'react-bootstrap';
// (Estilos del formulario)
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

const DevolucionPage = () => {
  const [insumos, setInsumos] = useState([]);
  const [tecnicos, setTecnicos] = useState([]);
  
  const [selectedInsumo, setSelectedInsumo] = useState('');
  const [selectedTecnico, setSelectedTecnico] = useState('');
  const [cantidad, setCantidad] = useState(1);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Cargar los desplegables (Insumos y Técnicos)
  useEffect(() => {
    const loadDropdowns = async () => {
      try {
        setLoading(true);
        const [insumosData, tecnicosData] = await Promise.all([
          insumoService.getInsumos(),
          usuarioService.getUsuariosTecnicos()
        ]);
        
        setInsumos(insumosData);
        setTecnicos(tecnicosData);
        
        // Settear valores por defecto para los <select>
        if (insumosData.length > 0) setSelectedInsumo(insumosData[0].PK_id_insumo);
        if (tecnicosData.length > 0) setSelectedTecnico(tecnicosData[0].PK_id_usuario);

      } catch (err) {
        setError('Error al cargar datos');
      } finally {
        setLoading(false);
      }
    };
    loadDropdowns();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const devolucionData = {
        id_insumo: parseInt(selectedInsumo),
        cantidad_devuelta: parseInt(cantidad),
        id_usuario_tecnico: parseInt(selectedTecnico)
      };

      await movimientoService.registrarDevolucion(devolucionData);
      alert('Devolución registrada con éxito');
      navigate('/dashboard'); // Redirige al dashboard

    } catch (err) {
      setError(err.message || 'Error al registrar la devolución');
    } finally {
      setLoading(false);
    }
  };
  
  if (loading && (insumos.length === 0 || tecnicos.length === 0)) return <div>Cargando datos...</div>;

  return (
    <Container fluid className="form-container bg-light min-vh-100 py-4">
      <Row className="justify-content-center">
        <Col xs={12} md={10} lg={8}>
        <div style={{ padding: '20px' }}>
      <Button variant="outline-primary" size="sm" as={Link} to="/dashboard" className="mb-3">
            <i className="bi bi-arrow-left me-1"></i> Volver al Inventario
          </Button> 
      
      <form onSubmit={handleSubmit} style={formStyles}>
        <h2>Registrar Devolución</h2>
        
        <label>Insumo Devuelto:</label>
        <select value={selectedInsumo} onChange={(e) => setSelectedInsumo(e.target.value)} style={inputStyles} required>
          {insumos.map(insumo => (
            <option key={insumo.PK_id_insumo} value={insumo.PK_id_insumo}>
              {insumo.nombre} (Stock: {insumo.stock_actual})
            </option>
          ))}
        </select>
        
        <label>Técnico que Devuelve:</label>
        <select value={selectedTecnico} onChange={(e) => setSelectedTecnico(e.target.value)} style={inputStyles} required>
          {tecnicos.map(tec => (
            <option key={tec.PK_id_usuario} value={tec.PK_id_usuario}>
              {tec.nombre}
            </option>
          ))}
        </select>
        
        <label>Cantidad Devuelta:</label>
        <input type="number" value={cantidad} min="1" onChange={(e) => setCantidad(e.target.value)} style={inputStyles} required />

        <Button type="submit" disabled={loading} style={{...buttonStyles, backgroundColor: '#17a2b8'}}>
          {loading ? 'Registrando...' : 'Confirmar Devolución'}
        </Button>
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </form>
    </div></Col>
      </Row>
    </Container>

    
  );
};

export default DevolucionPage;