import React, { useState, useEffect, useMemo } from "react";
import api from "../api";

// --- STYLES ---
const styles = {
  container: { padding: "20px", fontFamily: "'Inter', sans-serif", color: "#333", maxWidth: "1200px", margin: "0 auto" },
  controlsBar: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", gap: "15px", flexWrap: "wrap" },
  searchBar: { padding: "10px 15px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.95rem", width: "100%", maxWidth: "350px", background: "white", boxShadow: "0 1px 2px rgba(0,0,0,0.05)", outline: "none" },
  listContainer: { display: "flex", flexDirection: "column", gap: "12px" },
  listHeader: { display: "grid", gridTemplateColumns: "80px 2fr 1.5fr 80px 100px 60px 1.2fr 1.2fr 110px", gap: "15px", padding: "0 25px", marginBottom: "5px", color: "#94a3b8", fontSize: "0.75rem", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.05em", alignItems: "center" },
  listCard: { background: "white", borderRadius: "8px", border: "none", transition: "background-color 0.2s ease", display: "grid", gridTemplateColumns: "80px 2fr 1.5fr 80px 100px 60px 1.2fr 1.2fr 110px", alignItems: "center", padding: "16px 25px", gap: "15px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" },
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
  label: { display: "block", marginBottom: "5px", fontWeight: "600", fontSize: "0.85rem", color: "#64748b" },
  input: { width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.95rem", boxSizing: "border-box", marginBottom: "15px" },
  select: { width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.95rem", background: "white", marginBottom: "15px" },
};

const CATEGORY_TYPES = ["Core", "Shared", "Elective"];

export default function ModuleOverview({ onNavigate }) {
  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : { role: "student" };

  const [modules, setModules] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [hoverId, setHoverId] = useState(null);

  // Form & Delete States
  const [formMode, setFormMode] = useState("overview");
  const [editingCode, setEditingCode] = useState(null);
  const [draft, setDraft] = useState({
    module_code: "", name: "", ects: 5, semester: 1, 
    category: "Core", program_id: "", room_type: "Lecture Classroom"
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [moduleToDelete, setModuleToDelete] = useState(null);

  // --- PERMISSION LOGIC ---
  const isAdmin = ["admin", "pm"].includes(user.role.toLowerCase());
  const isHoSP = user.role.toLowerCase() === "hosp";
  const canCreate = isAdmin || isHoSP;

  const checkManagePermission = (m) => {
    if (isAdmin) return true;
    if (isHoSP) {
      // Use Number() to prevent string vs number comparison errors
      const managedIds = (user.managed_program_ids || []).map(id => Number(id));
      return managedIds.includes(Number(m.program_id));
    }
    return false;
  };

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [modData, progData] = await Promise.all([api.getModules(), api.getPrograms()]);
      setModules(Array.isArray(modData) ? modData : []);
      setPrograms(Array.isArray(progData) ? progData : []);
    } catch (e) { console.error("Load error:", e); } 
    finally { setLoading(false); }
  };

  const filteredModules = useMemo(() => {
    const q = query.trim().toLowerCase();
    return modules.filter(m => 
      m.name.toLowerCase().includes(q) || m.module_code.toLowerCase().includes(q)
    );
  }, [modules, query]);

  const save = async () => {
    if (!draft.module_code || !draft.name) return alert("Code and Name are required");
    
    // Safety check for HoSP
    if (isHoSP && draft.program_id && !user.managed_program_ids?.map(Number).includes(Number(draft.program_id))) {
        return alert("Unauthorized: You don't manage this program.");
    }

    try {
      if (formMode === "add") await api.createModule(draft);
      else await api.updateModule(editingCode, draft);
      setFormMode("overview");
      loadData();
    } catch (e) { alert("Save failed. Ensure code is unique."); }
  };

  const confirmDelete = async () => {
    try {
      await api.deleteModule(moduleToDelete.module_code);
      setShowDeleteModal(false);
      loadData();
    } catch (e) { alert("Delete failed."); }
  };

  const getCategoryStyle = (cat) => {
    if (cat === "Core") return styles.catCore;
    if (cat === "Elective") return styles.catElective;
    return styles.catShared;
  };

  return (
    <div style={styles.container}>
      {/* Search and Global Action */}
      <div style={styles.controlsBar}>
        <input style={styles.searchBar} placeholder="Search modules..." value={query} onChange={(e) => setQuery(e.target.value)} />
        {canCreate && (
            <button style={{...styles.btn, ...styles.primaryBtn}} onClick={() => { 
                setDraft({module_code:"", name:"", ects:5, semester:1, category:"Core", program_id:""});
                setFormMode("add"); 
            }}>
                + New Module
            </button>
        )}
      </div>

      {/* Header */}
      <div style={styles.listHeader}>
        <div>Code</div><div>Name</div><div>Program</div>
        <div style={{textAlign: "center"}}>Sem</div><div style={{textAlign: "center"}}>Cat</div>
        <div style={{textAlign: "center"}}>ECTS</div><div>Assessment</div><div>Room</div>
        <div style={{textAlign: 'right'}}>Action</div>
      </div>

      {/* List */}
      <div style={styles.listContainer}>
        {filteredModules.map((m) => {
            const prog = programs.find(p => Number(p.id) === Number(m.program_id));
            const canManage = checkManagePermission(m);

            return (
                <div key={m.module_code} style={{...styles.listCard, ...(hoverId === m.module_code ? styles.listCardHover : {})}}
                     onMouseEnter={() => setHoverId(m.module_code)} onMouseLeave={() => setHoverId(null)}>
                    
                    <div style={styles.codeText}>{m.module_code}</div>
                    <div style={styles.nameText}>{m.name}</div>
                    <div style={styles.cellText}>{prog ? prog.name : "Global"}</div>
                    <div style={styles.centeredCell}>{m.semester}</div>
                    <div style={{textAlign: "center"}}>
                        <span style={{...styles.catBadge, ...getCategoryStyle(m.category)}}>{m.category}</span>
                    </div>
                    <div style={styles.centeredCell}>{m.ects}</div>
                    <div style={styles.cellText}>{m.assessment_type || "-"}</div>
                    <div style={styles.cellText}>{m.room_type}</div>

                    <div style={styles.actionContainer}>
                        {canManage ? (
                            <>
                                <button style={{...styles.actionBtn, ...styles.editBtn}} onClick={() => { setEditingCode(m.module_code); setDraft(m); setFormMode("edit"); }}>Edit</button>
                                <button style={{...styles.actionBtn, ...styles.deleteBtn}} onClick={() => { setModuleToDelete(m); setShowDeleteModal(true); }}>Del</button>
                            </>
                        ) : (
                            <span style={{fontSize:'0.65rem', color:'#cbd5e1', fontWeight:'700'}}>READ ONLY</span>
                        )}
                    </div>
                </div>
            );
        })}
      </div>

      {/* ADD/EDIT MODAL */}
      {(formMode === "add" || formMode === "edit") && (
        <div style={styles.overlay}>
            <div style={styles.modal}>
                <h3>{formMode === "add" ? "Add Module" : "Edit Module"}</h3>
                
                <label style={styles.label}>Program Ownership</label>
                <select style={styles.select} value={draft.program_id} onChange={e => setDraft({...draft, program_id: e.target.value})}>
                    <option value="">-- Global --</option>
                    {programs.map(p => {
                        const restricted = isHoSP && !user.managed_program_ids?.map(Number).includes(Number(p.id));
                        return (
                            <option key={p.id} value={p.id} disabled={restricted}>
                                {p.name} {restricted ? "(Restricted)" : ""}
                            </option>
                        );
                    })}
                </select>

                <label style={styles.label}>Module Code</label>
                <input style={styles.input} disabled={formMode === "edit"} value={draft.module_code} onChange={e => setDraft({...draft, module_code: e.target.value})} />

                <label style={styles.label}>Module Name</label>
                <input style={styles.input} value={draft.name} onChange={e => setDraft({...draft, name: e.target.value})} />

                <div style={{display:'flex', gap:'10px'}}>
                    <button style={{...styles.btn, flex:1}} onClick={() => setFormMode("overview")}>Cancel</button>
                    <button style={{...styles.btn, ...styles.primaryBtn, flex:1}} onClick={save}>Save</button>
                </div>
            </div>
        </div>
      )}

      {/* DELETE MODAL (CRITICAL: You were missing this!) */}
      {showDeleteModal && (
        <div style={styles.overlay}>
            <div style={{...styles.modal, width:'400px'}}>
                <h3 style={{color:'#ef4444'}}>Confirm Delete</h3>
                <p>Are you sure you want to delete <b>{moduleToDelete?.name}</b>?</p>
                <div style={{display:'flex', justifyContent:'flex-end', gap:'10px', marginTop:'20px'}}>
                    <button style={styles.btn} onClick={() => setShowDeleteModal(false)}>Cancel</button>
                    <button style={{...styles.btn, ...styles.deleteBtn}} onClick={confirmDelete}>Delete Permanently</button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}