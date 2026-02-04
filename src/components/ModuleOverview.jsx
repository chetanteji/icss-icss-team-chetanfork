import React, { useState, useEffect, useMemo } from "react";
import api from "../api";

// --- STYLES ---
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
  const [modules, setModules] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [specializations, setSpecializations] = useState([]);
  const [customRoomTypes, setCustomRoomTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [hoverId, setHoverId] = useState(null);

  const [formMode, setFormMode] = useState("overview");
  const [editingCode, setEditingCode] = useState(null);
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
        .map(r => r.type).filter(t => t && !STANDARD_ROOM_TYPES.includes(t));
      setCustomRoomTypes([...new Set(existingCustom)].sort());
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const filteredModules = useMemo(() => {
    const q = query.trim().toLowerCase();
    // Student & Lecturer see ALL modules, HoSP see their Program's modules, PM see everything
    return modules.filter(m => {
      const matchesSearch = m.name.toLowerCase().includes(q) || m.module_code.toLowerCase().includes(q);
      if (!matchesSearch) return false;

      if (currentUser?.role === 'PM' || currentUser?.role === 'STUDENT' || currentUser?.role === 'LECTURER') {
        return true; 
      }
      if (currentUser?.role === 'HOSP') {
        return m.program_id === currentUser.program_id;
      }
      return false;
    });
  }, [modules, query, currentUser]);

  const canEdit = (m) => {
    if (currentUser?.role === 'PM') return true;
    if (currentUser?.role === 'HOSP' && m.program_id === currentUser.program_id) return true;
    return false;
  };

  const canDelete = () => currentUser?.role === 'PM';

  const openAdd = () => {
    setDraft({
      module_code: "", name: "", ects: 5, room_type: "Lecture Classroom", semester: 1,
      assessment_type: "Written Exam", category: "Core", 
      program_id: currentUser?.role === 'HOSP' ? currentUser.program_id : "", specialization_ids: []
    });
    setFormMode("add");
  };

  const openEdit = (m) => {
    setEditingCode(m.module_code);
    setDraft({
      ...m,
      program_id: m.program_id ? String(m.program_id) : "",
      specialization_ids: (m.specializations || []).map(s => s.id)
    });
    setFormMode("edit");
  };

  const save = async () => {
    const payload = { ...draft, ects: parseInt(draft.ects), semester: parseInt(draft.semester), program_id: draft.program_id ? parseInt(draft.program_id) : null };
    try {
      if (formMode === "add") await api.createModule(payload);
      else await api.updateModule(editingCode, payload);
      await loadData();
      setFormMode("overview");
    } catch (e) { alert("Error saving module."); }
  };

  return (
    <div style={styles.container}>
      <div style={styles.controlsBar}>
        <input style={styles.searchBar} placeholder="Search modules..." value={query} onChange={(e) => setQuery(e.target.value)} />
        {(currentUser?.role === 'PM' || currentUser?.role === 'HOSP') && (
            <button style={{...styles.btn, ...styles.primaryBtn}} onClick={openAdd}>+ New Module</button>
        )}
      </div>

      <div style={styles.listHeader}>
        <div>Code</div><div>Module Name</div><div>Program</div><div style={{textAlign: "center"}}>Sem.</div><div style={{textAlign: "center"}}>Category</div><div style={{textAlign: "center"}}>ECTS</div><div>Assessment</div><div>Room Type</div><div style={{textAlign: 'right'}}>Action</div>
      </div>

      <div style={styles.listContainer}>
        {loading ? <div style={{textAlign: 'center', padding: '40px'}}>Loading...</div> : 
          filteredModules.map((m) => (
            <div key={m.module_code} style={{ ...styles.listCard, ...(hoverId === m.module_code ? styles.listCardHover : {}) }} onMouseEnter={() => setHoverId(m.module_code)} onMouseLeave={() => setHoverId(null)}>
                <div style={styles.codeText}>{m.module_code}</div>
                <div style={styles.nameText}>{m.name}</div>
                <div style={styles.cellText}>{programs.find(p => p.id === m.program_id)?.name || "Global"}</div>
                <div style={styles.centeredCell}>{m.semester}</div>
                <div style={{textAlign: "center"}}><span style={{...styles.catBadge, ...styles.catCore}}>{m.category}</span></div>
                <div style={styles.centeredCell}>{m.ects}</div>
                <div style={styles.cellText}>{m.assessment_type || "-"}</div>
                <div style={styles.cellText}>{m.room_type}</div>
                <div style={styles.actionContainer}>
                    {canEdit(m) && <button style={{...styles.actionBtn, ...styles.editBtn}} onClick={() => openEdit(m)}>Edit</button>}
                    {canDelete() && <button style={{...styles.actionBtn, ...styles.deleteBtn}} onClick={() => {setModuleToDelete(m); setShowDeleteModal(true);}}>Del</button>}
                    {!canEdit(m) && !canDelete() && <span style={{fontSize:'0.7rem', color:'#cbd5e1'}}>View Only</span>}
                </div>
            </div>
          ))
        }
      </div>

      {/* MODAL FOR ADD/EDIT */}
      {(formMode === "add" || formMode === "edit") && (
        <div style={styles.overlay}>
            <div style={styles.modal}>
                <h3>{formMode === "add" ? "Create Module" : "Edit Module"}</h3>
                <input style={styles.input} placeholder="Code" value={draft.module_code} onChange={e => setDraft({...draft, module_code: e.target.value})} disabled={formMode==="edit"}/>
                <input style={styles.input} placeholder="Name" value={draft.name} onChange={e => setDraft({...draft, name: e.target.value})}/>
                <select style={styles.select} value={draft.program_id} disabled={currentUser.role === 'HOSP'} onChange={e => setDraft({...draft, program_id: e.target.value})}>
                    <option value="">Global</option>
                    {programs.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
                <div style={{display:'flex', justifyContent:'flex-end', gap:'10px'}}>
                    <button style={styles.btn} onClick={() => setFormMode("overview")}>Cancel</button>
                    <button style={{...styles.btn, ...styles.primaryBtn}} onClick={save}>Save</button>
                </div>
            </div>
        </div>
      )}

      {showDeleteModal && (
        <div style={styles.overlay}>
            <div style={{...styles.modal, width:'400px'}}>
                <h3>Confirm Delete</h3>
                <p>Delete {moduleToDelete?.name}?</p>
                <button style={{...styles.btn, ...styles.deleteBtn}} onClick={async () => { await api.deleteModule(moduleToDelete.module_code); setShowDeleteModal(false); loadData(); }}>Confirm Delete</button>
                <button style={styles.btn} onClick={() => setShowDeleteModal(false)}>Cancel</button>
            </div>
        </div>
      )}
    </div>
  );
}