
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import usuarioService from '../services/usuario.service';

// --- Estilos ---
const tableStyles = {
  width: '100%',
  marginTop: '20px',
  borderCollapse: 'collapse'
};
const thStyles = {
  border: '1px solid #ddd',
  padding: '8px',
  backgroundColor: '#f2f2f2'
};
const tdStyles = {
  border: '1px solid #ddd',
  padding: '8px'
};
const buttonStyles = { 
  padding: '5px 10px', 
  fontSize: '14px', 
  cursor: 'pointer',
  border: 'none',
  borderRadius: '4px',
  marginRight: '5px'
};
// --- Fin Estilos ---

const UsuarioListPage = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    usuarioService.getAllUsuarios()
      .then(data => setUsuarios(data))
      .catch(err => setError('Error al cargar usuarios'))
      .finally(() => setLoading(false));
  }, []);
  
  if (loading) return <div>Cargando usuarios...</div>;
  if (error) return <div style={{ color: 'red' }}>Error: {error}</div>;

  return (
    <div style={{ padding: '20px' }}>
      <Link to="/dashboard"style={{...buttonStyles, backgroundColor: '#7a9ee0ff', color: 'black', textDecoration: 'none'}}>{"Volver"}</Link>
      <h1 style={{ marginTop: '15px' }}>Gestión de Usuarios</h1>

      <Link to="/usuarios/nuevo" style={{
          padding: '10px 15px',
          backgroundColor: '#007bff',
          color: 'white',
          textDecoration: 'none',
          borderRadius: '5px'
        }}>
        Crear Nuevo Usuario
      </Link>
      
      <table style={tableStyles}>
        <thead>
          <tr>
            <th style={thStyles}>Nombre</th>
            <th style={thStyles}>RUT</th>
            <th style={thStyles}>Rol</th>
            <th style={thStyles}>Estado</th>
            <th style={thStyles}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {usuarios.map(user => (
            <tr key={user.PK_id_usuario}>
              <td style={tdStyles}>{user.nombre}</td>
              <td style={tdStyles}>{user.rut}</td>
              <td style={tdStyles}>{user.nombre_rol}</td>
              <td style={tdStyles}>
                {user.activo ? 'Activo' : 'Deshabilitado'}
              </td>
              <td style={tdStyles}>
                <Link to={`/usuarios/editar/${user.PK_id_usuario}`} style={{...buttonStyles, backgroundColor: '#dc3545', color: 'black', textDecoration: 'none'}}>
                  Editar
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UsuarioListPage;