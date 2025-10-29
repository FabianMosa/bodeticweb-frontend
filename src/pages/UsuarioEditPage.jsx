
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import usuarioService from '../services/usuario.service';
import rolService from '../services/rol.services';

// --- Estilos ---
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
// --- Fin Estilos ---

const UsuarioEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState(null);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
        setError('Error al cargar datos');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id]);

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
    setError('');
    
    // Preparamos los datos (sin password)
    const dataToUpdate = {
      nombre: formData.nombre,
      rut: formData.rut,
      id_rol: formData.FK_id_rol,
      activo: formData.activo
    };

    try {
      await usuarioService.updateUsuario(id, dataToUpdate);
      alert('Usuario actualizado con éxito');
      navigate('/usuarios');
    } catch (err) {
      setError(err.message || 'Error al actualizar');
    } finally {
      setLoading(false);
    }
  };

  if (loading || !formData) return <div>Cargando...</div>;

  return (
    <div style={{ padding: '20px' }}>
      <Link to="/usuarios" style={{...buttonStyles, backgroundColor: '#7a9ee0ff', color: 'black', textDecoration: 'none'}}>{"Volver a menú de usuario"}</Link>
      <form onSubmit={handleSubmit} style={formStyles}>
        <h2>Editar Usuario</h2>
        
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

        <button type="submit" disabled={loading} style={buttonStyles}>
          {loading ? 'Actualizando...' : 'Actualizar Usuario'}
        </button>
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </form>
    </div>
  );
};

export default UsuarioEditPage;