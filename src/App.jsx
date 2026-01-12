import { useState } from "react";
import "./App.css";

import ProgramOverview from "./Components/ProgramOverview";
import LecturerOverview from "./Components/LecturerOverview";
import GroupOverview from "./Components/GroupOverview";
import ScheduleOverview from "./Components/ScheduleOverview";

export default function App() {
  const [page, setPage] = useState("programs");

  return (
    <div className="app">
      <Topbar page={page} setPage={setPage} />

      <div className="page-container">
        {page === "programs" && <ProgramOverview />}
        {page === "groups" && <GroupOverview />}
        {page === "lecturers" && <LecturerOverview />}
        {page === "schedule" && <ScheduleOverview />}
      </div>
    </div>
  );
}

function Topbar({ page, setPage }) {
  const tabs = ["programs", "groups", "lecturers", "schedule"];

  return (
    <div className="topbar">
      <div className="logo">CS2</div>

      <div className="nav">
        {tabs.map((tab) => (
          <button
            key={tab}
            className={page === tab ? "active" : ""}
            onClick={() => setPage(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)} Overview
          </button>
        ))}
      </div>

      <div className="user">👤</div>
    </div>
  );
}
