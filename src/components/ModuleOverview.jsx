import React, { useState, useEffect, useMemo } from "react";
import api from "../api";

// --- STYLES (Kept from your original) ---
const styles = {
  container: { padding: "20px", fontFamily: "'Inter', sans-serif", color: "#333", maxWidth: "1200px", margin: "0 auto" },
  controlsBar: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", gap: "15px", flexWrap: "wrap" },
  searchBar: { padding: "10px 15px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.95rem", width: "100%", maxWidth: "350px", background: "white", boxShadow: "0 1px 2px rgba(0,0,0,0.05)", outline: "none" },
  listContainer: { display: "flex", flexDirection: "column", gap: "12px" },
  listHeader: { display: "grid", gridTemplateColumns: "80px 2fr 1.5fr 80px 100px 60px 1.2fr 1.2fr 110px", gap: "15px", padding: "0 25px", marginBottom: "5px", color: "#94a3b8", fontSize: "0.75rem", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.05em", alignItems: "center" },
  listCard: { background: "white", borderRadius: "8px", border: "none", cursor: "pointer", transition: "background-color 0.2s ease", display: "grid", gridTemplateColumns: "80px 2fr 1.5fr 80px 100px 60px 1.2fr 1.2fr 110px", alignItems: "center", padding: "16px 25px", gap: "15px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" },
  listCardHover: { backgroundColor: "#f1f5f9" },
  codeText: { fontWeight: "700", color: "#3b82f6", fontSize: "0.95rem" },
  nameText: { fontWeight: "600", color: "#1e293b", lineHeight: "1.4" },
  programLink: { color: "#475569", cursor: "pointer", textDecoration: "underline", fontSize: "0.85rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  centeredCell: { textAlign: "center", fontSize: "0.9rem", color: "#64748b" },
  cellText: { fontSize: "0.9rem", color: "#64748b", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  catBadge: { padding: "4px 8px", borderRadius: "6px", fontSize: "0.75rem", fontWeight: "bold", textAlign: "center", textTransform: "uppercase", display: "inline-block" },
  catCore: { background: "#dbeafe", color: "#1e40af" },
  catElective: { background: "#fef3c7", color: "#92400e" },
  catShared: { background: "#f3e8ff", color: "#6b21a8" },
  btn: { padding: "8px 16px", borderRadius: "6px", border: "none", cursor: "pointer", fontSize: "0.9rem", fontWeight: "500", transition: "0.2s" },
  primaryBtn: { background: "#3b82f6", color: "white" },
  actionContainer: { display: "flex", gap: "8px", justifyContent: "flex-end" },
  actionBtn: { padding: "6px 12px", borderRadius: "6px", border: "none", cursor: "pointer", fontSize: "0.85rem", fontWeight: "600" },
  editBtn: { background: "#e2e8f0", color: "#475569" },
  deleteBtn: { background: "#fee2e2", color: "#ef4444" },
  overlay: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 },
  modal: { backgroundColor: "#ffffff", padding: "30px", borderRadius: "12px", width: "650px", maxWidth: "90%", maxHeight: "90vh", overflowY: "auto", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)" },
  formGroup: { marginBottom: "15px" },
  label: { display: "block", marginBottom: "5px", fontWeight: "600", fontSize: "0.85rem", color: "#64748b" },
  input: { width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.95rem", boxSizing: "border-box", marginBottom: "15px" },
  select: { width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.95rem", background: "white", marginBottom: "15px" },
};

const STANDARD_ROOM_TYPES = ["Lecture Classroom", "Computer Lab", "Seminar"];
const ASSESSMENT_TYPES = ["Written Exam", "Presentation", "Project", "Report"];
const CATEGORY_TYPES = ["Core", "Shared", "Elective"];

export default function ModuleOverview({ onNavigate, currentUser }) {
  // NOTE: currentUser should look like: { role: 'STUDENT', id: 1, program_id: 10 }
  // Roles assumed: 'STUDENT', 'LECTURER', 'HOSP', 'PM'

  const [modules, setModules] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [specializations, setSpecializations] = useState([]);
  const [customRoomTypes, setCustomRoomTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [hoverId, setHoverId] = useState(null);

  const [formMode, setFormMode] = useState("overview");
  const [editingCode, setEditingCode] = useState(null);
  const [selectedSpecToAdd, setSelectedSpecToAdd] = useState("");
  const [draft, setDraft] = useState({
    module_code: "", name: "", ects: 5, room_type: "Lecture Classroom", semester: 1,
    assessment_type: "Written Exam", category: "Core", program_id: "", specialization_ids: []
  });

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [moduleToDelete, setModuleToDelete] = useState(null);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [modData, progData, specData, roomData] = await Promise.all([
        api.getModules(), api.getPrograms(), api.getSpecializations(), api.getRooms()
      ]);
      setModules(Array.isArray(modData) ? modData : []);
      setPrograms(Array.isArray(progData) ? progData : []);
      setSpecializations(Array.isArray(specData) ? specData : []);

      const existingCustom = (Array.isArray(roomData) ? roomData : [])
        .map(r => r.type)
        .filter(t => t && !STANDARD_ROOM_TYPES.includes(t));
      setCustomRoomTypes([...new Set(existingCustom)].sort());
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  // --- ROLE BASED FILTERING ---
  const filteredModules = useMemo(() => {
    const q = query.trim().toLowerCase();
    
    return modules.filter(m => {
      // 1. First, apply text search
      const matchesSearch = m.name.toLowerCase().includes(q) || m.module_code.toLowerCase().includes(q);
      if (!matchesSearch) return false;

      // 2. Apply Role Based Visibility
      if (currentUser?.role === 'PM') return true; // PM sees everything
      
      if (currentUser?.role === 'STUDENT') {
          // Assuming m.enrolled_students is an array of IDs
          return m.enrolled_students?.includes(currentUser.id);
      }
      
      if (currentUser?.role === 'LECTURER') {
          return m.lecturer_id === currentUser.id;
      }

      if (currentUser?.role === 'HOSP') {
          return m.program_id === currentUser.program_id;
      }

      return false; 
    });
  }, [modules, query, currentUser]);

  // --- PERMISSION HELPERS ---
  const canModify = (m) => {
    if (currentUser?.role === 'PM') return true;
    if (currentUser?.role === 'HOSP' && m.program_id === currentUser.program_id) return true;
    return false;
  };

  const openAdd = () => {
    setEditingCode(null);
    setSelectedSpecToAdd("");
    setDraft({
      module_code: "", name: "", ects: 5, room_type: "Lecture Classroom", semester: 1,
      assessment_type: "Written Exam", category: "Core", 
      program_id: currentUser?.role === 'HOSP' ? currentUser.program_id : "", 
      specialization_ids: []
    });
    setFormMode("add");
  };

  const openEdit = (m) => {
    setEditingCode(m.module_code);
    setSelectedSpecToAdd("");
    setDraft({
      module_code: m.module_code, name: m.name, ects: m.ects, room_type: m.room_type,
      semester: m.semester, assessment_type: m.assessment_type || "Written Exam", category: m.category || "Core",
      program_id: m.program_id ? String(m.program_id) : "",
      specialization_ids: (m.specializations || []).map(s => s.id)
    });
    setFormMode("edit");
  };

  const save = async () => {
    if (!draft.module_code || !draft.name) return alert("Code and Name are required");

    const payload = {
        ...draft,
        ects: parseInt(draft.ects),
        semester: parseInt(draft.semester),
        program_id: draft.program_id ? parseInt(draft.program_id) : null,
    };

    try {
      if (formMode === "add") await api.createModule(payload);
      else await api.updateModule(editingCode, payload);
      await loadData();
      setFormMode("overview");
    } catch (e) { alert("Error saving module."); }
  };

  const initiateDelete = (m) => {
    setModuleToDelete(m);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
        await api.deleteModule(moduleToDelete.module_code);
        setShowDeleteModal(false);
        loadData();
    } catch (e) { alert("Error deleting module."); }
  };

  const linkSpecToDraft = () => {
      if (!selectedSpecToAdd) return;
      const specId = parseInt(selectedSpecToAdd);
      if (!draft.specialization_ids.includes(specId)) {
          setDraft(prev => ({ ...prev, specialization_ids: [...prev.specialization_ids, specId] }));
      }
      setSelectedSpecToAdd("");
  };

  const unlinkSpecFromDraft = (specId) => {
      setDraft(prev => ({ ...prev, specialization_ids: prev.specialization_ids.filter(id => id !== specId) }));
  };

  const getCategoryStyle = (cat) => {
      if (cat === "Core") return styles.catCore;
      if (cat === "Elective") return styles.catElective;
      return styles.catShared;
  };

  return (
    <div style={styles.container}>
      {/* Controls */}
      <div style={styles.controlsBar}>
        <input style={styles.searchBar} placeholder="Search modules..." value={query} onChange={(e) => setQuery(e.target.value)} />
        
        {/* Only PM and HoSP can create new modules */}
        {(currentUser?.role === 'PM' || currentUser?.role === 'HOSP') && (
            <button style={{...styles.btn, ...styles.primaryBtn}} onClick={openAdd}>+ New Module</button>
        )}
      </div>

      {/* Header Row */}
      <div style={styles.listHeader}>
        <div>Code</div>
        <div>Module Name</div>
        <div>Program</div>
        <div style={{textAlign: "center"}}>Sem.</div>
        <div style={{textAlign: "center"}}>Category</div>
        <div style={{textAlign: "center"}}>ECTS</div>
        <div>Assessment</div>
        <div>Room Type</div>
        <div style={{textAlign: 'right'}}>Action</div>
      </div>

      {/* List Container */}
      <div style={styles.listContainer}>
        {loading ? (
            <div style={{textAlign: 'center', padding: '40px', color: '#64748b'}}>Loading modules...</div>
        ) : (
            filteredModules.map((m) => {
                const prog = programs.find(p => p.id === m.program_id);
                const hasEditPermission = canModify(m);

                return (
                <div
                    key={m.module_code}
                    style={{ ...styles.listCard, ...(hoverId === m.module_code ? styles.listCardHover : {}) }}
                    onMouseEnter={() => setHoverId(m.module_code)}
                    onMouseLeave={() => setHoverId(null)}
                >
                    <div style={styles.codeText}>{m.module_code}</div>
                    <div style={styles.nameText}>{m.name}</div>
                    <div>
                        {prog ? (
                            <span style={styles.programLink} onClick={(e) => { e.stopPropagation(); onNavigate("programs", { programId: prog.id }); }}>
                                {prog.name}
                            </span>
                        ) : <span style={{...styles.cellText, fontStyle:'italic'}}>Global</span>}
                    </div>
                    <div style={styles.centeredCell}>{m.semester}</div>
                    <div style={{textAlign: "center"}}>
                        <span style={{...styles.catBadge, ...getCategoryStyle(m.category)}}>{m.category}</span>
                    </div>
                    <div style={{...styles.centeredCell, fontWeight:'bold', color:'#475569'}}>{m.ects}</div>
                    <div style={styles.cellText}>{m.assessment_type || "-"}</div>
                    <div style={styles.cellText}>{m.room_type}</div>

                    <div style={styles.actionContainer}>
                        {hasEditPermission ? (
                            <>
                                <button style={{...styles.actionBtn, ...styles.editBtn}} onClick={() => openEdit(m)}>Edit</button>
                                <button style={{...styles.actionBtn, ...styles.deleteBtn}} onClick={() => initiateDelete(m)}>Del</button>
                            </>
                        ) : (
                            <span style={{fontSize: '0.75rem', color: '#cbd5e1'}}>View Only</span>
                        )}
                    </div>
                </div>
                );
            })
        )}
        {!loading && filteredModules.length === 0 && <div style={{ color: "#94a3b8", padding: "40px", textAlign: "center", fontStyle: "italic" }}>No modules accessible.</div>}
      </div>

      {/* MODAL (ADD/EDIT) */}
      {(formMode === "add" || formMode === "edit") && (
        <div style={styles.overlay}>
            <div style={styles.modal}>
                <div style={{display:'flex', justifyContent:'space-between', marginBottom:'20px'}}>
                    <h3 style={{margin:0}}>{formMode === "add" ? "Create Module" : "Edit Module"}</h3>
                    <button onClick={() => setFormMode("overview")} style={{border:'none', background:'transparent', fontSize:'1.5rem', cursor:'pointer'}}>×</button>
                </div>

                <div style={{display:'flex', gap:'15px'}}>
                    <div style={{...styles.formGroup, flex:1}}><label style={styles.label}>Module Code</label><input style={styles.input} value={draft.module_code} onChange={(e) => setDraft({ ...draft, module_code: e.target.value })} disabled={formMode === "edit"} placeholder="CS101" /></div>
                    <div style={{...styles.formGroup, flex:2}}><label style={styles.label}>Name</label><input style={styles.input} value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} /></div>
                </div>

                <div style={{display:'flex', gap:'15px'}}>
                    <div style={{...styles.formGroup, flex:1}}><label style={styles.label}>ECTS</label><input type="number" style={styles.input} value={draft.ects} onChange={(e) => setDraft({ ...draft, ects: e.target.value })} /></div>
                    <div style={{...styles.formGroup, flex:1}}><label style={styles.label}>Semester</label><input type="number" style={styles.input} value={draft.semester} onChange={(e) => setDraft({ ...draft, semester: e.target.value })} /></div>
                    <div style={{...styles.formGroup, flex:1}}><label style={styles.label}>Category</label><select style={styles.select} value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value })}>{CATEGORY_TYPES.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
                </div>

                <div style={styles.formGroup}>
                    <label style={styles.label}>Study Program (Owner)</label>
                    <select 
                        style={styles.select} 
                        value={draft.program_id} 
                        disabled={currentUser?.role === 'HOSP'} // HoSPs cannot move modules to other programs
                        onChange={(e) => setDraft({ ...draft, program_id: e.target.value })}
                    >
                        {currentUser?.role !== 'HOSP' && <option value="">-- None / Global Module --</option>}
                        {programs
                          .filter(p => currentUser?.role === 'PM' || p.id === currentUser?.program_id)
                          .map(p => (<option key={p.id} value={p.id}>{p.name} ({p.level})</option>))
                        }
                    </select>
                </div>

                <div style={{marginTop: '25px', display:'flex', justifyContent:'flex-end', gap:'10px'}}>
                    <button style={{...styles.btn, background:'#f8f9fa', border:'1px solid #ddd'}} onClick={() => setFormMode("overview")}>Cancel</button>
                    <button style={{...styles.btn, ...styles.primaryBtn}} onClick={save}>Save Changes</button>
                </div>
            </div>
        </div>
      )}

      {showDeleteModal && (
        <DeleteConfirmationModal
            moduleName={moduleToDelete?.name}
            onClose={() => setShowDeleteModal(false)}
            onConfirm={confirmDelete}
        />
      )}
    </div>
  );
}

function DeleteConfirmationModal({ moduleName, onClose, onConfirm }) {
    const [input, setInput] = useState("");
    const isMatch = input === "DELETE";

    return (
        <div style={styles.overlay}>
            <div style={{...styles.modal, width:'450px'}}>
                <h3 style={{ marginTop: 0, color: "#991b1b" }}>⚠️ Delete Module?</h3>
                <p style={{ color: "#4b5563", marginBottom: "20px" }}>Are you sure you want to delete <strong>{moduleName}</strong>?</p>
                <input style={styles.input} value={input} onChange={e => setInput(e.target.value)} placeholder="Type DELETE to confirm" />
                <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                    <button style={{ ...styles.btn, background: "#e5e7eb" }} onClick={onClose}>Cancel</button>
                    <button disabled={!isMatch} style={{ ...styles.btn, background: isMatch ? "#dc2626" : "#fca5a5", color: "white" }} onClick={onConfirm}>Delete</button>
                </div>
            </div>
        </div>
    );
}