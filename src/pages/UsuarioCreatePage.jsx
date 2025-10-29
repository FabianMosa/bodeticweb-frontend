import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import usuarioService from '../services/usuario.service';
import rolService from '../services/rol.services';

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
const buttonStyles = { 
  padding: '10px', 
  fontSize: '16px', 
  backgroundColor: '#28a745', 
  color: 'white', 
  border: 'none', 
  cursor: 'pointer' 
};

const UsuarioCreatePage = () => {
  const navigate = useNavigate();
  
  // Estado para el formulario
  const [formData, setFormData] = useState({
    nombre: '',
    rut: '',
    password: '',
    id_rol: '' // Empezar vacío
  });
  
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false); // Para cargar roles
  const [submitting, setSubmitting] = useState(false); // Para enviar formulario
  const [error, setError] = useState('');

  // 1. Cargar los roles para el desplegable
  useEffect(() => {
    setLoading(true);
    rolService.getRoles()
      .then(data => {
        setRoles(data);
        // Si hay roles, seleccionar el primero por defecto (ej. 'Técnico')
        if (data.length > 0) {
          // Asumiendo que el rol 'Técnico' es el más común (ej. ID 2)
          const defaultRole = data.find(r => r.nombre_rol === 'Técnico') || data[0];
          setFormData(prev => ({ ...prev, id_rol: defaultRole.PK_id_rol }));
        }
      })
      .catch(err => setError('Error al cargar roles'))
      .finally(() => setLoading(false));
  }, []); // El array vacío [] significa "ejecutar solo al montar"

  // 2. Manejar cambios en el formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // 3. Manejar el envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    
    // Validación extra
    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      setSubmitting(false);
      return;
    }

    try {
      // Llamamos al servicio de creación
      await usuarioService.createUsuario(formData);
      alert('Usuario creado con éxito');
      navigate('/usuarios'); // Redirige a la lista de usuarios
    } catch (err) {
      // El backend nos dirá si el RUT ya existe
      setError(err.message || 'Error al crear el usuario');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div>Cargando roles...</div>;

  return (
    <div style={{ padding: '20px' }}>
      <Link to="/usuarios"style={{...buttonStyles, backgroundColor: '#7a9ee0ff', color: 'black', textDecoration: 'none'}}>{"Volver a menú de usuario"}</Link>
      <form onSubmit={handleSubmit} style={formStyles}>
        <h2>Crear Nuevo Usuario</h2>
        
        <label>Nombre Completo:</label>
        <input 
          type="text" 
          name="nombre" 
          value={formData.nombre}
          onChange={handleChange} 
          style={inputStyles} 
          required 
        />
        
        <label>RUT (para login):</label>
        <input 
          type="text" 
          name="rut" 
          value={formData.rut}
          onChange={handleChange} 
          style={inputStyles} 
          required 
        />

        <label>Contraseña Temporal:</label>
        <input 
          type="password" 
          name="password" 
          value={formData.password}
          onChange={handleChange} 
          style={inputStyles} 
          required 
          minLength="6"
        />
        
        <label>Rol:</label>
        <select 
          name="id_rol" 
          value={formData.id_rol} 
          onChange={handleChange} 
          style={inputStyles} 
          required
        >
          <option value="" disabled>-- Seleccione un rol --</option>
          {roles.map(rol => (
            <option key={rol.PK_id_rol} value={rol.PK_id_rol}>
              {rol.nombre_rol}
            </option>
          ))}
        </select>

        <button type="submit" disabled={submitting} style={buttonStyles}>
          {submitting ? 'Guardando...' : 'Crear Usuario'}
        </button>
        {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
      </form>
    </div>
  );
};

export default UsuarioCreatePage;