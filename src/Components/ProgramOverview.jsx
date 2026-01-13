import { useEffect, useMemo, useState } from "react";
import api from "../api";

// --- REFINED STYLES ---
const styles = {
  container: {
    padding: "20px",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    color: "#333",
    maxWidth: "100%", // Use full width
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
    color: "#ffffff",
  },
  tr: {
    borderBottom: "1px solid #eee",
  },
  td: {
    padding: "10px 15px",
    verticalAlign: "middle",
  },
  // --- STATUS BADGES (High Contrast) ---
  statusBadge: (isActive) => ({
    display: "inline-block",
    padding: "4px 8px",
    borderRadius: "4px",
    fontSize: "0.8rem",
    fontWeight: "bold",
    backgroundColor: isActive ? "#d4edda" : "#f8d7da", // Light Green / Light Red
    color: isActive ? "#155724" : "#721c24",           // Dark Green / Dark Red
    border: isActive ? "1px solid #c3e6cb" : "1px solid #f5c6cb",
    textAlign: "center",
    minWidth: "60px",
  }),
  // --- SPEC CHIPS (High Contrast) ---
  specChip: (isActive) => ({
    display: "inline-block",
    padding: "3px 8px",
    borderRadius: "4px",
    margin: "2px",
    fontSize: "0.8rem",
    backgroundColor: isActive ? "#e2e6ea" : "#ff5858", // Grey / Yellow-ish for inactive
    color: isActive ? "#333" : "#856404",
    border: "1px solid",
    borderColor: isActive ? "#dae0e5" : "#ffeeba",
  }),
  // --- BUTTONS (Text Buttons) ---
  btn: {
    padding: "6px 12px",
    borderRadius: "4px",
    border: "1px solid transparent",
    cursor: "pointer",
    fontSize: "0.9rem",
    marginLeft: "5px",
  },
  primaryBtn: {
    background: "#007bff",
    color: "white",
  },
  editBtn: {
    background: "#6c757d", // Grey for Edit
    color: "white",
  },
  deleteBtn: {
    background: "#dc3545", // Red for Delete
    color: "white",
  },
  // --- MODAL ---
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0,0,0,0.5)", // Darker overlay
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  modalContent: {
    background: "white",
    padding: "25px",
    borderRadius: "8px",
    width: "600px",
    maxWidth: "95%",
    maxHeight: "90vh",
    overflowY: "auto",
    boxShadow: "0 5px 15px rgba(0,0,0,0.3)",
  },
  formGroup: {
    marginBottom: "15px",
  },
  label: {
    display: "block",
    marginBottom: "5px",
    fontWeight: "bold",
    fontSize: "0.9rem",
  },
  input: {
    width: "100%",
    padding: "8px",
    borderRadius: "4px",
    border: "1px solid #ccc",
    fontSize: "1rem",
    boxSizing: "border-box", // Fixes padding issues
  },
  checkboxWrapper: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    cursor: "pointer",
    fontSize: "0.95rem",
  },
  specSection: {
    background: "#f9f9f9",
    padding: "15px",
    borderRadius: "6px",
    border: "1px solid #ddd",
    marginTop: "15px"
  },
  specRow: {
    display: "flex",
    gap: "10px",
    marginBottom: "10px",
    alignItems: "center",
  }
};

const formatDateDE = (isoDate) => {
  if (!isoDate) return "-";
  return new Date(isoDate).toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

export default function ProgramsOverview() {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [formMode, setFormMode] = useState("overview");
  const [editingId, setEditingId] = useState(null);

  const [draft, setDraft] = useState({
    name: "",
    acronym: "",
    headOfProgram: "",
    isActive: true,
    startDate: "",
    totalEcts: 180,
    specializations: [],
  });

  async function loadPrograms() {
    setLoading(true);
    try {
      const data = await api.getPrograms();
      setPrograms(Array.isArray(data) ? data : []);
    } catch (e) {
      alert("Error loading programs: " + e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPrograms();
  }, []);

  function openAdd() {
    setEditingId(null);
    setDraft({
      name: "",
      acronym: "",
      headOfProgram: "",
      isActive: true,
      startDate: "",
      totalEcts: 180,
      specializations: [],
    });
    setFormMode("add");
  }

  function openEdit(p) {
    setEditingId(p.id);
    setDraft({
      name: p.name || "",
      acronym: p.acronym || "",
      headOfProgram: p.head_of_program || "",
      isActive: !!p.is_active,
      startDate: p.start_date || "",
      totalEcts: p.total_ects ?? 180,
      specializations: p.specializations ? JSON.parse(JSON.stringify(p.specializations)) : [],
    });
    setFormMode("edit");
  }

  // --- Handlers ---
  function addDraftSpec() {
    setDraft((prev) => ({
      ...prev,
      specializations: [
        ...prev.specializations,
        { name: "", acronym: "", is_active: true, is_new: true },
      ],
    }));
  }

  async function deleteSpec(index) {
    const spec = draft.specializations[index];
    if (!spec.is_new && spec.id) {
        if(!window.confirm("Are you sure you want to delete this specialization?")) return;
        try { await api.deleteSpecialization(spec.id); }
        catch(e) { return alert("Failed to delete."); }
    }
    setDraft((prev) => {
      const newSpecs = [...prev.specializations];
      newSpecs.splice(index, 1);
      return { ...prev, specializations: newSpecs };
    });
  }

  function updateDraftSpec(index, field, value) {
    setDraft((prev) => {
      const newSpecs = [...prev.specializations];
      newSpecs[index] = { ...newSpecs[index], [field]: value };
      return { ...prev, specializations: newSpecs };
    });
  }

  async function save() {
    if (!draft.name.trim() || !draft.acronym.trim() || !draft.startDate) {
        return alert("Name, Acronym, and Start Date are required.");
    }

    const programPayload = {
      name: draft.name.trim(),
      acronym: draft.acronym.trim(),
      head_of_program: draft.headOfProgram.trim(),
      is_active: Boolean(draft.isActive),
      start_date: draft.startDate,
      total_ects: Number(draft.totalEcts),
    };

    try {
      let programId = editingId;
      if (formMode === "add") {
        const newProgram = await api.createProgram(programPayload);
        programId = newProgram.id;
      } else {
        await api.updateProgram(editingId, programPayload);
      }

      for (const spec of draft.specializations) {
        if(!spec.name || !spec.acronym) continue;
        const specPayload = {
            name: spec.name,
            acronym: spec.acronym,
            start_date: draft.startDate,
            is_active: Boolean(spec.is_active),
            program_id: programId
        };
        if (spec.is_new) await api.createSpecialization(specPayload);
        else await api.updateSpecialization(spec.id, specPayload);
      }

      await loadPrograms();
      setFormMode("overview");
    } catch (e) {
      console.error(e);
      alert("Error saving: " + e.message);
    }
  }

  async function removeProgram(id) {
    if (!window.confirm("Delete this program?")) return;
    try { await api.deleteProgram(id); loadPrograms(); }
    catch (e) { alert("Could not delete program."); }
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return programs;
    return programs.filter((p) =>
      p.name.toLowerCase().includes(q) || p.acronym.toLowerCase().includes(q)
    );
  }, [programs, query]);

  // --- RENDER ---
  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Study Programs</h2>
        <button style={{...styles.btn, ...styles.primaryBtn}} onClick={openAdd}>
          + New Program
        </button>
      </div>

      <input
        style={styles.searchBar}
        placeholder="Search programs..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      {loading ? <p>Loading...</p> : (
        <table style={styles.table}>
          <thead style={styles.thead}>
            <tr>
              <th style={styles.th}>Start Date</th>
              <th style={styles.th}>Name</th>
              <th style={styles.th}>Specializations</th>
              <th style={styles.th}>Head of Study Program</th>
              <th style={{...styles.th, textAlign:'center'}}>Status</th>
              <th style={{...styles.th, textAlign:'right'}}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id} style={styles.tr}>
                <td style={styles.td}>{formatDateDE(p.start_date)}</td>
                <td style={styles.td}>
                  <strong>{p.name}</strong> <br/>
                  <span style={{fontSize:'0.85rem', color:'#666'}}>{p.acronym} • {p.total_ects} ECTS</span>
                </td>
                <td style={styles.td}>
                    {p.specializations?.length > 0 ? (
                        <div>
                            {p.specializations.map(s => (
                                <span key={s.id} style={styles.specChip(s.is_active)}>
                                    {s.name} ({s.acronym})
                                </span>
                            ))}
                        </div>
                    ) : <span style={{color:'#999'}}>-</span>}
                </td>
                <td style={styles.td}>{p.head_of_program}</td>
                <td style={{...styles.td, textAlign:'center'}}>
                  <span style={styles.statusBadge(p.is_active)}>
                      {p.is_active ? 'ACTIVE' : 'INACTIVE'}
                  </span>
                </td>
                <td style={{...styles.td, textAlign:'right', whiteSpace: 'nowrap'}}>
                  <button style={{...styles.btn, ...styles.editBtn}} onClick={() => openEdit(p)}>
                      Edit
                  </button>
                  <button style={{...styles.btn, ...styles.deleteBtn}} onClick={() => removeProgram(p.id)}>
                      Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* --- MODAL --- */}
      {(formMode === "add" || formMode === "edit") && (
        <div style={styles.modalOverlay}>
            <div style={styles.modalContent}>
                <div style={{display:'flex', justifyContent:'space-between', marginBottom:'20px'}}>
                    <h3 style={{margin:0}}>{formMode === "add" ? "Create Program" : "Edit Program"}</h3>
                    <button onClick={() => setFormMode("overview")} style={{border:'none', background:'transparent', fontSize:'1.5rem', cursor:'pointer'}}>×</button>
                </div>

                <div style={styles.formGroup}>
                    <label style={styles.label}>Official Name</label>
                    <input style={styles.input} value={draft.name} onChange={e => setDraft({...draft, name: e.target.value})} />
                </div>

                <div style={{display:'flex', gap:'15px', marginBottom:'15px'}}>
                    <div style={{flex:1}}>
                        <label style={styles.label}>Acronym</label>
                        <input style={styles.input} value={draft.acronym} onChange={e => setDraft({...draft, acronym: e.target.value})} />
                    </div>
                    <div style={{flex:1}}>
                        <label style={styles.label}>Start Date</label>
                        <input type="date" style={styles.input} value={draft.startDate} onChange={e => setDraft({...draft, startDate: e.target.value})} />
                    </div>
                </div>

                <div style={{display:'flex', gap:'15px', marginBottom:'15px'}}>
                    <div style={{flex:2}}>
                        <label style={styles.label}>Head of Study Program</label>
                        <input style={styles.input} value={draft.headOfProgram} onChange={e => setDraft({...draft, headOfProgram: e.target.value})} />
                    </div>
                    <div style={{flex:1}}>
                        <label style={styles.label}>ECTS</label>
                        <input type="number" style={styles.input} value={draft.totalEcts} onChange={e => setDraft({...draft, totalEcts: e.target.value})} />
                    </div>
                </div>

                <div style={styles.formGroup}>
                    <label style={styles.checkboxWrapper}>
                        <input
                            type="checkbox"
                            checked={draft.isActive}
                            onChange={e => setDraft({...draft, isActive: e.target.checked})}
                        />
                        Program is Active
                    </label>
                </div>

                {/* --- SPEC SECTION --- */}
                <div style={styles.specSection}>
                    <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'10px'}}>
                        <h4 style={{margin:0, fontSize:'1rem'}}>Specializations</h4>
                        <button onClick={addDraftSpec} style={{...styles.btn, background:'#fff', border:'1px solid #ccc', padding:'5px 10px'}}>
                            + Add Spec
                        </button>
                    </div>

                    {draft.specializations.map((spec, idx) => (
                        <div key={idx} style={styles.specRow}>
                            <input
                                style={{...styles.input, flex:2}}
                                placeholder="Name"
                                value={spec.name}
                                onChange={(e) => updateDraftSpec(idx, 'name', e.target.value)}
                            />
                            <input
                                style={{...styles.input, flex:1}}
                                placeholder="Acronym"
                                value={spec.acronym}
                                onChange={(e) => updateDraftSpec(idx, 'acronym', e.target.value)}
                            />

                            <label style={{...styles.checkboxWrapper, padding:'5px', fontSize:'0.8rem'}}>
                                <input
                                    type="checkbox"
                                    checked={!!spec.is_active}
                                    onChange={(e) => updateDraftSpec(idx, 'is_active', e.target.checked)}
                                />
                                Active
                            </label>

                            <button
                                onClick={() => deleteSpec(idx)}
                                style={{...styles.btn, background:'#dc3545', color:'white', padding:'6px 10px', marginLeft:'0'}}
                                title="Remove"
                            >
                                ×
                            </button>
                        </div>
                    ))}
                    {draft.specializations.length === 0 && <p style={{color:'#777', fontStyle:'italic'}}>No specializations.</p>}
                </div>

                <div style={{marginTop: '25px', display:'flex', justifyContent:'flex-end', gap:'10px'}}>
                    <button style={{...styles.btn, background:'#f8f9fa', border:'1px solid #ddd'}} onClick={() => setFormMode("overview")}>Cancel</button>
                    <button style={{...styles.btn, ...styles.primaryBtn}} onClick={save}>
                        {formMode === "add" ? "Create" : "Save Changes"}
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}