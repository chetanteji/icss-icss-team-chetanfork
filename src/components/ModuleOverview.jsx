import React, { useState, useEffect, useMemo } from "react";
import api from "../api";

const ENABLE_V2_FIELDS = true;

const styles = {
  container: { padding: "20px", fontFamily: "'Inter', sans-serif", color: "#333", maxWidth: "1200px", margin: "0 auto" },
  controlsBar: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px", gap: "15px", flexWrap: "wrap" },
  filtersContainer: { display: "flex", gap: "10px", flexWrap: "wrap", flex: 1 },
  searchBar: {
    padding: "10px 15px",
    borderRadius: "8px",
    border: "1px solid #cbd5e1",
    fontSize: "0.95rem",
    width: "100%",
    maxWidth: "250px",
    background: "white",
    boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
    outline: "none",
    margin: 0
  },

  tableContainer: { border: "1px solid #e2e8f0", borderRadius: "10px", overflow: "hidden", boxShadow: "0 1px 2px rgba(0,0,0,0.05)" },
  table: { width: "100%", borderCollapse: "collapse", background: "white", fontSize: "0.9rem", tableLayout: "fixed" },
  thead: { background: "#f8fafc", borderBottom: "1px solid #e2e8f0" },
  th: { textAlign: "left", padding: "12px 15px", fontWeight: "600", color: "#64748b", textTransform: "uppercase", fontSize: "0.75rem", letterSpacing: "0.05em" },
  tr: { borderBottom: "1px solid #f1f5f9", transition: "background 0.15s" },
  td: { padding: "12px 15px", verticalAlign: "middle", color: "#334155" },

  rowHover: { background: "#f8fafc", cursor: "pointer" },

  badge: {
    padding: "4px 8px", borderRadius: "4px", fontSize: "0.75rem", fontWeight: "600",
    display: "inline-block"
  },

  btn: { padding: "8px 14px", borderRadius: "6px", border: "none", cursor: "pointer", fontSize: "0.85rem", fontWeight: "500", transition: "all 0.2s" },
  primaryBtn: { background: "#2563eb", color: "white", boxShadow: "0 2px 4px rgba(37, 99, 235, 0.2)" },
  secondaryBtn: { background: "white", border: "1px solid #cbd5e1", color: "#475569" },
  dangerBtn: { background: "#ef4444", color: "white" },

  modalOverlay: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.4)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000, backdropFilter: "blur(2px)" },
  modal: { background: "white", padding: "30px", borderRadius: "12px", width: "600px", maxWidth: "90%", boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)" },

  formGroup: { marginBottom: "15px" },
  label: { display: "block", marginBottom: "6px", fontWeight: "500", fontSize: "0.9rem", color: "#334155" },
  input: { width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.95rem", outline: "none", transition: "border-color 0.2s", boxSizing: "border-box" },
  select: { width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.95rem", outline: "none", background: "white", boxSizing: "border-box" },

  checkboxWrapper: { display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", fontSize: "0.9rem", color: "#334155" }
};

export default function ModuleOverview() {
  const [modules, setModules] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [specializations, setSpecializations] = useState([]);

  const [search, setSearch] = useState("");
  const [filterProgram, setFilterProgram] = useState("");
  const [filterSemester, setFilterSemester] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [formMode, setFormMode] = useState("add"); // "add" or "edit"

  // Form State
  const [draft, setDraft] = useState({
    module_code: "",
    name: "",
    ects: 5,
    room_type: "Lecture Classroom",
    semester: 1,
    program_id: "",
    category: "Core",
    assessment_breakdown: "", // NEW JSON-based text
    specialization_ids: []    // NEW Multi-select
  });

  const [deleteInput, setDeleteInput] = useState("");
  const [itemToDelete, setItemToDelete] = useState(null);

  // Initial Load
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
        const [mods, progs, specs] = await Promise.all([
            api.getModules(),
            api.getPrograms(),
            api.getSpecializations()
        ]);
        setModules(mods);
        setPrograms(progs);
        setSpecializations(specs);
    } catch (err) {
        console.error("Failed to load data", err);
    }
  };

  // --- Filtering ---
  const filteredModules = useMemo(() => {
    return modules.filter(m => {
      const matchSearch = (m.name.toLowerCase().includes(search.toLowerCase()) || m.module_code.toLowerCase().includes(search.toLowerCase()));
      const matchProg = filterProgram ? (m.program_id === parseInt(filterProgram)) : true;
      const matchSem = filterSemester ? (m.semester === parseInt(filterSemester)) : true;
      return matchSearch && matchProg && matchSem;
    });
  }, [modules, search, filterProgram, filterSemester]);

  // --- Handlers ---
  const openAddModal = () => {
    setFormMode("add");
    setDraft({
      module_code: "",
      name: "",
      ects: 5,
      room_type: "Lecture Classroom",
      semester: 1,
      program_id: "",
      category: "Core",
      assessment_breakdown: "",
      specialization_ids: []
    });
    setShowModal(true);
  };

  const openEditModal = (m) => {
    setFormMode("edit");

    // Parse assessment JSON if needed
    let assessmentStr = "";
    if (m.assessment_type) {
        try {
            const parsed = JSON.parse(m.assessment_type);
            // If it has "assessments" list, map it to a string for editing
            if (parsed.assessments && Array.isArray(parsed.assessments)) {
                assessmentStr = parsed.assessments.map(a => `${a.name}=${a.weight}`).join(", ");
            } else if (parsed.legacy) {
                assessmentStr = parsed.legacy;
            }
        } catch (e) {
            assessmentStr = m.assessment_type; // Fallback
        }
    }

    setDraft({
      module_code: m.module_code,
      name: m.name,
      ects: m.ects,
      room_type: m.room_type,
      semester: m.semester,
      program_id: m.program_id || "",
      category: m.category || "Core",
      assessment_breakdown: assessmentStr,
      specialization_ids: m.specializations ? m.specializations.map(s => s.id) : []
    });
    setShowModal(true);
  };

  const saveModule = async () => {
    try {
        // Convert assessment string "Exam=50, Project=50" -> JSON
        // The backend handles the parsing, we just send the string in 'assessment_breakdown' field

        const payload = {
            ...draft,
            ects: parseInt(draft.ects),
            semester: parseInt(draft.semester),
            program_id: draft.program_id ? parseInt(draft.program_id) : null,
        };

        if (formMode === "add") {
            await api.createModule(payload);
        } else {
            await api.updateModule(draft.module_code, payload);
        }
        setShowModal(false);
        fetchData();
    } catch (err) {
        alert("Error saving module: " + err.message);
    }
  };

  const openDeleteModal = (m) => {
    setItemToDelete(m);
    setDeleteInput("");
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    try {
        await api.deleteModule(itemToDelete.module_code);
        setShowDeleteModal(false);
        setItemToDelete(null);
        fetchData();
    } catch (err) {
        alert("Error deleting module: " + err.message);
    }
  };

  return (
    <div style={styles.container}>

      {/* Controls */}
      <div style={styles.controlsBar}>
        <div style={styles.filtersContainer}>
            <input
                placeholder="Search modules..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={styles.searchBar}
            />
            <select
                value={filterProgram}
                onChange={e => setFilterProgram(e.target.value)}
                style={{...styles.searchBar, width:'180px'}}
            >
                <option value="">All Programs</option>
                {programs.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <select
                value={filterSemester}
                onChange={e => setFilterSemester(e.target.value)}
                style={{...styles.searchBar, width:'140px'}}
            >
                <option value="">All Semesters</option>
                {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Sem {s}</option>)}
            </select>
        </div>
        <button style={{...styles.btn, ...styles.primaryBtn}} onClick={openAddModal}>+ New Module</button>
      </div>

      {/* Table */}
      <div style={styles.tableContainer}>
        <table style={styles.table}>
            <thead style={styles.thead}>
                <tr>
                    <th style={{...styles.th, width: '90px'}}>Code</th>
                    <th style={styles.th}>Name</th>
                    <th style={{...styles.th, width: '100px'}}>Program</th>
                    <th style={{...styles.th, width: '60px'}}>Sem</th>
                    <th style={{...styles.th, width: '60px'}}>ECTS</th>
                    <th style={{...styles.th, width: '100px'}}>Category</th>
                    {ENABLE_V2_FIELDS && <th style={styles.th}>Specializations</th>}
                    <th style={{...styles.th, width: '140px', textAlign: 'right'}}>Actions</th>
                </tr>
            </thead>
            <tbody>
                {filteredModules.map(m => (
                    <tr key={m.module_code} style={styles.tr} onMouseEnter={e => e.currentTarget.style.background = "#f8fafc"} onMouseLeave={e => e.currentTarget.style.background = "white"}>
                        <td style={{...styles.td, fontWeight:'600', fontSize:'0.85rem'}}>{m.module_code}</td>
                        <td style={styles.td}>
                            <div style={{fontWeight:'500'}}>{m.name}</div>
                            <div style={{fontSize:'0.75rem', color:'#94a3b8'}}>{m.room_type}</div>
                        </td>

                        {/* ✅ UPDATED: Shows Acronym Only */}
                        <td style={styles.td}>
                            {m.program ? (
                                <span title={m.program.name} style={{
                                    background: '#e0f2fe', color:'#0369a1',
                                    padding:'2px 6px', borderRadius:'4px', fontSize:'0.75rem', fontWeight:'600'
                                }}>
                                    {m.program.acronym}
                                </span>
                            ) : (
                                <span style={{color:'#cbd5e1'}}>-</span>
                            )}
                        </td>

                        <td style={styles.td}>{m.semester}</td>
                        <td style={styles.td}>{m.ects}</td>
                        <td style={styles.td}>
                            <span style={{
                                ...styles.badge,
                                background: m.category === 'Core' ? '#dcfce7' : (m.category === 'Elective' ? '#fef9c3' : '#f1f5f9'),
                                color: m.category === 'Core' ? '#166534' : (m.category === 'Elective' ? '#854d0e' : '#64748b')
                            }}>
                                {m.category || "Core"}
                            </span>
                        </td>

                        {ENABLE_V2_FIELDS && (
                            <td style={styles.td}>
                                <div style={{display:'flex', gap:'4px', flexWrap:'wrap'}}>
                                    {m.specializations && m.specializations.length > 0 ? (
                                        m.specializations.map(s => (
                                            <span key={s.id} style={{fontSize:'0.7rem', background:'#f1f5f9', padding:'2px 5px', borderRadius:'3px', color:'#475569'}}>
                                                {s.acronym}
                                            </span>
                                        ))
                                    ) : (
                                        <span style={{color:'#cbd5e1', fontSize:'0.8rem'}}>-</span>
                                    )}
                                </div>
                            </td>
                        )}

                        <td style={{...styles.td, textAlign: 'right'}}>
                            <button style={{...styles.btn, ...styles.secondaryBtn, marginRight:'8px'}} onClick={() => openEditModal(m)}>Edit</button>
                            <button style={{...styles.btn, ...styles.dangerBtn, padding:'8px 10px'}} onClick={() => openDeleteModal(m)}>
                                <span style={{fontWeight:'bold'}}>×</span>
                            </button>
                        </td>
                    </tr>
                ))}
                {filteredModules.length === 0 && (
                    <tr>
                        <td colSpan={8} style={{padding:'40px', textAlign:'center', color:'#94a3b8'}}>
                            No modules found.
                        </td>
                    </tr>
                )}
            </tbody>
        </table>
      </div>

      {/* MODAL - Add/Edit */}
      {showModal && (
        <div style={styles.modalOverlay} onClick={() => setShowModal(false)}>
            <div style={styles.modal} onClick={e => e.stopPropagation()}>
                <h2 style={{marginTop:0, marginBottom:'20px', color:'#1e293b'}}>
                    {formMode === 'add' ? 'Add New Module' : 'Edit Module'}
                </h2>

                <div style={{display:'flex', gap:'15px'}}>
                    <div style={{...styles.formGroup, flex:1}}>
                        <label style={styles.label}>Module Code</label>
                        <input
                            style={styles.input}
                            value={draft.module_code}
                            disabled={formMode === 'edit'}
                            onChange={e => setDraft({...draft, module_code: e.target.value})}
                            placeholder="e.g. CS101"
                        />
                    </div>
                    <div style={{...styles.formGroup, flex:2}}>
                        <label style={styles.label}>Name</label>
                        <input
                            style={styles.input}
                            value={draft.name}
                            onChange={e => setDraft({...draft, name: e.target.value})}
                            placeholder="e.g. Intro to Programming"
                        />
                    </div>
                </div>

                <div style={{display:'flex', gap:'15px'}}>
                    <div style={{...styles.formGroup, flex:1}}>
                        <label style={styles.label}>Program</label>
                        <select
                            style={styles.select}
                            value={draft.program_id}
                            onChange={e => setDraft({...draft, program_id: e.target.value})}
                        >
                            <option value="">-- Select --</option>
                            {programs.map(p => <option key={p.id} value={p.id}>{p.name} ({p.degree_type})</option>)}
                        </select>
                    </div>
                    <div style={{...styles.formGroup, width:'80px'}}>
                        <label style={styles.label}>Sem</label>
                        <input
                            type="number"
                            style={styles.input}
                            value={draft.semester}
                            onChange={e => setDraft({...draft, semester: e.target.value})}
                        />
                    </div>
                    <div style={{...styles.formGroup, width:'80px'}}>
                        <label style={styles.label}>ECTS</label>
                        <input
                            type="number"
                            style={styles.input}
                            value={draft.ects}
                            onChange={e => setDraft({...draft, ects: e.target.value})}
                        />
                    </div>
                </div>

                <div style={{display:'flex', gap:'15px'}}>
                    <div style={{...styles.formGroup, flex:1}}>
                        <label style={styles.label}>Room Requirement</label>
                        <select
                            style={styles.select}
                            value={draft.room_type}
                            onChange={e => setDraft({...draft, room_type: e.target.value})}
                        >
                            <option value="Lecture Classroom">Lecture Classroom</option>
                            <option value="Computer Lab">Computer Lab</option>
                            <option value="Seminar">Seminar Room</option>
                            <option value="Auditorium">Auditorium</option>
                        </select>
                    </div>
                    <div style={{...styles.formGroup, flex:1}}>
                        <label style={styles.label}>Category</label>
                        <select
                            style={styles.select}
                            value={draft.category}
                            onChange={e => setDraft({...draft, category: e.target.value})}
                        >
                            <option value="Core">Core</option>
                            <option value="Elective">Elective</option>
                            <option value="Shared">Shared</option>
                        </select>
                    </div>
                </div>

                {ENABLE_V2_FIELDS && (
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Specializations (Select multiple)</label>
                        <select
                            multiple
                            style={{...styles.select, height:'100px'}}
                            value={draft.specialization_ids}
                            onChange={e => {
                                const selected = Array.from(e.target.selectedOptions, option => parseInt(option.value));
                                setDraft({...draft, specialization_ids: selected});
                            }}
                        >
                            {specializations
                                .filter(s => !draft.program_id || s.program_id === parseInt(draft.program_id)) // Filter specs by selected program
                                .map(s => (
                                <option key={s.id} value={s.id}>{s.name} ({s.acronym})</option>
                            ))}
                        </select>
                        <div style={{fontSize:'0.75rem', color:'#64748b', marginTop:'4px'}}>Hold Ctrl (Cmd) to select multiple.</div>
                    </div>
                )}

                <div style={styles.formGroup}>
                    <label style={styles.label}>Assessment Breakdown (Optional)</label>
                    <input
                        style={styles.input}
                        placeholder="e.g. Exam=60, Project=40"
                        value={draft.assessment_breakdown}
                        onChange={e => setDraft({...draft, assessment_breakdown: e.target.value})}
                    />
                </div>

                <div style={{marginTop:'25px', display:'flex', justifyContent:'flex-end', gap:'10px'}}>
                    <button style={{...styles.btn, ...styles.secondaryBtn}} onClick={() => setShowModal(false)}>Cancel</button>
                    <button style={{...styles.btn, ...styles.primaryBtn}} onClick={saveModule}>
                        {formMode === 'add' ? 'Create Module' : 'Save Changes'}
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {showDeleteModal && (
        <div style={styles.modalOverlay} onClick={() => setShowDeleteModal(false)}>
            <div style={{...styles.modal, width:'450px'}}>
                <h3 style={{ marginTop: 0, color: "#991b1b", marginBottom: "15px" }}>Delete Module?</h3>
                <p style={{ color: "#4b5563", marginBottom: "25px", lineHeight: '1.5' }}>
                  Are you sure you want to delete this module? This action cannot be undone.
                  {itemToDelete && <strong style={{display: 'block', marginTop: '10px'}}>{itemToDelete.name}</strong>}
                </p>

                <div style={{ background: "#fef2f2", padding: "15px", borderRadius: "8px", border: "1px solid #fecaca", marginBottom: "25px" }}>
                    <p style={{ fontSize: "0.9rem", fontWeight: "bold", margin: "0 0 10px 0", color:'#991b1b' }}>
                        Type "DELETE" to confirm:
                    </p>
                    <input
                        style={{...styles.input, marginBottom: 0, borderColor: '#fca5a5'}}
                        value={deleteInput}
                        onChange={e => setDeleteInput(e.target.value)}
                        placeholder="DELETE"
                    />
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
                    <button style={{ ...styles.btn, background: "#e5e7eb", color: "#374151" }} onClick={() => setShowDeleteModal(false)}>Cancel</button>
                    <button
                        disabled={deleteInput !== "DELETE"}
                        style={{ ...styles.btn, background: deleteInput === "DELETE" ? "#dc2626" : "#fca5a5", color: "white", cursor: deleteInput === "DELETE" ? "pointer" : "not-allowed" }}
                        onClick={confirmDelete}
                    >
                        Permanently Delete
                    </button>
                </div>
            </div>
        </div>
      )}

    </div>
  );
}