import { useState, useEffect, useMemo } from "react";
import api from "../api";

const styles = {
  container: {
    padding: "20px",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    color: "#333",
    maxWidth: "100%",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
    borderBottom: "1px solid #ccc",
    paddingBottom: "15px",
  },
  title: {
    margin: 0,
    fontSize: "1.5rem",
    color: "#333",
  },
  searchBar: {
    padding: "8px 12px",
    width: "300px",
    borderRadius: "4px",
    border: "1px solid #ccc",
    fontSize: "0.95rem",
    marginBottom: "15px",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    background: "#fff",
    border: "1px solid #ddd",
    fontSize: "0.9rem",
  },
  thead: {
    background: "#f2f2f2",
    borderBottom: "2px solid #ccc",
  },
  th: {
    textAlign: "left",
    padding: "10px 15px",
    fontWeight: "600",
    color: "#333333",
  },
  tr: {
    borderBottom: "1px solid #eee",
  },
  td: {
    padding: "10px 15px",
    verticalAlign: "middle",
  },
  btn: {
    padding: "6px 12px",
    borderRadius: "4px",
    border: "1px solid transparent",
    cursor: "pointer",
    fontSize: "0.9rem",
    marginLeft: "5px",
  },
  primaryBtn: { background: "#007bff", color: "white" },
  editBtn: { background: "#6c757d", color: "white" },
  deleteBtn: { background: "#dc3545", color: "white" },

  iconBtn: { padding: "8px", width:"35px", cursor: "pointer", border: "1px solid #ccc", borderRadius: "4px", background:"#f0f0f0", display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.1rem' },

  modalOverlay: {
    position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
    background: "rgba(0,0,0,0.5)",
    display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000,
  },
  modalContent: {
    background: "white", padding: "25px", borderRadius: "8px",
    width: "600px", maxWidth: "95%", maxHeight: "90vh", overflowY: "auto",
    boxShadow: "0 5px 15px rgba(0,0,0,0.3)",
  },
  formGroup: { marginBottom: "15px" },
  label: { display: "block", marginBottom: "5px", fontWeight: "bold", fontSize: "0.9rem" },
  input: {
    width: "100%", padding: "8px", borderRadius: "4px",
    border: "1px solid #ccc", fontSize: "1rem", boxSizing: "border-box",
  },
  select: {
    width: "100%", padding: "8px", borderRadius: "4px",
    border: "1px solid #ccc", fontSize: "1rem", boxSizing: "border-box", background: "white"
  },
  // Estilo para inputs deshabilitados
  disabledInput: {
    background: "#e9ecef",
    cursor: "not-allowed",
    color: "#6c757d"
  }
};

const TITLES = ["Dr.", "Prof."];
const STANDARD_LOCATIONS = ["Berlin", "Düsseldorf", "Munich"];

export default function LecturerOverview() {
  const [lecturers, setLecturers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [formMode, setFormMode] = useState("overview");
  const [editingId, setEditingId] = useState(null);

  const [customLocations, setCustomLocations] = useState([]);

  const [draft, setDraft] = useState({
    firstName: "", lastName: "", title: "Dr.", employmentType: "Full time",
    personalEmail: "", mdhEmail: "", phone: "", location: "", teachingLoad: "",
  });

  // 1. LEER ROL
  const [currentRole, setCurrentRole] = useState(() => {
    const raw = localStorage.getItem("userRole");
    return (raw || "").replace(/"/g, "").trim().toLowerCase();
  });

  // 2. ESCUCHAR CAMBIOS DE ROL
  useEffect(() => {
    const handleRoleUpdate = () => {
      const raw = localStorage.getItem("userRole");
      const cleanRole = (raw || "").replace(/"/g, "").trim().toLowerCase();
      setCurrentRole(cleanRole);
    };
    window.addEventListener("role-changed", handleRoleUpdate);
    window.addEventListener("storage", handleRoleUpdate);
    return () => {
      window.removeEventListener("role-changed", handleRoleUpdate);
      window.removeEventListener("storage", handleRoleUpdate);
    };
  }, []);

  // ✅ 3. DEFINIR PERMISOS
  const isLecturer = currentRole === "lecturer";
  const canCreate = !["student", "lecturer"].includes(currentRole);
  const canDelete = !["student", "lecturer"].includes(currentRole);
  const canEdit = currentRole !== "student";

  // ✅ Helper para saber si un campo debe estar bloqueado en el modal
  // Se bloquea si: Eres Lecturer Y estás en modo Edición.
  const isFieldDisabled = isLecturer && formMode === "edit";

  async function loadLecturers() {
    setLoading(true);
    try {
      const data = await api.getLecturers();
      const mapped = (Array.isArray(data) ? data : []).map((x) => ({
        id: x.id,
        firstName: x.first_name,
        lastName: x.last_name,
        title: x.title || "",
        employmentType: x.employment_type,
        personalEmail: x.personal_email || "",
        mdhEmail: x.mdh_email || "",
        phone: x.phone || "",
        location: x.location || "",
        teachingLoad: x.teaching_load || "",
        fullName: `${x.first_name} ${x.last_name || ""}`.trim(),
      }));
      setLecturers(mapped);
      const existingCustom = mapped
        .map(l => l.location)
        .filter(loc => loc && loc.trim() !== "" && !STANDARD_LOCATIONS.includes(loc));
      setCustomLocations([...new Set(existingCustom)].sort());
    } catch (e) {
      alert("Error loading lecturers: " + e.message);
      setLecturers([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadLecturers(); }, []);

  function openAdd() {
    setEditingId(null);
    setDraft({
      firstName: "", lastName: "", title: "Dr.", employmentType: "Full time",
      personalEmail: "", mdhEmail: "", phone: "", location: "", teachingLoad: "",
    });
    setFormMode("add");
  }

  function openEdit(row) {
    setEditingId(row.id);
    setDraft({
      firstName: row.firstName || "", lastName: row.lastName || "", title: row.title || "Dr.",
      employmentType: row.employmentType || "Full time", personalEmail: row.personalEmail || "",
      mdhEmail: row.mdhEmail || "", phone: row.phone || "", location: row.location || "",
      teachingLoad: row.teachingLoad || "",
    });
    setFormMode("edit");
  }

  function addNewLocation() {
      if (isFieldDisabled) return; // Bloquear acción si está deshabilitado
      const newLoc = prompt("Enter new location:");
      if (newLoc && newLoc.trim() !== "") {
          const formatted = newLoc.trim();
          if (!STANDARD_LOCATIONS.includes(formatted) && !customLocations.includes(formatted)) {
              setCustomLocations([...customLocations, formatted].sort());
          }
          setDraft({ ...draft, location: formatted });
      }
  }

  function deleteLocation() {
      if (isFieldDisabled) return; // Bloquear acción si está deshabilitado
      if (!draft.location) return;
      if (STANDARD_LOCATIONS.includes(draft.location)) return alert("Cannot delete standard locations.");
      if (window.confirm(`Remove "${draft.location}" from the list?`)) {
          setCustomLocations(customLocations.filter(t => t !== draft.location));
          setDraft({ ...draft, location: "" });
      }
  }

  async function remove(id) {
    if (!window.confirm("Are you sure you want to delete this lecturer?")) return;
    try {
      await api.deleteLecturer(id);
      await loadLecturers();
    } catch (e) { alert("Error deleting lecturer: " + e.message); }
  }

  async function save() {
    if (!draft.firstName.trim() || !draft.title.trim() || !draft.mdhEmail.trim()) {
      return alert("First Name, Title, and MDH Email are required.");
    }
    const payload = {
      first_name: draft.firstName.trim(), last_name: draft.lastName.trim() || null, title: draft.title.trim(),
      employment_type: draft.employmentType, personal_email: draft.personalEmail.trim() || null,
      mdh_email: draft.mdhEmail.trim(), phone: draft.phone.trim() || null,
      location: draft.location.trim() || null, teaching_load: draft.teachingLoad.trim() || null
    };

    try {
      if (formMode === "add") await api.createLecturer(payload);
      else await api.updateLecturer(editingId, payload);
      await loadLecturers();
      setFormMode("overview");
    } catch (e) {
      console.error(e);
      const msg = e.message || "Unknown error";
      if (msg.includes("422")) alert("Validation Error: The server rejected the changes. Lecturers may only edit phone/personal email.");
      else alert("Backend error while saving lecturer: " + msg);
    }
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return lecturers;
    return lecturers.filter((l) =>
      l.fullName.toLowerCase().includes(q) || l.location.toLowerCase().includes(q) || l.title.toLowerCase().includes(q)
    );
  }, [lecturers, query]);

  // Helper para aplicar estilos condicionales
  const getInputStyle = (disabled) => disabled ? { ...styles.input, ...styles.disabledInput } : styles.input;
  const getSelectStyle = (disabled) => disabled ? { ...styles.select, ...styles.disabledInput } : styles.select;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Lecturer Overview</h2>
        {canCreate && (
            <button style={{ ...styles.btn, ...styles.primaryBtn }} onClick={openAdd}>+ New Lecturer</button>
        )}
      </div>

      <input style={styles.searchBar} placeholder="Search by name, location, or title..." value={query} onChange={(e) => setQuery(e.target.value)} />

      {loading ? <p>Loading...</p> : (
        <table style={styles.table}>
          <thead style={styles.thead}>
            <tr>
              <th style={styles.th}>Title</th> <th style={styles.th}>Full Name</th> <th style={styles.th}>Type</th>
              <th style={styles.th}>Location</th> <th style={styles.th}>MDH Email</th> <th style={styles.th}>Teaching Load</th>
              {(canEdit || canDelete) && <th style={{ ...styles.th, textAlign: 'right' }}>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {filtered.map((l) => (
              <tr key={l.id} style={styles.tr}>
                <td style={styles.td}>{l.title}</td> <td style={styles.td}><strong>{l.fullName}</strong></td>
                <td style={styles.td}>{l.employmentType}</td> <td style={styles.td}>{l.location || "-"}</td>
                <td style={styles.td}>{l.mdhEmail || "-"}</td> <td style={styles.td}>{l.teachingLoad || "-"}</td>
                {(canEdit || canDelete) && (
                    <td style={{ ...styles.td, textAlign: 'right', whiteSpace: 'nowrap' }}>
                    {canEdit && <button style={{ ...styles.btn, ...styles.editBtn }} onClick={() => openEdit(l)}>Edit</button>}
                    {canDelete && <button style={{ ...styles.btn, ...styles.deleteBtn }} onClick={() => remove(l.id)}>Delete</button>}
                    </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* --- MODAL --- */}
      {(formMode === "add" || formMode === "edit") && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h3 style={{ margin: 0 }}>{formMode === "add" ? "Add Lecturer" : "Edit Lecturer"}</h3>
              <button onClick={() => setFormMode("overview")} style={{ border: 'none', background: 'transparent', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
            </div>

            {/* ✅ CAMPOS BLOQUEADOS SI isFieldDisabled ES TRUE */}
            <div style={styles.formGroup}>
              <label style={styles.label}>Title</label>
              <select style={getSelectStyle(isFieldDisabled)} value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} disabled={isFieldDisabled}>
                {TITLES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
              <div style={{ flex: 1 }}>
                <label style={styles.label}>First Name</label>
                <input style={getInputStyle(isFieldDisabled)} value={draft.firstName} onChange={(e) => setDraft({ ...draft, firstName: e.target.value })} disabled={isFieldDisabled} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={styles.label}>Last Name</label>
                <input style={getInputStyle(isFieldDisabled)} value={draft.lastName} onChange={(e) => setDraft({ ...draft, lastName: e.target.value })} disabled={isFieldDisabled} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
              <div style={{ flex: 1 }}>
                <label style={styles.label}>Location</label>
                <div style={{display:'flex', gap:'5px'}}>
                    <select style={{...getSelectStyle(isFieldDisabled), flex:1}} value={draft.location} onChange={(e) => setDraft({ ...draft, location: e.target.value })} disabled={isFieldDisabled}>
                        <option value="">-- Select Location --</option>
                        <optgroup label="Standard">{STANDARD_LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}</optgroup>
                        {customLocations.length > 0 && (<optgroup label="Custom">{customLocations.map(l => <option key={l} value={l}>{l}</option>)}</optgroup>)}
                    </select>
                    {/* Botones de location también se bloquean */}
                    <button type="button" onClick={addNewLocation} disabled={isFieldDisabled} style={{...styles.iconBtn, background: '#e2e6ea', opacity: isFieldDisabled ? 0.5 : 1, cursor: isFieldDisabled ? 'not-allowed' : 'pointer'}}>+</button>
                    <button type="button" onClick={deleteLocation} disabled={isFieldDisabled || !customLocations.includes(draft.location)} style={{...styles.iconBtn, background: (isFieldDisabled || !customLocations.includes(draft.location)) ? '#eee' : '#f8d7da', color: (isFieldDisabled || !customLocations.includes(draft.location)) ? '#aaa' : '#721c24', opacity: isFieldDisabled ? 0.5 : 1, cursor: (isFieldDisabled || !customLocations.includes(draft.location)) ? 'not-allowed' : 'pointer'}}>🗑</button>
                </div>
              </div>
              <div style={{ flex: 1 }}>
                <label style={styles.label}>Employment Type</label>
                <select style={getSelectStyle(isFieldDisabled)} value={draft.employmentType} onChange={(e) => setDraft({ ...draft, employmentType: e.target.value })} disabled={isFieldDisabled}>
                  <option value="Full time">Full time</option> <option value="Part time">Part time</option> <option value="Freelancer">Freelancer</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
                <div style={{ flex: 1 }}>
                    <label style={styles.label}>MDH Email</label>
                    <input style={getInputStyle(isFieldDisabled)} value={draft.mdhEmail} onChange={(e) => setDraft({ ...draft, mdhEmail: e.target.value })} disabled={isFieldDisabled} />
                </div>

                {/* ✅ PERSONAL EMAIL: SIEMPRE HABILITADO */}
                <div style={{ flex: 1 }}>
                    <label style={styles.label}>Personal Email (Optional)</label>
                    <input style={styles.input} value={draft.personalEmail} onChange={(e) => setDraft({ ...draft, personalEmail: e.target.value })} placeholder="e.g., anna@gmail.com" />
                </div>
            </div>

            {/* ✅ PHONE NUMBER: SIEMPRE HABILITADO */}
            <div style={styles.formGroup}>
              <label style={styles.label}>Phone Number (Optional)</label>
              <input style={styles.input} value={draft.phone} onChange={(e) => setDraft({ ...draft, phone: e.target.value })} placeholder="e.g., +49 123 45678" />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Teaching Load</label>
              <input style={getInputStyle(isFieldDisabled)} value={draft.teachingLoad} onChange={(e) => setDraft({ ...draft, teachingLoad: e.target.value })} disabled={isFieldDisabled} />
            </div>

            <div style={{ marginTop: '25px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button style={{ ...styles.btn, background: '#f8f9fa', border: '1px solid #ddd' }} onClick={() => setFormMode("overview")}>Cancel</button>
              <button style={{ ...styles.btn, ...styles.primaryBtn }} onClick={save}>
                {formMode === "add" ? "Create" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}