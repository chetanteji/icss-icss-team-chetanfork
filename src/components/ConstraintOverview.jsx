import { useEffect, useState } from "react";
import api from "../api";

const styles = {
  container: { padding: "20px", fontFamily: "'Inter', 'Segoe UI', sans-serif", maxWidth: "1200px", margin: "0 auto", color: "#334155" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px", borderBottom: "1px solid #e2e8f0", paddingBottom: "20px" },
  title: { margin: 0, fontSize: "1.75rem", fontWeight: "700", color: "#0f172a" },
  subtitle: { margin: "5px 0 0 0", color: "#64748b", fontSize: "0.95rem" },

  btn: { padding: "10px 18px", borderRadius: "8px", border: "none", cursor: "pointer", fontSize: "0.9rem", fontWeight: "600", transition: "all 0.2s", display: "inline-flex", alignItems: "center", gap: "6px" },
  primaryBtn: { background: "#2563eb", color: "white", boxShadow: "0 2px 4px rgba(37,99,235,0.2)" },
  secondaryBtn: { background: "#f1f5f9", color: "#475569", border: "1px solid #cbd5e1" },
  deleteBtn: { background: "#fee2e2", color: "#ef4444", padding: "6px 12px", fontSize: "0.85rem" },
  editBtn: { background: "#f8fafc", color: "#475569", border: "1px solid #e2e8f0", padding: "6px 12px", fontSize: "0.85rem", marginRight: "6px" },

  tableContainer: { border: "1px solid #e2e8f0", borderRadius: "10px", overflow: "hidden", boxShadow: "0 1px 2px rgba(0,0,0,0.05)" },
  table: { width: "100%", borderCollapse: "collapse", background: "white", fontSize: "0.95rem" },
  th: { background: "#f8fafc", padding: "14px 16px", textAlign: "left", fontSize: "0.8rem", fontWeight: "700", color: "#475569", textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: "1px solid #e2e8f0" },
  td: { padding: "14px 16px", borderBottom: "1px solid #f1f5f9", color: "#334155" },

  modalOverlay: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(15, 23, 42, 0.6)", backdropFilter: "blur(2px)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 },
  modalContent: { background: "white", padding: "32px", borderRadius: "16px", width: "700px", maxWidth: "95%", maxHeight: "90vh", overflowY: "auto", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)" },

  sectionLabel: { fontSize: "0.85rem", fontWeight: "700", color: "#64748b", marginBottom: "12px", textTransform: "uppercase", letterSpacing: "0.05em" },
  formRow: { display: "flex", gap: "20px", marginBottom: "16px" },
  formGroup: { marginBottom: "16px", flex: 1 },
  label: { display: "block", marginBottom: "8px", fontWeight: "600", fontSize: "0.9rem", color: "#334155" },
  input: { width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.95rem", transition: "border-color 0.2s", boxSizing: "border-box", outline: "none" },
  select: { width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.95rem", background: "white", cursor: "pointer", outline: "none" },

  builderBox: { background: "#f8fafc", border: "1px solid #e2e8f0", padding: "20px", borderRadius: "10px", marginBottom: "20px" },
  generatedBox: { background: "#eff6ff", border: "1px solid #dbeafe", padding: "16px", borderRadius: "8px", marginTop: "4px" },
  generatedText: { width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #bfdbfe", fontSize: "0.95rem", fontFamily: "inherit", background: "white", minHeight: "80px", resize: "vertical", color: "#1e3a8a" },

  badge: { display: "inline-block", padding: "2px 8px", borderRadius: "12px", fontSize: "0.75rem", fontWeight: "600", textTransform: "uppercase" },

  // Checkbox Grid
  checkboxGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))", gap: "10px", marginTop: "8px" },
  checkboxLabel: { display: "flex", alignItems: "center", gap: "6px", fontSize: "0.9rem", cursor: "pointer" }
};

const formatDate = (isoDate) => isoDate ? isoDate.split("T")[0] : "";

// --- CONFIGURATION ---
const SCOPE_CATEGORIES = {
    University: [
        { value: "University Open Days", label: "University Open Days" },
        { value: "University Policy", label: "University Policy (Opening Hours)" },
        { value: "Academic Calendar", label: "Academic Calendar (Semester Dates)" },
        { value: "Holiday", label: "Holiday / Break" },
        { value: "Time Definition", label: "Time Definition (Lecture Slots)" },
        { value: "Custom", label: "Custom" }
    ],
    Lecturer: [
        { value: "Unavailable Days", label: "Unavailable Days" },
        { value: "Legal Requirement", label: "Legal Requirement (Workload)" },
        { value: "Custom", label: "Custom" }
    ],
    Module: [
        { value: "Delivery Mode", label: "Delivery Mode" },
        { value: "Duration", label: "Duration" },
        { value: "Room Requirement", label: "Room Requirement" },
        { value: "Custom", label: "Custom" }
    ],
    Group: [
        { value: "Custom", label: "Custom" }
    ],
    Room: [
         { value: "Unavailable Days", label: "Availability" },
         { value: "Custom", label: "Custom" }
    ],
    Program: [
        { value: "Delivery Mode", label: "Delivery Mode" },
        { value: "Custom", label: "Custom" }
    ]
};

const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default function ConstraintOverview() {
  const [constraints, setConstraints] = useState([]);
  const [targets, setTargets] = useState({
    LECTURER: [], GROUP: [], MODULE: [], ROOM: [], PROGRAM: [],
    UNIVERSITY: [{ id: 0, name: "Entire University" }],
  });

  const [roomTypes, setRoomTypes] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // DRAFT STATE
  const [draft, setDraft] = useState({
    name: "",
    category: "Custom",
    scope: "University",
    target_id: "0",
    valid_from: "",
    valid_to: "",
    rule_text: "",
    is_enabled: true
  });

  // BUILDER STATE
  const [builder, setBuilder] = useState({
    day: "Friday",
    roomType: "",
    limit: "4 hours",
    gap: "at least 1 hour",
    startTime: "08:00",
    endTime: "20:00",
    slotDuration: "90",
    breakDuration: "15",
    workloadLimit: "18",
    semesterSeason: "Winter",
    semesterYear: new Date().getFullYear(),

    deliveryMode: "Onsite",
    holidayName: "Public Holiday",
    customDuration: "180",

    // Multi-select for open days
    selectedDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
  });

  useEffect(() => { loadData(); }, []);

  // --- AUTO-GENERATOR ---
  useEffect(() => {
    if (!modalOpen) return;

    const targetList = targets[draft.scope.toUpperCase()] || [];
    const targetObj = targetList.find(t => String(t.id) === String(draft.target_id));
    const targetName = targetObj ? targetObj.name : "All Entities";

    let entity = `${draft.scope} "${targetName}"`;
    if (draft.target_id === "0" || draft.target_id === 0) {
        if (draft.scope === "University") entity = "The University";
        else entity = `All ${draft.scope}s`;
    }

    let generatedText = "";

    switch (draft.category) {
      // University
      case "University Open Days":
        const daysText = builder.selectedDays.length > 0 ? builder.selectedDays.join(", ") : "No Days";
        generatedText = `The University is open on: ${daysText}.`;
        break;
      case "University Policy":
        generatedText = `The University is open from ${builder.startTime} to ${builder.endTime}.`;
        break;
      case "Academic Calendar":
        generatedText = `${builder.semesterSeason} Semester ${builder.semesterYear} starts on ${draft.valid_from || '[Date]'} and ends on ${draft.valid_to || '[Date]'}.`;
        break;
      case "Holiday":
        generatedText = `Holiday '${builder.holidayName}' is from ${draft.valid_from || '[Date]'} to ${draft.valid_to || '[Date]'}.`;
        break;
      case "Time Definition":
        generatedText = `Standard lecture slots are ${builder.slotDuration} minutes long with a ${builder.breakDuration} minute break.`;
        break;

      // Lecturer
      case "Unavailable Days":
        generatedText = `${entity} is unavailable on ${builder.day}s.`;
        break;
      case "Legal Requirement":
        // Uses the specific entity name now (e.g. "Lecturer 'Smith'")
        generatedText = `${entity} must not exceed ${builder.workloadLimit} teaching units per week.`;
        break;

      // Module / Program
      case "Delivery Mode":
        generatedText = `${entity} must be conducted ${builder.deliveryMode}.`;
        break;
      case "Duration":
        generatedText = `${entity} has a specific duration of ${builder.customDuration} minutes.`;
        break;
      case "Room Requirement":
        generatedText = `${entity} requires a room of type '${builder.roomType}'.`;
        break;

      default:
        return;
    }

    setDraft(prev => ({ ...prev, rule_text: generatedText }));

  }, [
    draft.category, draft.scope, draft.target_id, draft.valid_from, draft.valid_to,
    builder, modalOpen, targets
  ]);

  async function loadData() {
    try {
      const [cRes, lRes, gRes, mRes, rRes, pRes] = await Promise.all([
        api.getConstraints(),
        api.getLecturers(),
        api.getGroups(),
        api.getModules(),
        api.getRooms(),
        api.getPrograms()
      ]);

      setConstraints(cRes || []);

      const uniqueRoomTypes = [...new Set((rRes || []).map(r => r.type))].filter(Boolean);
      setRoomTypes(uniqueRoomTypes);

      setTargets({
        LECTURER: (lRes || []).map(x => ({ id: x.id, name: `${x.first_name} ${x.last_name}` })),
        GROUP: (gRes || []).map(x => ({ id: x.id, name: x.name })),
        MODULE: (mRes || []).map(x => ({ id: x.module_code, name: x.name })),
        ROOM: (rRes || []).map(x => ({ id: x.id, name: x.name })),
        PROGRAM: (pRes || []).map(x => ({ id: x.id, name: x.name })),
        UNIVERSITY: [{ id: 0, name: "Entire University" }]
      });

      if (uniqueRoomTypes.length > 0) {
        setBuilder(prev => ({ ...prev, roomType: uniqueRoomTypes[0] }));
      }

    } catch (e) { console.error("Load Error", e); }
  }

  function openAdd() {
    setEditingId(null);
    setDraft({
      name: "", category: "University Policy", scope: "University", target_id: "0",
      valid_from: "", valid_to: "", rule_text: "", is_enabled: true
    });
    setBuilder(prev => ({
        ...prev,
        day: "Friday",
        limit: "4 hours",
        gap: "at least 1 hour",
        startTime: "08:00",
        endTime: "20:00",
        semesterSeason: "Winter",
        semesterYear: new Date().getFullYear(),
        slotDuration: "90",
        breakDuration: "15",
        workloadLimit: "18",
        deliveryMode: "Onsite",
        holidayName: "Public Holiday",
        customDuration: "180",
        selectedDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
    }));
    setModalOpen(true);
  }

  function openEdit(c) {
    setEditingId(c.id);
    setDraft({
      ...c,
      target_id: String(c.target_id || "0"),
      valid_from: formatDate(c.valid_from),
      valid_to: formatDate(c.valid_to)
    });
    setModalOpen(true);
  }

  async function save() {
    try {
      const payload = {
        ...draft,
        target_id: Number(draft.target_id),
        valid_from: draft.valid_from || null,
        valid_to: draft.valid_to || null,
      };

      if (editingId) await api.updateConstraint(editingId, payload);
      else await api.createConstraint(payload);

      setModalOpen(false);
      loadData();
    } catch (e) { alert("Error saving constraint."); }
  }

  const handleScopeChange = (newScope) => {
      const allowedCategories = SCOPE_CATEGORIES[newScope] || SCOPE_CATEGORIES["University"];
      const defaultCategory = allowedCategories[0].value;

      setDraft({
          ...draft,
          scope: newScope,
          target_id: "0",
          category: defaultCategory
      });
  };

  const handleCategoryChange = (newCategory) => {
    let newTarget = draft.target_id;
    if (newCategory === "Legal Requirement" && draft.scope === "Lecturer") {
        newTarget = "0";
    }
    setDraft({ ...draft, category: newCategory, target_id: newTarget });
  };

  const toggleDay = (day) => {
      setBuilder(prev => {
          const days = prev.selectedDays.includes(day)
            ? prev.selectedDays.filter(d => d !== day)
            : [...prev.selectedDays, day];

          // Sort days to match week order
          const sorter = { "Monday": 1, "Tuesday": 2, "Wednesday": 3, "Thursday": 4, "Friday": 5, "Saturday": 6, "Sunday": 7 };
          days.sort((a,b) => sorter[a] - sorter[b]);

          return { ...prev, selectedDays: days };
      });
  };

  const renderBuilderInputs = () => {
    // 1. UNIVERSITY OPEN DAYS (Multi-Select)
    if (draft.category === "University Open Days") {
        return (
            <div>
                <label style={{...styles.label, marginBottom:'10px'}}>Select Open Days:</label>
                <div style={styles.checkboxGrid}>
                    {DAYS_OF_WEEK.map(day => (
                        <label key={day} style={styles.checkboxLabel}>
                            <input
                                type="checkbox"
                                checked={builder.selectedDays.includes(day)}
                                onChange={() => toggleDay(day)}
                            />
                            {day}
                        </label>
                    ))}
                </div>
            </div>
        );
    }

    if (draft.category === "University Policy") {
        return (
            <div style={{display:'flex', gap:'12px', alignItems:'center'}}>
                <span>Open from</span>
                <input type="time" style={{...styles.input, width:'auto'}} value={builder.startTime} onChange={e => setBuilder({...builder, startTime: e.target.value})} />
                <span>to</span>
                <input type="time" style={{...styles.input, width:'auto'}} value={builder.endTime} onChange={e => setBuilder({...builder, endTime: e.target.value})} />
            </div>
        );
    }

    // ACADEMIC CALENDAR (Integrated Dates)
    if (draft.category === "Academic Calendar") {
        return (
            <div>
                <div style={{display:'flex', gap:'12px', alignItems:'center', marginBottom:'10px'}}>
                    <select style={{...styles.select, width:'auto'}} value={builder.semesterSeason} onChange={e => setBuilder({...builder, semesterSeason: e.target.value})}>
                        <option value="Winter">Winter</option>
                        <option value="Summer">Summer</option>
                    </select>
                    <select style={{...styles.select, width:'auto'}} value={builder.semesterYear} onChange={e => setBuilder({...builder, semesterYear: e.target.value})}>
                        {[0,1,2,3].map(i => {
                            const y = new Date().getFullYear() + i;
                            return <option key={y} value={y}>{y}</option>;
                        })}
                    </select>
                </div>
                <div style={styles.formRow}>
                   <div style={{flex:1}}>
                     <label style={styles.label}>Start Date</label>
                     <input type="date" style={styles.input} value={draft.valid_from} onChange={e => setDraft({...draft, valid_from: e.target.value})} />
                   </div>
                   <div style={{flex:1}}>
                     <label style={styles.label}>End Date</label>
                     <input type="date" style={styles.input} value={draft.valid_to} onChange={e => setDraft({...draft, valid_to: e.target.value})} />
                   </div>
                </div>
            </div>
        );
    }

    // HOLIDAY (Integrated Dates)
    if (draft.category === "Holiday") {
        return (
            <div>
                <div style={{marginBottom:'10px'}}>
                    <label style={styles.label}>Holiday Name</label>
                    <input style={styles.input} placeholder="e.g. Christmas Break" value={builder.holidayName} onChange={e => setBuilder({...builder, holidayName: e.target.value})} />
                </div>
                <div style={styles.formRow}>
                   <div style={{flex:1}}>
                     <label style={styles.label}>Start Date</label>
                     <input type="date" style={styles.input} value={draft.valid_from} onChange={e => setDraft({...draft, valid_from: e.target.value})} />
                   </div>
                   <div style={{flex:1}}>
                     <label style={styles.label}>End Date</label>
                     <input type="date" style={styles.input} value={draft.valid_to} onChange={e => setDraft({...draft, valid_to: e.target.value})} />
                   </div>
                </div>
            </div>
        );
    }

    if (draft.category === "Time Definition") {
        return (
            <div style={{display:'flex', gap:'15px', alignItems:'center', flexWrap:'wrap'}}>
                <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
                    <span>Slot Duration:</span>
                    <select style={{...styles.select, width:'auto'}} value={builder.slotDuration} onChange={e => setBuilder({...builder, slotDuration: e.target.value})}>
                        <option value="45">45 mins</option>
                        <option value="60">60 mins</option>
                        <option value="90">90 mins</option>
                    </select>
                </div>
                <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
                    <span>Break:</span>
                    <select style={{...styles.select, width:'auto'}} value={builder.breakDuration} onChange={e => setBuilder({...builder, breakDuration: e.target.value})}>
                        <option value="0">None</option>
                        <option value="15">15 mins</option>
                        <option value="30">30 mins</option>
                    </select>
                </div>
            </div>
        );
    }
    if (draft.category === "Legal Requirement") {
        return (
            <div style={{display:'flex', gap:'12px', alignItems:'center'}}>
                <span>Max Weekly Workload:</span>
                <input type="number" style={{...styles.input, width:'100px'}} value={builder.workloadLimit} onChange={e => setBuilder({...builder, workloadLimit: e.target.value})} />
                <span>Teaching Units (UE)</span>
            </div>
        );
    }
    if (draft.category === "Delivery Mode") {
        return (
            <div style={{display:'flex', gap:'12px', alignItems:'center'}}>
                <span>Mode:</span>
                <select style={{...styles.select, width:'auto'}} value={builder.deliveryMode} onChange={e => setBuilder({...builder, deliveryMode: e.target.value})}>
                    <option value="Onsite">Onsite (In Person)</option>
                    <option value="Online">Online (Remote)</option>
                    <option value="Hybrid">Hybrid</option>
                </select>
            </div>
        );
    }
    if (draft.category === "Duration") {
        return (
            <div style={{display:'flex', gap:'12px', alignItems:'center'}}>
                <span>Specific Duration:</span>
                <input type="number" style={{...styles.input, width:'100px'}} value={builder.customDuration} onChange={e => setBuilder({...builder, customDuration: e.target.value})} />
                <span>minutes</span>
            </div>
        );
    }
    if (draft.category === "Unavailable Days") {
        return (
            <div style={{display:'flex', gap:'12px', alignItems:'center'}}>
                <select style={{...styles.select, width:'auto'}} value={builder.day} onChange={e => setBuilder({...builder, day: e.target.value})}>
                    {DAYS_OF_WEEK.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                <span>is unavailable / closed.</span>
            </div>
        );
    }
    if (draft.category === "Room Requirement") {
        return (
            <div style={{display:'flex', gap:'12px', alignItems:'center'}}>
                <span>Requires a room of type:</span>
                <select style={{...styles.select, width:'auto'}} value={builder.roomType} onChange={e => setBuilder({...builder, roomType: e.target.value})}>
                    {roomTypes.length > 0 ? (
                        roomTypes.map(r => <option key={r} value={r}>{r}</option>)
                    ) : (
                        <option disabled>No room types found</option>
                    )}
                </select>
            </div>
        );
    }

    return <div style={{color:'#64748b', fontStyle:'italic'}}>Use the text box below to describe a custom rule.</div>;
  };

  const currentCategories = SCOPE_CATEGORIES[draft.scope] || SCOPE_CATEGORIES["University"];
  const showGenericValidity = !["Academic Calendar", "Holiday"].includes(draft.category);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>Scheduler Constraints</h2>
          <p style={styles.subtitle}>Define rules, policies, and preferences for the scheduling AI.</p>
        </div>
        <button style={{...styles.btn, ...styles.primaryBtn}} onClick={openAdd}>+ New Rule</button>
      </div>

      <div style={styles.tableContainer}>
        <table style={styles.table}>
            <thead style={{background:'#f8fafc'}}>
            <tr>
                <th style={styles.th}>Rule Name</th>
                <th style={styles.th}>Scope & Target</th>
                <th style={styles.th}>Description</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Action</th>
            </tr>
            </thead>
            <tbody>
            {constraints.length === 0 && (
                <tr><td colSpan="5" style={{...styles.td, textAlign:'center', color:'#94a3b8', padding:'30px'}}>No rules defined yet.</td></tr>
            )}
            {constraints.map(c => {
                const targetName = (targets[c.scope?.toUpperCase()] || []).find(t => String(t.id) === String(c.target_id))?.name || "All";
                const isGlobal = c.target_id === 0;

                return (
                <tr key={c.id}>
                    <td style={styles.td}>
                        <div style={{fontWeight:'600', color:'#0f172a'}}>{c.name}</div>
                        <div style={{fontSize:'0.8rem', color:'#64748b'}}>{c.category}</div>
                    </td>
                    <td style={styles.td}>
                        <span style={{...styles.badge, background:'#e2e8f0', color:'#475569'}}>{c.scope}</span>
                        {!isGlobal && <div style={{marginTop:'4px', fontSize:'0.9rem', fontWeight:'500'}}>{targetName}</div>}
                    </td>
                    <td style={styles.td}>
                        <div style={{fontSize:'0.9rem', color:'#334155', lineHeight:'1.4'}}>
                            "{c.rule_text}"
                        </div>
                        {c.valid_from && (
                            <div style={{fontSize:'0.8rem', color:'#64748b', marginTop:'4px'}}>
                                📅 {formatDate(c.valid_from)} → {formatDate(c.valid_to)}
                            </div>
                        )}
                    </td>
                    <td style={styles.td}>
                        <span style={{
                            ...styles.badge,
                            background: c.is_enabled ? '#dcfce7' : '#f1f5f9',
                            color: c.is_enabled ? '#166534' : '#94a3b8'
                        }}>
                            {c.is_enabled ? "Active" : "Disabled"}
                        </span>
                    </td>
                    <td style={styles.td}>
                        <div style={{display:'flex'}}>
                            <button style={{...styles.btn, ...styles.editBtn}} onClick={() => openEdit(c)}>Edit</button>
                            <button style={{...styles.btn, ...styles.deleteBtn}} onClick={() => api.deleteConstraint(c.id).then(loadData)}>Delete</button>
                        </div>
                    </td>
                </tr>
                );
            })}
            </tbody>
        </table>
      </div>

      {modalOpen && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
             <div style={{display:'flex', justifyContent:'space-between', marginBottom:'20px'}}>
                <h3 style={{margin:0, fontSize:'1.25rem', color:'#0f172a'}}>{editingId ? "Edit Rule" : "Create New Rule"}</h3>
                <button onClick={() => setModalOpen(false)} style={{border:'none', background:'transparent', fontSize:'1.5rem', cursor:'pointer', color:'#94a3b8'}}>×</button>
             </div>

             {/* 1. NAME */}
             <div style={styles.formGroup}>
                <label style={styles.label}>Rule Name</label>
                <input
                  style={styles.input}
                  placeholder="e.g. Winter Semester Dates"
                  value={draft.name}
                  onChange={e => setDraft({...draft, name: e.target.value})}
                />
             </div>

             {/* 2. CONTEXT */}
             <div style={styles.formRow}>
               <div style={{flex:1}}>
                  <label style={styles.label}>Scope (Who does this apply to?)</label>
                  <select style={styles.select} value={draft.scope} onChange={e => handleScopeChange(e.target.value)}>
                    {Object.keys(SCOPE_CATEGORIES).map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
               </div>
               <div style={{flex:1}}>
                  <label style={styles.label}>Target</label>
                  <select style={styles.select} value={draft.target_id} onChange={e => setDraft({...draft, target_id: e.target.value})}>
                    <option value="0">-- All / Global --</option>
                    {(targets[draft.scope.toUpperCase()] || []).map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
               </div>
             </div>

             {/* 3. BUILDER */}
             <div style={styles.builderBox}>
                <div style={{marginBottom:'15px'}}>
                    <label style={styles.label}>Rule Category</label>
                    <select style={styles.select} value={draft.category} onChange={e => handleCategoryChange(e.target.value)}>
                        {currentCategories.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                </div>

                <div style={{background:'white', padding:'15px', borderRadius:'8px', border:'1px solid #e2e8f0'}}>
                    {renderBuilderInputs()}
                </div>
             </div>

             {/* 4. RESULT */}
             <div style={styles.generatedBox}>
                <label style={{...styles.label, color:'#1e40af', fontSize:'0.85rem'}}>Generated Rule Description</label>
                <textarea
                  style={styles.generatedText}
                  value={draft.rule_text}
                  onChange={e => setDraft({...draft, rule_text: e.target.value})}
                />
                <div style={{fontSize:'0.8rem', color:'#64748b', marginTop:'6px', display:'flex', justifyContent:'space-between'}}>
                    <label style={{cursor:'pointer', fontWeight:'600', color:'#0f172a', display:'flex', alignItems:'center', gap:'6px'}}>
                        <input type="checkbox" checked={draft.is_enabled} onChange={e => setDraft({...draft, is_enabled: e.target.checked})} />
                        Active Rule
                    </label>
                </div>
             </div>

             {/* 5. GENERIC VALIDITY (Only shown if NOT Academic Calendar/Holiday) */}
             {showGenericValidity && (
                 <div style={{marginTop:'20px', borderTop:'1px solid #e2e8f0', paddingTop:'15px'}}>
                     <div style={styles.sectionLabel}>Validity Window (Optional)</div>
                     <div style={styles.formRow}>
                       <div style={{flex:1}}>
                         <label style={styles.label}>Valid From</label>
                         <input type="date" style={styles.input} value={draft.valid_from} onChange={e => setDraft({...draft, valid_from: e.target.value})} />
                       </div>
                       <div style={{flex:1}}>
                         <label style={styles.label}>Valid To</label>
                         <input type="date" style={styles.input} value={draft.valid_to} onChange={e => setDraft({...draft, valid_to: e.target.value})} />
                       </div>
                     </div>
                 </div>
             )}

             <div style={{display:'flex', justifyContent:'flex-end', gap:'12px', marginTop:'24px'}}>
               <button style={{...styles.btn, ...styles.secondaryBtn}} onClick={() => setModalOpen(false)}>Cancel</button>
               <button style={{...styles.btn, ...styles.primaryBtn}} onClick={save}>Save Rule</button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}