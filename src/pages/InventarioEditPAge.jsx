
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import insumoService from '../services/insumo.service';

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

const InventarioEditPage = () => {
  // useParams() obtiene el ':id' de la URL
  const { id } = useParams(); 
  const navigate = useNavigate();

  const [formData, setFormData] = useState(null); // Empezar en null
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
        setError('Error al cargar los datos');
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
    setError('');

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
      alert('Insumo actualizado con éxito');
      navigate('/inventario'); // Redirige a la lista
    } catch (err) {
      setError(err.message || 'Error al actualizar el insumo');
    } finally {
      setLoading(false);
    }
  };

  if (loading || !formData) return <div>Cargando datos del insumo...</div>;

  return (
    <div style={{ padding: '20px' }}>
      <Link to="/inventario" style={{...buttonStyles, backgroundColor: '#7a9ee0ff', color: 'black', textDecoration: 'none'}}>{"Volver"}</Link>
      <form onSubmit={handleSubmit} style={formStyles}>
        <h2>Editar Insumo (RF-06)</h2>
        
        <label>Nombre:</label>
        <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} style={inputStyles} required />
        
        <label>SKU (Código de Barras):</label>
        <input type="text" name="sku" value={formData.sku} onChange={handleChange} style={inputStyles} required />
        
        <label>Categoría:</label>
        <select name="FK_id_categoria" value={formData.FK_id_categoria} onChange={handleChange} style={inputStyles} required>
          {categorias.map(cat => (
            <option key={cat.PK_id_categoria} value={cat.PK_id_categoria}>
              {cat.nombre_categoria}
            </option>
          ))}
        </select>
        
        {/* No editamos el Stock Actual aquí, solo el mínimo */}
        <label>Stock Mínimo:</label>
        <input type="number" name="stock_minimo" value={formData.stock_minimo} min="1" onChange={handleChange} style={inputStyles} required />
        
        <label>Fecha Vencimiento (Opcional):</label>
        <input type="date" name="fecha_vencimiento" value={formData.fecha_vencimiento || ''} onChange={handleChange} style={inputStyles} />
        
        <label>Descripción (Opcional):</label>
        <textarea name="descripcion" value={formData.descripcion || ''} onChange={handleChange} style={inputStyles}></textarea>

        <button type="submit" disabled={loading} style={{...buttonStyles, backgroundColor: '#ffc107'}}>
          {loading ? 'Actualizando...' : 'Actualizar Insumo'}
        </button>
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </form>
    </div>
  );
};

export default InventarioEditPage;