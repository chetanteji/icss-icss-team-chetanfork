import { useState } from "react";
import "./App.css";

import ProgramOverview from "./Components/ProgramOverview";
import LecturerOverview from "./Components/LecturerOverview";
import GroupOverview from "./Components/GroupOverview";
import ModuleOverview from "./Components/ModuleOverview";
import RoomOverview from "./Components/RoomOverview";
import ConstraintOverview from "./Components/ConstraintOverview"; // <--- Import
import AvailabilityOverview from "./Components/AvailabiltyOverview";
export default function App() {
  const [page, setPage] = useState("programs");

  return (
    <div className="app">
      <Topbar page={page} setPage={setPage} />

      <div className="page-container">
        {page === "programs" && <ProgramOverview />}
        {page === "groups" && <GroupOverview />}
        {page === "lecturers" && <LecturerOverview />}
        {page === "modules" && <ModuleOverview />}
        {page === "rooms" && <RoomOverview />}
        {page === "constraints" && <ConstraintOverview />} 
        {page === "availability" && <AvailabilityOverview />} 

        {/* <--- Add Route */}
      </div>
    </div>
  );
}

function Topbar({ page, setPage }) {
  // Add "constraints" to the tabs list
  const tabs = ["programs", "groups", "lecturers", "modules", "rooms", "constraints", "availability"];

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