import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import insumoService from '../services/insumo.service';
import proveedorService from '../services/proveedor.service';

// --- Estilos para el Formulario ---
const formStyles = {
  display: 'flex',
  flexDirection: 'column',
  maxWidth: '600px',
  margin: '20px auto',
  padding: '20px',
  border: '1px solid #ccc',
  borderRadius: '8px',
  boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
};
const fieldsetStyles = {
  border: '1px solid #007bff',
  borderRadius: '4px',
  marginBottom: '15px',
  padding: '10px 15px'
};
const inputStyles = { 
  width: '95%', 
  marginBottom: '10px', 
  padding: '8px', 
  fontSize: '16px',
  borderRadius: '4px',
  border: '1px solid #ddd'
};
const buttonStyles = { 
  padding: '12px', 
  fontSize: '16px', 
  backgroundColor: '#28a745', 
  color: 'white', 
  border: 'none', 
  cursor: 'pointer',
  borderRadius: '4px',
  marginTop: '10px'
};
// --- Fin Estilos ---
const InventarioCreatePage = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    sku: '',
    descripcion: '',
    stock_inicial: 0,
    stock_minimo: 1,
    id_categoria: '',
    fecha_vencimiento: null,
    id_proveedor: '',
    codigo_documento: '',
    fecha_emision: new Date().toISOString().split('T')[0], // Fecha actual
  });
  const [categorias, setCategorias] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  //ACTUALIZAR USE EFFECT (CARGAR AMBOS)
  useEffect(() => {
    const loadDropdowns = async () => {
      setLoading(true);
      try {
        // Pedimos ambas listas al mismo tiempo
        const [categoriasData, proveedoresData] = await Promise.all([
          insumoService.getCategorias(),
          proveedorService.getProveedores()
        ]);
        
        setCategorias(categoriasData);
        setProveedores(proveedoresData);

        // Settear valores por defecto
        if (categoriasData.length > 0) {
          setFormData(f => ({ ...f, id_categoria: categoriasData[0].PK_id_categoria }));
        }
        if (proveedoresData.length > 0) {
          setFormData(f => ({ ...f, id_proveedor: proveedoresData[0].PK_id_proveedor }));
        }

      } catch (err) {
        setError('Error al cargar datos (categorías o proveedores)');
      } finally {
        setLoading(false);
      }
    };
    loadDropdowns();
  }, []);

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
    setError('');

    try {
      await insumoService.createInsumo(formData);
      alert('Insumo y documento de ingreso creados con éxito');
      navigate('/inventario'); // Redirige a la lista
    } catch (err) {
      setError(err.message || 'Error al crear el insumo');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Cargando datos...</div>;

  return (
   <div style={{ padding: '20px' }}>
      <Link to="/inventario" style={{...buttonStyles, backgroundColor: '#7a9ee0ff', color: 'black', textDecoration: 'none'}}>{"Volver"} </Link>
      <form onSubmit={handleSubmit} style={formStyles}>
        <h2>Registrar Nuevo Insumo </h2>

        {/* Mostramos el error principal aquí */}
        {error && <p style={{ color: 'red', backgroundColor: '#ffe0e0', padding: '10px', borderRadius: '4px' }}>{error}</p>}

        {/* SECCIÓN 1: DATOS DEL INGRESO */}
        <fieldset style={fieldsetStyles}>
          <legend>1. Información de Ingreso (Factura/Guía)</legend>
          
          <label>Proveedor:</label>
          <select name="id_proveedor" onChange={handleChange} style={inputStyles} required value={formData.id_proveedor}>
          {proveedores.map(prov => (
            <option key={prov.PK_id_proveedor} value={prov.PK_id_proveedor}>
              {prov.nombre_proveedor}
            </option>
          ))}
        </select> 
        <br />
          <label>N° Documento (Factura/Guía):</label>
          <input type="text" name="codigo_documento" value={formData.codigo_documento} onChange={handleChange} style={inputStyles} required />

          <label>Fecha Emisión (Documento):</label>
          <input type="date" name="fecha_emision" value={formData.fecha_emision} onChange={handleChange} style={inputStyles} required />
        </fieldset>
        <fieldset style={{...fieldsetStyles, border: '1px solid #ccc'}}>
          <legend>2. Información del Insumo</legend>
        <label>Nombre:</label>
        <input type="text" name="nombre" onChange={handleChange} style={inputStyles} required />
        
        <label>SKU (Código de Barras):</label>
        <input type="text" name="sku" onChange={handleChange} style={inputStyles} required />
        
        <label>Proveedor:</label>
             
        <label>Categoría:</label>
        <select name="id_categoria" onChange={handleChange} style={inputStyles} required value={formData.id_categoria}>
          {categorias.map(cat => (
            <option key={cat.PK_id_categoria} value={cat.PK_id_categoria}>
              {cat.nombre_categoria}
            </option>
          ))}
        </select>           
        <label>Stock Inicial:</label>
        <input type="number" name="stock_inicial" min="0" onChange={handleChange} style={inputStyles} required />
        
        <label>Stock Mínimo:</label>
        <input type="number" name="stock_minimo" min="1" onChange={handleChange} style={inputStyles} required />
        
        <label>Fecha Vencimiento (Opcional):</label>
        <input type="date" name="fecha_vencimiento" onChange={handleChange} style={inputStyles} />
        
        <label>Descripción (Opcional):</label>
        <textarea name="descripcion" onChange={handleChange} style={inputStyles}></textarea>
        </fieldset>
        <button type="submit" disabled={loading} style={buttonStyles}>
          {loading ? 'Guardando...' : 'Crear Insumo'}
        </button>
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </form>
    </div>
  );
};

export default InventarioCreatePage;