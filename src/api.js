import axios from "axios";

// Make sure this points to your Python backend port (8000)
const API_URL = "http://localhost:8000";

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
};

export default api;