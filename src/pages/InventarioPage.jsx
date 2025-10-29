// frontend/src/pages/InventarioPage.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import insumoService from '../services/insumo.service';
import SalidaModal from '../components/SalidaModal'; 
import ScannerModal from '../components/ScannerModal';

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


const InventarioPage = () => {
  const [insumos, setInsumos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [usuarioRol, setUsuarioRol] = useState(null);

  // --- ESTADO PARA EL FILTRO DE ACTIVOS ---
  const [filtroActivo, setFiltroActivo] = useState(true);

  // --- ESTADO PARA EL MODAL ---
  const [modalOpen, setModalOpen] = useState(false);
  const [salidaModalOpen, setSalidaModalOpen] = useState(false);
  const [scannerModalOpen, setScannerModalOpen] = useState(false);
  const [selectedInsumo, setSelectedInsumo] = useState(null); // Qué insumo estamos manejando

  const handleOpenSalidaModal = (insumo) => {
    setSelectedInsumo(insumo);
    setSalidaModalOpen(true);
  };

  const handleCloseSalidaModal = () => {
    setSalidaModalOpen(false);
    setSelectedInsumo(null);
  };

  // --- MODIFICAR useEffect ---
  useEffect(() => {
    // 1. Mover la carga a una función
    const fetchInsumos = async () => {
      try {
        setLoading(true);
        // 2. Pasar el filtro al servicio
        const data = await insumoService.getInsumos(filtroActivo);
        setInsumos(data); 
      } catch (err) {
        setError(err.message || 'Error al cargar el inventario');
      } finally {
        setLoading(false);
      }
    };
    
    fetchInsumos(); // Cargar al inicio
    
    // Obtener rol de usuario
    const usuarioInfo = JSON.parse(localStorage.getItem('usuario'));
    if (usuarioInfo) {
      setUsuarioRol(usuarioInfo.usuario.rol);
    }
  }, [filtroActivo]); // Agregar filtroActivo como dependencia

// --- NUEVA FUNCIÓN PARA EL BOTÓN  ---
  const handleToggleActivo = async (insumo) => {
    const nuevoEstado = !insumo.activo;
    const confirmMsg = `¿Está seguro que desea ${nuevoEstado ? 'habilitar' : 'deshabilitar'} el insumo "${insumo.nombre}"?`;
    
    if (window.confirm(confirmMsg)) {
      try {
        await insumoService.toggleActivo(insumo.PK_id_insumo, nuevoEstado);
        // Actualizar el estado localmente para reflejar el cambio
        setInsumos(prevInsumos => 
          prevInsumos.map(i => 
            i.PK_id_insumo === insumo.PK_id_insumo ? { ...i, activo: nuevoEstado } : i
          )
        );
        alert(`Insumo ${nuevoEstado ? 'habilitado' : 'deshabilitado'}.`);
      } catch (err) {
        setError(err.message || 'Error al cambiar el estado');
      }
    }
  };
  //NUEVAS FUNCIONES PARA EL ESCÁNER ---
  const handleOpenScanner = () => {
    setScannerModalOpen(true);
  };

  const handleCloseScanner = () => {
    setScannerModalOpen(false);
  };

  const handleScanSuccess = async (sku) => {
    setScannerModalOpen(false); // Cerramos el escáner
    setLoading(true); // Ponemos la UI en modo "cargando"
    
    try {
      const insumoEncontrado = await insumoService.getInsumoBySku(sku);
      
      if (insumoEncontrado) {
        // ¡Éxito! Insumo encontrado
        // Abrimos el modal de Salida para este insumo
        handleOpenSalidaModal(insumoEncontrado);
      } else {
        // Error: El SKU se leyó, pero no existe en la BBDD
        setError(`SKU "${sku}" no encontrado en la base de datos.`);
      }
    } catch (err) {
      setError(err.message || 'Error al buscar el SKU');
    } finally {
      setLoading(false);
    }
  };
  // --- FUNCIONES PARA MANEJAR EL MODAL ---
  const handleOpenModal = (insumo) => {
    setSelectedInsumo(insumo);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedInsumo(null);
  };

  const handleSalidaSuccess = (insumoId, nuevoStock) => {
    // Actualizamos el stock en la lista localmente (mejor UX que recargar todo)
    setInsumos(prevInsumos => 
      prevInsumos.map(insumo => 
        insumo.PK_id_insumo === insumoId 
          ? { ...insumo, stock_actual: nuevoStock } 
          : insumo
      )
    );
  };
  
  if (loading) return <div>Cargando inventario...</div>;
  if (error) return <div style={{ color: 'red' }}>Error: {error}</div>;
  

  return (
    <div style={{ padding: '20px' }}>
      <Link to="/dashboard"style={{...buttonStyles, backgroundColor: '#7a9ee0ff', color: 'black', textDecoration: 'none'}}>{"Volver"}</Link>
      <h1 style={{ marginTop: '15px' }}>Gestión de Inventario</h1>
      
      {usuarioRol === 1 && ( // Si el ROL es 1 (Admin)
        <Link to="/inventario/nuevo" style={{
          padding: '10px 15px',
          backgroundColor: '#007bff',
          color: 'white',
          textDecoration: 'none',
          borderRadius: '5px'
        }}>
          Registrar Nuevo Insumo
        </Link>        
      )}
      <button 
          onClick={handleOpenScanner}
          style={{ padding: '10px 15px', backgroundColor: '#17a2b8', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
        >
          📷 Escanear Salida (Móvil)
        </button>
      <div style={{ margin: '20px 0' }}>
        <button 
          onClick={() => setFiltroActivo(true)} 
          // ... (estilos del botón "Ver Activos") ...
        >
          Ver Activos
        </button>
        <button 
          onClick={() => setFiltroActivo(false)} 
          // ... (estilos del botón "Ver Deshabilitados") ...
        >
          Ver Deshabilitados
        </button>
      </div>
      
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <table style={tableStyles}>
        <thead>
          <tr>
            <th style={thStyles}>SKU</th>
            <th style={thStyles}>Nombre</th>
            <th style={thStyles}>Categoría</th>
            <th style={thStyles}>Stock Actual</th>
            <th style={thStyles}>Stock Mínimo</th>
            <th style={thStyles}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {insumos.length > 0 ? (
            insumos.map((insumo) => (
              <tr key={insumo.PK_id_insumo}>
                <td style={tdStyles}>{insumo.sku}</td>
                <td style={tdStyles}>{insumo.nombre}</td>
                <td style={tdStyles}>{insumo.nombre_categoria}</td>
                <td style={tdStyles}>{insumo.stock_actual}</td>
                <td style={tdStyles}>{insumo.stock_minimo}</td>
                
                <td style={tdStyles}>
                  {usuarioRol === 1 && (
                    <>
                      <Link to={`/inventario/editar/${insumo.PK_id_insumo}`} style={{...buttonStyles, backgroundColor: '#ffc107'}}>
                        Editar
                      </Link>
                      {/* --- NUEVO BOTÓN  --- */}
                      <button 
                        style={{...buttonStyles, backgroundColor: insumo.activo ? '#dc3545' : '#28a745', color: 'white'}}
                        onClick={() => handleToggleActivo(insumo)}
                      >
                        {insumo.activo ? 'Deshabilitar' : 'Habilitar'}
                      </button>
                    </>
                  )}
                  {/* El botón de Salida solo debe aparecer si el insumo está ACTIVO */}
                  {insumo.activo && (
                    <button 
                      style={{...buttonStyles, backgroundColor: '#17a2b8', color: 'white'}}
                      onClick={() => handleOpenModal(insumo)}
                      disabled={insumo.stock_actual === 0}
                    >
                      Registrar Salida
                    </button>
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" style={tdStyles}>No hay insumos para mostrar.</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* --- 5. RENDERIZAR EL MODAL (si está abierto) --- */}
      {modalOpen && (
        <SalidaModal 
          insumo={selectedInsumo}
          onClose={handleCloseModal}
          onSuccess={handleSalidaSuccess}
        />
      )}
      {scannerModalOpen && (
        <ScannerModal 
          onClose={handleCloseScanner}
          onScanSuccess={handleScanSuccess}
        />
      )}
    </div>
  );
}; 


export default InventarioPage;