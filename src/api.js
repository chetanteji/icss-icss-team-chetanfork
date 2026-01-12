const BASE_URL = "http://127.0.0.1:8000";

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`${res.status} ${res.statusText} - ${txt}`);
  }

  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

const api = {
  // ---------- PROGRAMS ----------
  getPrograms() {
    return request("/study-programs/");
  },
  createProgram(payload) {
    return request("/study-programs/", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  updateProgram(id, payload) {
    return request(`/study-programs/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },
  deleteProgram(id) {
    return request(`/study-programs/${id}`, { method: "DELETE" });
  },

  // ---------- MODULES ----------
  getModules() {
    return request("/modules/");
  },
  createModule(payload) {
    return request("/modules/", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  updateModule(id, payload) {
    return request(`/modules/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },
  deleteModule(id) {
    return request(`/modules/${id}`, { method: "DELETE" });
  },

  // ---------- LECTURERS ----------
  getLecturers() {
    return request("/lecturers/");
  },
  createLecturer(payload) {
    return request("/lecturers/", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  updateLecturer(id, payload) {
    return request(`/lecturers/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },
  deleteLecturer(id) {
    return request(`/lecturers/${id}`, { method: "DELETE" });
  },

  // ---------- GROUPS ----------
  getGroups() {
    return request("/groups/");
  },
  createGroup(payload) {
    return request("/groups/", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  updateGroup(id, payload) {
    return request(`/groups/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },
  deleteGroup(id) {
    return request(`/groups/${id}`, { method: "DELETE" });
  },
};

export default api;
