import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import movimientoService from '../services/movimiento.service';
import insumoService from '../services/insumo.service';
import usuarioService from '../services/usuario.service';

// (Estilos)
const filterStyles = { display: 'flex', flexWrap: 'wrap', gap: '15px', padding: '15px', backgroundColor: '#f4f4f4', borderRadius: '8px', marginBottom: '20px' };
const tableStyles = { /* ... (copiar de InventarioPage) ... */ };
const thStyles = { /* ... */ };
const tdStyles = { /* ... */ };

const HistorialPage = () => {
  const [historial, setHistorial] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Estados para los filtros
  const [filtros, setFiltros] = useState({
    fecha_inicio: '',
    fecha_fin: '',
    id_insumo: '',
    id_usuario: '',
    tipo_movimiento: ''
  });
  
  // Estados para los desplegables de filtros
  const [insumosList, setInsumosList] = useState([]);
  const [tecnicosList, setTecnicosList] = useState([]);

  // Cargar los desplegables (Insumos y Técnicos)
  useEffect(() => {
    const loadDropdowns = async () => {
      try {
        const [insumosData, tecnicosData] = await Promise.all([
          insumoService.getInsumos(),
          usuarioService.getUsuariosTecnicos()
        ]);
        setInsumosList(insumosData);
        setTecnicosList(tecnicosData);
      } catch (err) {
        setError('Error al cargar filtros');
      }
    };
    loadDropdowns();
    fetchHistorial(); // Cargar historial inicial
  }, []);

  // Función para buscar (JSON)
  const fetchHistorial = (e = null) => {
    if (e) e.preventDefault();
    setLoading(true);
    movimientoService.getHistorial(filtros)
      .then(data => setHistorial(data))
      .catch(err => setError('Error al cargar historial'))
      .finally(() => setLoading(false));
  };
  
  // Función para descargar (Excel)
  const handleExportar = (e) => {
    e.preventDefault();
    alert('Generando reporte Excel... esto puede tardar unos segundos.');
    movimientoService.getHistorialExcel(filtros)
      .catch(err => setError('Error al generar el Excel'));
  };

  const handleFilterChange = (e) => {
    setFiltros(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div style={{ padding: '20px' }}>
      <Link to="/dashboard">{"< Volver al Dashboard"}</Link>
      <h1 style={{ marginTop: '15px' }}>Historial de Movimientos</h1>
      
      {/* --- FILTROS --- */}
      <form style={filterStyles}>
        <div>
          <label>Desde:</label><br/>
          <input type="date" name="fecha_inicio" value={filtros.fecha_inicio} onChange={handleFilterChange} />
        </div>
        <div>
          <label>Hasta:</label><br/>
          <input type="date" name="fecha_fin" value={filtros.fecha_fin} onChange={handleFilterChange} />
        </div>
        <div>
          <label>Insumo:</label><br/>
          <select name="id_insumo" value={filtros.id_insumo} onChange={handleFilterChange}>
            <option value="">-- Todos --</option>
            {insumosList.map(i => <option key={i.PK_id_insumo} value={i.PK_id_insumo}>{i.nombre}</option>)}
          </select>
        </div>
        <div>
          <label>Técnico:</label><br/>
          <select name="id_usuario" value={filtros.id_usuario} onChange={handleFilterChange}>
            <option value="">-- Todos --</option>
            {tecnicosList.map(t => <option key={t.PK_id_usuario} value={t.PK_id_usuario}>{t.nombre}</option>)}
          </select>
        </div>
        <div>
          <label>Tipo:</label><br/>
          <select name="tipo_movimiento" value={filtros.tipo_movimiento} onChange={handleFilterChange}>
            <option value="">-- Todos --</option>
            <option value="Entrada">Entrada</option>
            <option value="Salida-Uso">Salida-Uso</option>
            <option value="Préstamo">Préstamo</option>
            <option value="Devolución">Devolución</option>
          </select>
        </div>
        <button onClick={fetchHistorial} style={{alignSelf: 'flex-end', padding: '8px 12px'}}>Buscar</button>
        <button onClick={handleExportar} style={{alignSelf: 'flex-end', padding: '8px 12px', backgroundColor: '#28a745', color: 'white'}}>Exportar Excel</button>
      </form>
      
      {error && <p style={{ color: 'red' }}>{error}</p>}
      
      {/* --- TABLA DE RESULTADOS --- */}
      <table style={tableStyles}>
        <thead>
          <tr>
            <th style={thStyles}>Fecha</th>
            <th style={thStyles}>Tipo</th>
            <th style={thStyles}>Insumo</th>
            <th style={thStyles}>Cant.</th>
            <th style={thStyles}>Usuario</th>
            <th style={thStyles}>OT</th>
            <th style={thStyles}>Documento</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr><td colSpan="7">Cargando...</td></tr>
          ) : historial.length > 0 ? (
            historial.map(mov => (
              <tr key={mov.PK_id_movimiento}>
                <td style={tdStyles}>{new Date(mov.fecha_hora).toLocaleString()}</td>
                <td style={tdStyles}>{mov.tipo_movimiento}</td>
                <td style={tdStyles}>{mov.nombre_insumo}</td>
                <td style={tdStyles}>{mov.cantidad}</td>
                <td style={tdStyles}>{mov.nombre_usuario}</td>
                <td style={tdStyles}>{mov.codigo_ot || 'N/A'}</td>
                <td style={tdStyles}>{mov.codigo_documento || 'N/A'}</td>
              </tr>
            ))
          ) : (
            <tr><td colSpan="7">No se encontraron movimientos con esos filtros.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default HistorialPage;