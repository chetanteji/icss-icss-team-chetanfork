import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL; 
const API_URL = API_BASE_URL;

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });
  return res.json();
}

const api = {
  // --- Study Programs ---
  getPrograms: async () => {
    const response = await axios.get(`${API_URL}/study-programs/`);
    return response.data;
  },
  createProgram: async (data) => {
    const response = await axios.post(`${API_URL}/study-programs/`, data);
    return response.data;
  },
  updateProgram: async (id, data) => {
    const response = await axios.put(`${API_URL}/study-programs/${id}`, data);
    return response.data;
  },
  deleteProgram: async (id) => {
    const response = await axios.delete(`${API_URL}/study-programs/${id}`);
    return response.data;
  },

  // --- SPECIALIZATIONS ---
  createSpecialization: async (data) => {
    const response = await axios.post(`${API_URL}/specializations/`, data);
    return response.data;
  },
  updateSpecialization: async (id, data) => {
    const response = await axios.put(`${API_URL}/specializations/${id}`, data);
    return response.data;
  },
  deleteSpecialization: async (id) => {
    const response = await axios.delete(`${API_URL}/specializations/${id}`);
    return response.data;
  },

  // --- ROOMS ---
  getRooms: async () => {
    const response = await axios.get(`${API_URL}/rooms/`);
    return response.data;
  },
  createRoom: async (data) => {
    const response = await axios.post(`${API_URL}/rooms/`, data);
    return response.data;
  },
  updateRoom: async (id, data) => {
    const response = await axios.put(`${API_URL}/rooms/${id}`, data);
    return response.data;
  },
  deleteRoom: async (id) => {
    const response = await axios.delete(`${API_URL}/rooms/${id}`);
    return response.data;
  },

  // --- Lecturers ---
  getLecturers: async () => {
    const response = await axios.get(`${API_URL}/lecturers/`);
    return response.data;
  },
  createLecturer: async (data) => {
    const response = await axios.post(`${API_URL}/lecturers/`, data);
    return response.data;
  },
  updateLecturer: async (id, data) => {
    const response = await axios.put(`${API_URL}/lecturers/${id}`, data);
    return response.data;
  },
  deleteLecturer: async (id) => {
    const response = await axios.delete(`${API_URL}/lecturers/${id}`);
    return response.data;
  },

  // --- Groups ---
  getGroups: async () => {
    const response = await axios.get(`${API_URL}/groups/`);
    return response.data;
  },
  createGroup: async (data) => {
    const response = await axios.post(`${API_URL}/groups/`, data);
    return response.data;
  },
  updateGroup: async (id, data) => {
    const response = await axios.put(`${API_URL}/groups/${id}`, data);
    return response.data;
  },
  deleteGroup: async (id) => {
    const response = await axios.delete(`${API_URL}/groups/${id}`);
    return response.data;
  },

  // --- Modules ---
  getModules: async () => {
    const response = await axios.get(`${API_URL}/modules/`);
    return response.data;
  },
  createModule: async (data) => {
    const response = await axios.post(`${API_URL}/modules/`, data);
    return response.data;
  },
  updateModule: async (id, data) => {
    const response = await axios.put(`${API_URL}/modules/${id}`, data);
    return response.data;
  },
  deleteModule: async (id) => {
    const response = await axios.delete(`${API_URL}/modules/${id}`);
    return response.data;
  },

  // --- CONSTRAINTS (NEW) ---
  getConstraintTypes: async () => {
    const response = await axios.get(`${API_URL}/constraint-types/`);
    return response.data;
  },
  getConstraints: async () => {
    const response = await axios.get(`${API_URL}/scheduler-constraints/`);
    return response.data;
  },
  createConstraint: async (data) => {
    const response = await axios.post(`${API_URL}/scheduler-constraints/`, data);
    return response.data;
  },
  updateConstraint: async (id, data) => {
    const response = await axios.put(`${API_URL}/scheduler-constraints/${id}`, data);
    return response.data;
  },
  deleteConstraint: async (id) => {
    const response = await axios.delete(`${API_URL}/scheduler-constraints/${id}`);
    return response.data;
  },
  // --- AVAILABILITIES ---
  getAvailabilities: async () => {
    const response = await axios.get(`${API_URL}/availabilities/`);
    return response.data;
  },
  createAvailability: async (data) => {
    const response = await axios.post(`${API_URL}/availabilities/`, data);
    return response.data;
  },
  updateAvailability: async (id, data) => {
    const response = await axios.put(`${API_URL}/availabilities/${id}`, data);
    return response.data;
  },
  deleteAvailability: async (id) => {
    const response = await axios.delete(`${API_URL}/availabilities/${id}`);
    return response.data;
  },
};

export default api;