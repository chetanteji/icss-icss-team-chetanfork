import { useEffect, useState } from "react";
import api from "../api";

export default function ScheduleOverview() {
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [formMode, setFormMode] = useState("overview"); // overview | add | edit
  const [editingId, setEditingId] = useState(null);

  const [draft, setDraft] = useState({
    moduleName: "",
    roomType: "lecture",
    sessionsPerWeek: 1,
    semester: 1,
    totalSessions: 14,
    classDuration: 90,
    numberOfStudents: 25,
    onsiteOnline: "Hybrid",
  });

  async function loadModules() {
    setLoading(true);
    setLoadError("");
    try {
      const data = await api.getModules();
      setModules(Array.isArray(data) ? data : []);
    } catch (e) {
      setLoadError(e?.message || "Failed to load modules");
      setModules([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadModules();
  }, []);

  function openAdd() {
    setEditingId(null);
    setDraft({
      moduleName: "",
      roomType: "lecture",
      sessionsPerWeek: 1,
      semester: 1,
      totalSessions: 14,
      classDuration: 90,
      numberOfStudents: 25,
      onsiteOnline: "Hybrid",
    });
    setFormMode("add");
  }

  function openEdit(row) {
    setEditingId(row.module_id);
    setDraft({
      moduleName: row.module_name,
      roomType: row.room_type,
      sessionsPerWeek: row.sessions_per_week,
      semester: row.semester,
      totalSessions: row.total_sessions,
      classDuration: row.class_duration,
      numberOfStudents: row.number_of_students,
      onsiteOnline: row.onsite_online,
    });
    setFormMode("edit");
  }

  async function save() {
    if (!draft.moduleName.trim()) return alert("Module name is required");

    const payload = {
      module_name: draft.moduleName.trim(),
      room_type: draft.roomType,
      sessions_per_week: Number(draft.sessionsPerWeek),
      semester: Number(draft.semester),
      total_sessions: Number(draft.totalSessions),
      class_duration: Number(draft.classDuration),
      number_of_students: Number(draft.numberOfStudents),
      onsite_online: draft.onsiteOnline,
    };

    try {
      if (formMode === "add") {
        await api.createModule(payload);
      } else {
        await api.updateModule(editingId, payload);
      }
      await loadModules();
      setFormMode("overview");
      setEditingId(null);
    } catch (e) {
      console.error(e);
      alert("Backend error while saving module.");
    }
  }

  async function remove(id) {
    const ok = window.confirm("Delete this module?");
    if (!ok) return;

    try {
      await api.deleteModule(id);
      await loadModules();
    } catch (e) {
      console.error(e);
      alert("Backend error while deleting module.");
    }
  }

  return (
    <div className="panel">
      <div className="panel-header">
        <h2>Schedule Overview (Modules)</h2>

        <div style={{ display: "flex", gap: 10 }}>
          <button className="add-btn" onClick={loadModules} type="button">
            ↻ Refresh
          </button>
          {formMode === "overview" && (
            <button className="add-btn" onClick={openAdd} type="button">
              + Add Module
            </button>
          )}
        </div>
      </div>

      {loading && <p style={{ marginTop: 10, fontSize: 13 }}>Loading modules...</p>}

      {loadError && (
        <p style={{ marginTop: 10, fontSize: 13, color: "crimson" }}>
          Backend error: {loadError}
        </p>
      )}

      {!loading && !loadError && formMode === "overview" && (
        <table>
          <thead>
            <tr>
              <th>Module ID</th>
              <th>Module Name</th>
              <th>Room Type</th>
              <th>Sessions/Week</th>
              <th>Semester</th>
              <th>Total Sessions</th>
              <th>Class Duration</th>
              <th># Students</th>
              <th>Onsite/Online</th>
              <th style={{ width: 170 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {modules.map((m) => (
              <tr key={m.module_id}>
                <td>{m.module_id}</td>
                <td>{m.module_name}</td>
                <td>{m.room_type}</td>
                <td>{m.sessions_per_week}</td>
                <td>{m.semester}</td>
                <td>{m.total_sessions}</td>
                <td>{m.class_duration}</td>
                <td>{m.number_of_students}</td>
                <td>{m.onsite_online}</td>
                <td>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => openEdit(m)} type="button">
                      Edit
                    </button>
                    <button onClick={() => remove(m.module_id)} type="button">
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {(formMode === "add" || formMode === "edit") && (
        <div className="form">
          <label>
            Module Name:
            <input
              value={draft.moduleName}
              onChange={(e) => setDraft({ ...draft, moduleName: e.target.value })}
              placeholder="e.g., Databases"
            />
          </label>

          <label>
            Room Type:
            <input
              value={draft.roomType}
              onChange={(e) => setDraft({ ...draft, roomType: e.target.value })}
              placeholder="lecture / lab"
            />
          </label>

          <label>
            Sessions/Week:
            <input
              type="number"
              value={draft.sessionsPerWeek}
              onChange={(e) => setDraft({ ...draft, sessionsPerWeek: e.target.value })}
            />
          </label>

          <label>
            Semester:
            <input
              type="number"
              value={draft.semester}
              onChange={(e) => setDraft({ ...draft, semester: e.target.value })}
            />
          </label>

          <label>
            Total Sessions:
            <input
              type="number"
              value={draft.totalSessions}
              onChange={(e) => setDraft({ ...draft, totalSessions: e.target.value })}
            />
          </label>

          <label>
            Class Duration (min):
            <input
              type="number"
              value={draft.classDuration}
              onChange={(e) => setDraft({ ...draft, classDuration: e.target.value })}
            />
          </label>

          <label>
            # Students:
            <input
              type="number"
              value={draft.numberOfStudents}
              onChange={(e) => setDraft({ ...draft, numberOfStudents: e.target.value })}
            />
          </label>

          <label>
            Onsite/Online:
            <input
              value={draft.onsiteOnline}
              onChange={(e) => setDraft({ ...draft, onsiteOnline: e.target.value })}
              placeholder="Onsite / Online / Hybrid"
            />
          </label>

          <div className="buttons">
            <button onClick={() => setFormMode("overview")} type="button">
              Cancel
            </button>
            <button className="save" onClick={save} type="button">
              {formMode === "add" ? "Create" : "Update"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
