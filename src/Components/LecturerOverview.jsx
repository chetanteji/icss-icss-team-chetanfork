import { useEffect, useState } from "react";
import api from "../api";

export default function LecturerOverview() {
  const [lecturers, setLecturers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [formMode, setFormMode] = useState("overview"); // overview | add | edit
  const [editingId, setEditingId] = useState(null);

  const [draft, setDraft] = useState({
    fullName: "",
    domain: "",
    employmentType: "Full-time",
    personalEmail: "",
    mdhEmail: "",
  });

  async function loadLecturers() {
    setLoading(true);
    setLoadError("");
    try {
      const data = await api.getLecturers();
      const mapped = (Array.isArray(data) ? data : []).map((x) => ({
        id: x.id,
        fullName: x.full_name,
        domain: x.domain,
        employmentType: x.employment_type,
        personalEmail: x.personal_email || "",
        mdhEmail: x.mdh_email || "",
      }));
      setLecturers(mapped);
    } catch (e) {
      setLoadError(e?.message || "Failed to load lecturers");
      setLecturers([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadLecturers();
  }, []);

  function openAdd() {
    setEditingId(null);
    setDraft({
      fullName: "",
      domain: "",
      employmentType: "Full-time",
      personalEmail: "",
      mdhEmail: "",
    });
    setFormMode("add");
  }

  function openEdit(row) {
    setEditingId(row.id);
    setDraft({
      fullName: row.fullName || "",
      domain: row.domain || "",
      employmentType: row.employmentType || "Full-time",
      personalEmail: row.personalEmail || "",
      mdhEmail: row.mdhEmail || "",
    });
    setFormMode("edit");
  }

  async function save() {
    if (!draft.fullName.trim()) return alert("Full Name is required");
    if (!draft.domain.trim()) return alert("Domain is required");

    const payload = {
      full_name: draft.fullName.trim(),
      domain: draft.domain.trim(),
      employment_type: draft.employmentType,
      personal_email: draft.personalEmail.trim() || null,
      mdh_email: draft.mdhEmail.trim() || null,
    };

    try {
      if (formMode === "add") {
        await api.createLecturer(payload);
      } else {
        await api.updateLecturer(editingId, payload);
      }
      await loadLecturers();
      setFormMode("overview");
      setEditingId(null);
    } catch (e) {
      console.error(e);
      alert("Backend error while saving lecturer.");
    }
  }

  async function remove(id) {
    const ok = window.confirm("Delete this lecturer?");
    if (!ok) return;

    try {
      await api.deleteLecturer(id);
      await loadLecturers();
    } catch (e) {
      console.error(e);
      alert("Backend error while deleting lecturer.");
    }
  }

  return (
    <div className="panel">
      <div className="panel-header">
        <h2>Lecturer Overview</h2>

        <div style={{ display: "flex", gap: 10 }}>
          <button className="add-btn" onClick={loadLecturers} type="button">
            ↻ Refresh
          </button>
          {formMode === "overview" && (
            <button className="add-btn" onClick={openAdd} type="button">
              + Add Lecturer
            </button>
          )}
        </div>
      </div>

      {loading && <p style={{ marginTop: 10, fontSize: 13 }}>Loading lecturers...</p>}

      {loadError && (
        <p style={{ marginTop: 10, fontSize: 13, color: "crimson" }}>
          Backend error: {loadError}
        </p>
      )}

      {!loading && !loadError && formMode === "overview" && (
        <table>
          <thead>
            <tr>
              <th>Full Name</th>
              <th>Domain</th>
              <th>Type</th>
              <th>Personal Email</th>
              <th>MDH Email</th>
              <th style={{ width: 170 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {lecturers.map((l) => (
              <tr key={l.id}>
                <td>{l.fullName}</td>
                <td>{l.domain}</td>
                <td>{l.employmentType}</td>
                <td>{l.personalEmail || "-"}</td>
                <td>{l.mdhEmail || "-"}</td>
                <td>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => openEdit(l)} type="button">
                      Edit
                    </button>
                    <button onClick={() => remove(l.id)} type="button">
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
            Full Name:
            <input
              value={draft.fullName}
              onChange={(e) => setDraft({ ...draft, fullName: e.target.value })}
              placeholder="e.g., Anna Schmidt"
            />
          </label>

          <label>
            Domain:
            <input
              value={draft.domain}
              onChange={(e) => setDraft({ ...draft, domain: e.target.value })}
              placeholder="e.g., Cyber Security"
            />
          </label>

          <label>
            Type:
            <select
              value={draft.employmentType}
              onChange={(e) => setDraft({ ...draft, employmentType: e.target.value })}
            >
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
            </select>
          </label>

          <label>
            Personal Email:
            <input
              value={draft.personalEmail}
              onChange={(e) => setDraft({ ...draft, personalEmail: e.target.value })}
              placeholder="e.g., anna@gmail.com"
            />
          </label>

          <label>
            MDH Email:
            <input
              value={draft.mdhEmail}
              onChange={(e) => setDraft({ ...draft, mdhEmail: e.target.value })}
              placeholder="e.g., anna@mdh.de"
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
