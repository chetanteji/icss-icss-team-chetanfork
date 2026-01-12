import { useEffect, useState } from "react";
import api from "../api";

export default function GroupOverview() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [formMode, setFormMode] = useState("overview"); // overview | add | edit
  const [editingId, setEditingId] = useState(null);

  const [draft, setDraft] = useState({
    groupName: "",
    size: "",
    description: "",
    email: "",
  });

  async function loadGroups() {
    setLoading(true);
    setLoadError("");
    try {
      const data = await api.getGroups();
      const mapped = (Array.isArray(data) ? data : []).map((x) => ({
        id: x.id,
        groupName: x.group_name,
        size: x.size,
        description: x.description || "",
        email: x.email || "",
      }));
      setGroups(mapped);
    } catch (e) {
      setLoadError(e?.message || "Failed to load groups");
      setGroups([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadGroups();
  }, []);

  function openAdd() {
    setEditingId(null);
    setDraft({ groupName: "", size: "", description: "", email: "" });
    setFormMode("add");
  }

  function openEdit(row) {
    setEditingId(row.id);
    setDraft({
      groupName: row.groupName || "",
      size: String(row.size ?? ""),
      description: row.description || "",
      email: row.email || "",
    });
    setFormMode("edit");
  }

  async function save() {
    if (!draft.groupName.trim()) return alert("Group name is required");
    if (!String(draft.size).trim()) return alert("Size is required");

    const payload = {
      group_name: draft.groupName.trim(),
      size: Number(draft.size),
      description: draft.description.trim() || null,
      email: draft.email.trim() || null,
    };

    try {
      if (formMode === "add") {
        await api.createGroup(payload);
      } else {
        await api.updateGroup(editingId, payload);
      }
      await loadGroups();
      setFormMode("overview");
      setEditingId(null);
    } catch (e) {
      console.error(e);
      alert("Backend error while saving group.");
    }
  }

  async function remove(id) {
    const ok = window.confirm("Delete this group?");
    if (!ok) return;

    try {
      await api.deleteGroup(id);
      await loadGroups();
    } catch (e) {
      console.error(e);
      alert("Backend error while deleting group.");
    }
  }

  return (
    <div className="panel">
      <div className="panel-header">
        <h2>Group Overview</h2>

        <div style={{ display: "flex", gap: 10 }}>
          <button className="add-btn" onClick={loadGroups} type="button">
            ↻ Refresh
          </button>
          {formMode === "overview" && (
            <button className="add-btn" onClick={openAdd} type="button">
              + Add Group
            </button>
          )}
        </div>
      </div>

      {loading && <p style={{ marginTop: 10, fontSize: 13 }}>Loading groups...</p>}

      {loadError && (
        <p style={{ marginTop: 10, fontSize: 13, color: "crimson" }}>
          Backend error: {loadError}
        </p>
      )}

      {!loading && !loadError && formMode === "overview" && (
        <table>
          <thead>
            <tr>
              <th>Group</th>
              <th>Size</th>
              <th>Description</th>
              <th>Email</th>
              <th style={{ width: 170 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {groups.map((g) => (
              <tr key={g.id}>
                <td>{g.groupName}</td>
                <td>{g.size}</td>
                <td>{g.description}</td>
                <td>{g.email}</td>
                <td>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => openEdit(g)} type="button">
                      Edit
                    </button>
                    <button onClick={() => remove(g.id)} type="button">
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
            Group Name:
            <input
              value={draft.groupName}
              onChange={(e) => setDraft({ ...draft, groupName: e.target.value })}
              placeholder="e.g., BIT 1024"
            />
          </label>

          <label>
            Size:
            <input
              type="number"
              value={draft.size}
              onChange={(e) => setDraft({ ...draft, size: e.target.value })}
              placeholder="e.g., 25"
            />
          </label>

          <label>
            Description:
            <input
              value={draft.description}
              onChange={(e) => setDraft({ ...draft, description: e.target.value })}
              placeholder="e.g., Information Technology B.Sc."
            />
          </label>

          <label>
            Email:
            <input
              value={draft.email}
              onChange={(e) => setDraft({ ...draft, email: e.target.value })}
              placeholder="e.g., bit1024@mdh.de"
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
