import React, { useState, useEffect } from "react";
import api from "../api";

// --- STYLES (Clean & Professional) ---
const styles = {
  container: { padding: "20px", fontFamily: "'Inter', sans-serif", color: "#333", maxWidth: "100%" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "25px", borderBottom: "1px solid #e2e8f0", paddingBottom: "15px" },
  backBtn: { background: "transparent", border: "none", color: "#64748b", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", fontSize: "1rem", fontWeight: "600", marginBottom: "10px" },
  title: { margin: 0, fontSize: "1.75rem", color: "#1e293b", fontWeight: "700" },

  // Card Grid for List View
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "20px" },
  card: { background: "white", borderRadius: "12px", padding: "24px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)", border: "1px solid #e2e8f0", cursor: "pointer", transition: "transform 0.2s, box-shadow 0.2s" },
  cardHover: { transform: "translateY(-2px)", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)" },

  // Tabs
  tabContainer: { display: "flex", gap: "20px", marginBottom: "20px", borderBottom: "2px solid #e2e8f0" },
  tab: { padding: "12px 0", cursor: "pointer", fontSize: "1rem", color: "#64748b", fontWeight: "500", borderBottom: "2px solid transparent", marginBottom: "-2px" },
  activeTab: { color: "#3b82f6", borderBottom: "2px solid #3b82f6" },

  // Buttons & Inputs
  btn: { padding: "8px 16px", borderRadius: "6px", border: "none", cursor: "pointer", fontSize: "0.9rem", fontWeight: "500", transition: "0.2s" },
  primaryBtn: { background: "#3b82f6", color: "white" },
  dangerBtn: { background: "#ef4444", color: "white" },
  input: { width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.95rem", marginBottom: "15px" },

  // Badge
  badge: { padding: "4px 8px", borderRadius: "99px", fontSize: "0.75rem", fontWeight: "bold", textTransform: "uppercase", display: "inline-block" },
};

export default function ProgramOverview() {
  const [view, setView] = useState("LIST"); // LIST | DETAIL
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [programs, setPrograms] = useState([]);

  // Data for the active program
  const [specializations, setSpecializations] = useState([]);
  const [modules, setModules] = useState([]);

  useEffect(() => { loadPrograms(); }, []);

  const loadPrograms = () => {
    api.getPrograms().then(res => setPrograms(res.data || []));
  };

  const handleProgramClick = (prog) => {
    setSelectedProgram(prog);
    setView("DETAIL");
    // Load nested data for this program
    // In a real app, you might fetch specific specs/modules here
    api.getSpecializations().then(res => {
        // Filter purely frontend for now (assuming API returns all)
        setSpecializations(res.data.filter(s => s.program_id === prog.id));
    });
    api.getModules().then(res => {
        setModules(res.data.filter(m => m.program_id === prog.id));
    });
  };

  const handleBack = () => {
    setSelectedProgram(null);
    setView("LIST");
    loadPrograms(); // Refresh in case of changes
  };

  return (
    <div style={styles.container}>
      {view === "LIST" ? (
        <ProgramList
          programs={programs}
          onSelect={handleProgramClick}
          refresh={loadPrograms}
        />
      ) : (
        <ProgramWorkspace
          program={selectedProgram}
          specializations={specializations}
          modules={modules}
          onBack={handleBack}
          refreshSpecs={() => api.getSpecializations().then(res => setSpecializations(res.data.filter(s => s.program_id === selectedProgram.id)))}
        />
      )}
    </div>
  );
}

// --- SUB-COMPONENT: The List View ---
function ProgramList({ programs, onSelect, refresh }) {
  const [showCreate, setShowCreate] = useState(false);
  const [newProg, setNewProg] = useState({ name: "", acronym: "", head_of_program: "", total_ects: 180, level: "Bachelor" });

  const handleCreate = async () => {
    await api.createProgram({ ...newProg, start_date: new Date().toISOString().split('T')[0] });
    setShowCreate(false);
    refresh();
  };

  return (
    <div>
      <div style={styles.header}>
        <h2 style={styles.title}>Study Programs</h2>
        <button style={{ ...styles.btn, ...styles.primaryBtn }} onClick={() => setShowCreate(!showCreate)}>
          + New Program
        </button>
      </div>

      {showCreate && (
        <div style={{ background: "#f8fafc", padding: "20px", borderRadius: "8px", marginBottom: "20px", border: "1px dashed #cbd5e1" }}>
          <h4 style={{marginTop:0}}>Create New Program</h4>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: "10px" }}>
            <input style={styles.input} placeholder="Program Name" value={newProg.name} onChange={e => setNewProg({...newProg, name: e.target.value})} />
            <input style={styles.input} placeholder="Acronym (e.g. CS)" value={newProg.acronym} onChange={e => setNewProg({...newProg, acronym: e.target.value})} />
            <select style={styles.input} value={newProg.level} onChange={e => setNewProg({...newProg, level: e.target.value})}>
                <option>Bachelor</option><option>Master</option>
            </select>
          </div>
          <input style={styles.input} placeholder="Head of Program" value={newProg.head_of_program} onChange={e => setNewProg({...newProg, head_of_program: e.target.value})} />
          <button style={{...styles.btn, ...styles.primaryBtn}} onClick={handleCreate}>Create Program</button>
        </div>
      )}

      <div style={styles.grid}>
        {programs.map(p => (
          <div
            key={p.id}
            style={styles.card}
            onClick={() => onSelect(p)}
            onMouseEnter={e => { e.currentTarget.style.transform = styles.cardHover.transform; e.currentTarget.style.boxShadow = styles.cardHover.boxShadow; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = styles.card.boxShadow; }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
              <span style={{ ...styles.badge, background: p.level === "Master" ? "#ede9fe" : "#dbeafe", color: p.level === "Master" ? "#7c3aed" : "#2563eb" }}>
                {p.level}
              </span>
              <span style={{ color: "#94a3b8", fontSize: "0.85rem", fontWeight: "600" }}>{p.total_ects} ECTS</span>
            </div>
            <h3 style={{ margin: "0 0 5px 0", color: "#1e293b" }}>{p.name}</h3>
            <p style={{ margin: 0, color: "#64748b" }}>{p.acronym} • Head: {p.head_of_program}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- SUB-COMPONENT: The Detail Workspace ---
function ProgramWorkspace({ program, specializations, modules, onBack, refreshSpecs }) {
  const [activeTab, setActiveTab] = useState("INFO"); // INFO | SPECS | MODULES
  const [newSpec, setNewSpec] = useState("");

  const handleAddSpec = async () => {
    if (!newSpec) return;
    // Basic specialization creation
    await api.createSpecialization({
        name: newSpec,
        acronym: newSpec.substring(0,3).toUpperCase(),
        program_id: program.id,
        start_date: new Date().toISOString().split('T')[0]
    });
    setNewSpec("");
    refreshSpecs();
  };

  return (
    <div>
      <button style={styles.backBtn} onClick={onBack}>← Back to Programs</button>

      <div style={{ marginBottom: "20px" }}>
        <h1 style={{ ...styles.title, fontSize: "2rem" }}>{program.name}</h1>
        <div style={{ color: "#64748b", marginTop: "5px" }}>{program.level} • {program.acronym} • {program.head_of_program}</div>
      </div>

      {/* Tabs */}
      <div style={styles.tabContainer}>
        <div style={{ ...styles.tab, ...(activeTab === "INFO" ? styles.activeTab : {}) }} onClick={() => setActiveTab("INFO")}>
          General Info
        </div>
        <div style={{ ...styles.tab, ...(activeTab === "SPECS" ? styles.activeTab : {}) }} onClick={() => setActiveTab("SPECS")}>
          Specializations ({specializations.length})
        </div>
        <div style={{ ...styles.tab, ...(activeTab === "MODULES" ? styles.activeTab : {}) }} onClick={() => setActiveTab("MODULES")}>
          Curriculum ({modules.length} Modules)
        </div>
      </div>

      {/* Tab Content */}
      <div style={{ background: "white", padding: "30px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>

        {activeTab === "INFO" && (
          <div>
            <h3>Program Details</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", maxWidth: "600px" }}>
              <div>
                <label style={{ display: "block", color: "#64748b", fontSize: "0.85rem", marginBottom: "5px" }}>Program Name</label>
                <div style={{ fontSize: "1.1rem", fontWeight: "500" }}>{program.name}</div>
              </div>
              <div>
                <label style={{ display: "block", color: "#64748b", fontSize: "0.85rem", marginBottom: "5px" }}>Acronym</label>
                <div style={{ fontSize: "1.1rem", fontWeight: "500" }}>{program.acronym}</div>
              </div>
              <div>
                <label style={{ display: "block", color: "#64748b", fontSize: "0.85rem", marginBottom: "5px" }}>Head of Program</label>
                <div style={{ fontSize: "1.1rem", fontWeight: "500" }}>{program.head_of_program}</div>
              </div>
              <div>
                <label style={{ display: "block", color: "#64748b", fontSize: "0.85rem", marginBottom: "5px" }}>Total ECTS</label>
                <div style={{ fontSize: "1.1rem", fontWeight: "500" }}>{program.total_ects}</div>
              </div>
            </div>
            <div style={{ marginTop: "30px", padding: "15px", background: "#fff1f2", borderRadius: "8px", border: "1px solid #fecdd3" }}>
                <h4 style={{ margin: "0 0 10px 0", color: "#9f1239" }}>Danger Zone</h4>
                <button style={{ ...styles.btn, ...styles.dangerBtn }}>Delete Program</button>
            </div>
          </div>
        )}

        {activeTab === "SPECS" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h3>Specializations</h3>
              <div style={{ display: "flex", gap: "10px" }}>
                <input
                    placeholder="New Specialization Name"
                    value={newSpec}
                    onChange={e => setNewSpec(e.target.value)}
                    style={{ ...styles.input, marginBottom: 0, width: "250px" }}
                />
                <button style={{ ...styles.btn, ...styles.primaryBtn }} onClick={handleAddSpec}>Add</button>
              </div>
            </div>

            {specializations.length === 0 ? (
                <div style={{ padding: "40px", textAlign: "center", color: "#94a3b8", background: "#f8fafc", borderRadius: "8px" }}>
                    No specializations found. Add one above.
                </div>
            ) : (
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                        <tr style={{ borderBottom: "2px solid #e2e8f0", textAlign: "left" }}>
                            <th style={{ padding: "10px" }}>Acronym</th>
                            <th style={{ padding: "10px" }}>Name</th>
                            <th style={{ padding: "10px" }}>Status</th>
                            <th style={{ padding: "10px", textAlign: "right" }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {specializations.map(s => (
                            <tr key={s.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                                <td style={{ padding: "12px 10px", fontWeight: "600" }}>{s.acronym}</td>
                                <td style={{ padding: "12px 10px" }}>{s.name}</td>
                                <td style={{ padding: "12px 10px" }}>
                                    <span style={{ ...styles.badge, background: "#dcfce7", color: "#166534" }}>Active</span>
                                </td>
                                <td style={{ padding: "12px 10px", textAlign: "right" }}>
                                    <button style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", fontWeight: "600" }}>Remove</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
          </div>
        )}

        {activeTab === "MODULES" && (
          <div>
            <h3>Curriculum Structure</h3>
            <p style={{ color: "#64748b" }}>These are the modules currently linked to this program.</p>
            <div style={{ display: "grid", gap: "10px", marginTop: "20px" }}>
                {modules.map(m => (
                    <div key={m.module_code} style={{ padding: "15px", border: "1px solid #e2e8f0", borderRadius: "8px", display: "flex", justifyContent: "space-between" }}>
                        <div>
                            <strong>{m.module_code}</strong> - {m.name}
                        </div>
                        <div style={{ color: "#64748b" }}>
                            Semester {m.semester} • {m.ects} ECTS
                        </div>
                    </div>
                ))}
                {modules.length === 0 && <div style={{ color: "#94a3b8" }}>No modules assigned yet. Go to the "Modules" page to assign them.</div>}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}