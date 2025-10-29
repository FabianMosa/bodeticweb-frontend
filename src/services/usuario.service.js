
import api from './api';

const getUsuariosTecnicos = async () => {
  try {
    const response = await api.get('/usuarios/tecnicos');
    return response.data;
  } catch (error) {
    console.error('Error en el servicio de obtener técnicos:', error.response.data);
    throw error.response.data;
  }
};

// --- AÑADIR LAS NUEVAS FUNCIONES CRUD ---

const getAllUsuarios = async () => {
  try {
    const response = await api.get('/usuarios');
    return response.data;
  } catch (error) {
    console.error('Error en el servicio de obtener usuarios:', error.response.data);
    throw error.response.data;
  }
};

const getUsuarioById = async (id) => {
  try {
    const response = await api.get(`/usuarios/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error en el servicio de obtener usuario por ID:', error.response.data);
    throw error.response.data;
  }
};

const createUsuario = async (usuarioData) => {
  try {
    // usuarioData = { nombre, rut, password, id_rol }
    const response = await api.post('/usuarios', usuarioData);
    return response.data;
  } catch (error) {
    console.error('Error en el servicio de crear usuario:', error.response.data);
    throw error.response.data;
  }
};

const updateUsuario = async (id, usuarioData) => {
  try {
    // usuarioData = { nombre, rut, id_rol, activo }
    const response = await api.put(`/usuarios/${id}`, usuarioData);
    return response.data;
  } catch (error) {
    console.error('Error en el servicio de actualizar usuario:', error.response.data);
    throw error.response.data;
  }
};

export default {
  getUsuariosTecnicos,
  getAllUsuarios,
  getUsuarioById,
  createUsuario,
  updateUsuario,
};