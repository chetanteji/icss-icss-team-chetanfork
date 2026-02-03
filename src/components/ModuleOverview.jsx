import React, { useState, useEffect, useMemo } from "react";
import api from "../api";

// --- STYLES ---
const styles = {
  container: { padding: "20px", fontFamily: "'Inter', sans-serif", color: "#333", maxWidth: "1200px", margin: "0 auto" },
  controlsBar: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", gap: "15px", flexWrap: "wrap" },
  searchBar: { padding: "10px 15px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.95rem", width: "100%", maxWidth: "350px", background: "white", outline: "none" },
  listContainer: { display: "flex", flexDirection: "column", gap: "12px" },
  listHeader: { display: "grid", gridTemplateColumns: "120px 2fr 1.2fr 80px 80px 1.2fr 150px", gap: "15px", padding: "0 25px", marginBottom: "5px", color: "#94a3b8", fontSize: "0.75rem", fontWeight: "700", textTransform: "uppercase" },
  listCard: { background: "white", borderRadius: "8px", display: "grid", gridTemplateColumns: "120px 2fr 1.2fr 80px 80px 1.2fr 150px", alignItems: "center", padding: "16px 25px", gap: "15px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" },
  codeText: { fontWeight: "700", color: "#3b82f6" },
  nameText: { fontWeight: "600", color: "#1e293b" },
  actionContainer: { display: "flex", gap: "8px", justifyContent: "flex-end" },
  btn: { padding: "8px 16px", borderRadius: "6px", border: "none", cursor: "pointer", fontWeight: "500" },
  primaryBtn: { background: "#3b82f6", color: "white" },
  editBtn: { background: "#e2e8f0", color: "#475569", padding: "6px 12px", borderRadius: "6px", border: "none", cursor: "pointer", fontSize: "0.85rem" },
  deleteBtn: { background: "#fee2e2", color: "#ef4444", padding: "6px 12px", borderRadius: "6px", border: "none", cursor: "pointer", fontSize: "0.85rem" },
  overlay: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 },
  modal: { backgroundColor: "#ffffff", padding: "30px", borderRadius: "12px", width: "550px", maxWidth: "90%", maxHeight: "90vh", overflowY: "auto" },
  label: { display: "block", marginBottom: "5px", fontWeight: "600", fontSize: "0.85rem", color: "#64748b" },
  input: { width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1", marginBottom: "15px", boxSizing: "border-box" },
  select: { width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1", marginBottom: "15px", background: "white", boxSizing: "border-box" }
};

export default function ModuleOverview() {
  // --- 1. DATA PARSING ---
  const userRole = (localStorage.getItem("userRole") || "guest").toLowerCase();
  
  const managedProgramIds = useMemo(() => {
    const raw = localStorage.getItem("managedProgramIds");
    try {
      const parsed = raw ? JSON.parse(raw) : [];
      // Force all IDs to strings to ensure "1" === 1
      return Array.isArray(parsed) ? parsed.map(id => String(id)) : [];
    } catch (e) { return []; }
  }, []);

  const isAdmin = userRole === "admin" || userRole === "pm";
  const isHoSP = userRole === "hosp";

  const [modules, setModules] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [formMode, setFormMode] = useState("overview");
  const [draft, setDraft] = useState({ 
    module_code: "", name: "", ects: 5, semester: 1, 
    room_type: "Lecture Classroom", assessment_type: "", 
    category: "Core", program_id: "" 
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [moduleToDelete, setModuleToDelete] = useState(null);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [modData, progData] = await Promise.all([api.getModules(), api.getPrograms()]);
      setModules(Array.isArray(modData) ? modData : []);
      setPrograms(Array.isArray(progData) ? progData : []);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  // --- 2. THE PERMISSION ENGINE ---
  const checkManagePermission = (module) => {
    if (isAdmin) return true;
    if (isHoSP) {
      // If module has no program_id, it's global and HoSP cannot edit it
      if (!module.program_id) return false;
      // Check if module's program is in HoSP's list
      return managedProgramIds.includes(String(module.program_id));
    }
    return false;
  };

  const handleSave = async () => {
    if (!draft.module_code || !draft.name) return alert("Code and Name are required.");
    try {
      if (formMode === "add") await api.createModule(draft);
      else await api.updateModule(draft.module_code, draft);
      setFormMode("overview");
      loadData();
    } catch (e) { alert("Action Failed. Check DB constraints."); }
  };

  const filteredModules = useMemo(() => {
    return modules.filter(m => 
      m.name.toLowerCase().includes(query.toLowerCase()) || 
      m.module_code.toLowerCase().includes(query.toLowerCase())
    );
  }, [modules, query]);

  if (loading) return <div style={{padding: "40px", textAlign: "center"}}>Loading Curriculum...</div>;

  return (
    <div style={styles.container}>
      {/* 3. PERMISSION DEBUGGER (Only visible for HoSP) */}
      {isHoSP && (
        <div style={{background: '#fefce8', border: '1px solid #fef08a', padding: '10px', borderRadius: '8px', marginBottom: '15px', fontSize: '0.8rem'}}>
          <strong>HoSP Debugger:</strong> Your managed Program IDs are: <code>{JSON.stringify(managedProgramIds)}</code>. 
          You can only edit modules where "Program ID" matches this list.
        </div>
      )}

      <div style={styles.controlsBar}>
        <input style={styles.searchBar} placeholder="Search modules..." value={query} onChange={(e) => setQuery(e.target.value)} />
        {(isAdmin || isHoSP) && (
          <button style={{...styles.btn, ...styles.primaryBtn}} onClick={() => {
            setDraft({ module_code: "", name: "", ects: 5, semester: 1, room_type: "Lecture Classroom", category: "Core", program_id: "" });
            setFormMode("add");
          }}> + Add Module </button>
        )}
      </div>

      <div style={styles.listHeader}>
        <div>Code</div><div>Name</div><div>Prog ID</div><div>Sem</div><div>ECTS</div><div>Room</div><div style={{textAlign:'right'}}>Actions</div>
      </div>

      <div style={styles.listContainer}>
        {filteredModules.map((m) => {
          const hasAccess = checkManagePermission(m);
          return (
            <div key={m.module_code} style={styles.listCard}>
              <div style={styles.codeText}>{m.module_code}</div>
              <div style={styles.nameText}>{m.name}</div>
              <div style={{color: '#64748b'}}>ID: {m.program_id || "None"}</div>
              <div style={{textAlign: 'center'}}>{m.semester}</div>
              <div style={{textAlign: 'center'}}>{m.ects}</div>
              <div style={{fontSize: '0.85rem'}}>{m.room_type}</div>
              
              <div style={styles.actionContainer}>
                {hasAccess ? (
                  <>
                    <button style={styles.editBtn} onClick={() => { setDraft(m); setFormMode("edit"); }}>Edit</button>
                    <button style={styles.deleteBtn} onClick={() => { setModuleToDelete(m); setShowDeleteModal(true); }}>Delete</button>
                  </>
                ) : (
                  <span style={{fontSize:'0.65rem', color:'#cbd5e1', fontWeight:'700'}}>VIEW ONLY</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* MODALS (ADD/EDIT/DELETE) */}
      {(formMode === "add" || formMode === "edit") && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <h3>{formMode === "add" ? "Create Module" : "Edit Module"}</h3>
            <label style={styles.label}>Module Code (Primary Key)</label>
            <input style={styles.input} disabled={formMode === "edit"} value={draft.module_code} onChange={e => setDraft({...draft, module_code: e.target.value})} />
            <label style={styles.label}>Module Name</label>
            <input style={styles.input} value={draft.name} onChange={e => setDraft({...draft, name: e.target.value})} />
            
            <label style={styles.label}>Assign to Program</label>
            <select style={styles.select} value={draft.program_id} onChange={e => setDraft({...draft, program_id: e.target.value})}>
              <option value="">-- No Program --</option>
              {programs.map(p => {
                const isForbidden = isHoSP && !managedProgramIds.includes(String(p.id));
                return <option key={p.id} value={p.id} disabled={isForbidden}>{p.name} {isForbidden ? "(Restricted)" : ""}</option>
              })}
            </select>

            <div style={{display:'flex', gap:'10px'}}>
              <button style={{...styles.btn, flex: 1}} onClick={() => setFormMode("overview")}>Cancel</button>
              <button style={{...styles.btn, ...styles.primaryBtn, flex: 1}} onClick={handleSave}>Save</button>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div style={styles.overlay}>
          <div style={{...styles.modal, width:'400px', textAlign:'center'}}>
            <h3 style={{color:'#ef4444'}}>Delete Module?</h3>
            <button style={styles.btn} onClick={() => setShowDeleteModal(false)}>Cancel</button>
            <button style={{...styles.btn, ...styles.deleteBtn, marginLeft:'10px'}} onClick={async () => {
               await api.deleteModule(moduleToDelete.module_code);
               setShowDeleteModal(false);
               loadData();
            }}>Confirm Delete</button>
          </div>
        </div>
      )}
    </div>
  );
}