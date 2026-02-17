// src/components/HoSPTimetable.jsx
import React, { useEffect, useMemo, useState } from "react";
import api from "../api";

export default function HoSPTimetable({ programs = [], currentUserRole }) {
  const [semester, setSemester] = useState(""); // backend expects semester STRING (e.g. "Winter 2024")
  const [selectedProgramId, setSelectedProgramId] = useState("");
  const [scheduleItems, setScheduleItems] = useState([]);
  const [error, setError] = useState("");

  const role = (currentUserRole || "").toLowerCase();

  // You can pass already-filtered programs from ProgramOverview.
  const visiblePrograms = useMemo(() => programs || [], [programs]);

  useEffect(() => {
    let ignore = false;

    async function load() {
      setError("");
      setScheduleItems([]);

      if (!semester) return; // don’t call API if no semester

      try {
        // Existing API: GET /schedule/?semester=Winter%202024
        const data = await api.getSchedule(semester);

        // Optional: Filter by program (frontend-side) if your schedule items include program info
        // Your current ScheduleResponse does NOT include program_id, so we can’t filter by program reliably.
        // So we show the timetable for the semester (still valid for task 145).
        if (!ignore) setScheduleItems(data || []);
      } catch (e) {
        if (!ignore) setError(e.message || "Failed to load timetable");
      }
    }

    load();
    return () => {
      ignore = true;
    };
  }, [semester, selectedProgramId]);

  // Role Guard
  if (role !== "hosp" && role !== "admin" && role !== "pm") {
    return (
      <div style={{ padding: 16 }}>
        You do not have access to the HoSP timetable.
      </div>
    );
  }

  return (
    <div style={{ padding: 16 }}>
      <h2 style={{ marginBottom: 12 }}>HoSP Timetable</h2>

      {/* Filters */}
      <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 12 }}>
        <div>
          <div style={{ fontSize: 12, opacity: 0.7 }}>Semester (required)</div>
          <input
            value={semester}
            onChange={(e) => setSemester(e.target.value)}
            placeholder='e.g. "Winter 2024"'
            style={{ width: 200 }}
          />
        </div>

        <div>
          <div style={{ fontSize: 12, opacity: 0.7 }}>Program (optional)</div>
          <select value={selectedProgramId} onChange={(e) => setSelectedProgramId(e.target.value)}>
            <option value="">All</option>
            {visiblePrograms.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name || `Program ${p.id}`}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error ? <div style={{ color: "crimson", marginBottom: 12 }}>{error}</div> : null}

      {/* Table */}
      <div style={{ border: "1px solid #333", borderRadius: 8, overflow: "hidden" }}>
        <div style={{ padding: 10, fontWeight: 600, borderBottom: "1px solid #333" }}>
          Sessions ({scheduleItems.length})
        </div>

        {semester && scheduleItems.length === 0 && !error ? (
          <div style={{ padding: 10, opacity: 0.8 }}>No sessions found for this semester.</div>
        ) : null}

        {scheduleItems.map((it) => (
          <div key={it.id} style={{ padding: 10, borderBottom: "1px solid #222" }}>
            <div style={{ fontWeight: 600 }}>
              {it.module_name || "Unknown Module"} — {it.lecturer_name || "Unassigned"}
            </div>
            <div style={{ fontSize: 13, opacity: 0.8 }}>
              {it.day_of_week} | {it.start_time} → {it.end_time}
            </div>
            <div style={{ fontSize: 13, opacity: 0.8 }}>
              Room: {it.room_name || "No Room"} | Semester: {it.semester}
            </div>
          </div>
        ))}
      </div>

      {/* Note */}
      <div style={{ marginTop: 10, fontSize: 12, opacity: 0.7 }}>
        Note: Program filtering needs program info inside the schedule API response. Currently your backend schedule response
        does not return program_id/program_name, so this view shows semester timetable correctly.
      </div>
    </div>
  );
}
