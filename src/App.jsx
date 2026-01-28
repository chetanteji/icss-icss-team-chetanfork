import { useState } from "react";
import "./App.css";

import ProgramOverview from "./Components/ProgramOverview";
import GroupOverview from "./Components/GroupOverview";
import LecturerOverview from "./Components/LecturerOverview";
import ModuleOverview from "./Components/ModuleOverview";
import RoomOverview from "./Components/RoomOverview";
import ConstraintOverview from "./Components/ConstraintOverview";
import AvailabilityOverview from "./Components/AvailabilityOverview";

export default function App() {
  const [view, setView] = useState({ page: "programs", data: {} });

  const navigate = (pageName, data = {}) => {
    setView({ page: pageName, data });
  };

  return (
    <div className="app">
      <Topbar activePage={view.page} navigate={navigate} />

      <div className="page-container">
        {view.page === "programs" && (
          <ProgramOverview navigate={navigate} initialLevel={view.data?.level} />
        )}
        {view.page === "modules" && (
          <ModuleOverview navigate={navigate} initialFilter={view.data} />
        )}
        {view.page === "groups" && <GroupOverview />}

        {view.page === "lecturers" && <LecturerOverview />}
        {view.page === "rooms" && <RoomOverview />}

        {view.page === "constraints" && <ConstraintOverview />}
        {view.page === "availability" && <AvailabilityOverview />}
      </div>
    </div>
  );
}

function Topbar({ activePage, navigate }) {
  // ✅ New Nested Menu Structure
  const menuGroups = [
    {
      label: "Curriculum",
      items: [
        { key: "programs", label: "Study Programs" },
        { key: "modules", label: "Modules" },
        { key: "groups", label: "Groups" },
      ],
    },
    {
      label: "Resources",
      items: [
        { key: "lecturers", label: "Lecturers" },
        { key: "rooms", label: "Rooms" },
      ],
    },
    {
      label: "Scheduler Rules",
      items: [
        { key: "constraints", label: "Constraints" },
        { key: "availability", label: "Availability" },
      ],
    },
  ];

  return (
    <div className="topbar">
      <div className="logo">ICSS</div>
      <div className="nav">
        {menuGroups.map((group) => (
          <div key={group.label} className="dropdown">
            <button className="dropbtn">
              {group.label} <span style={{ fontSize: "0.7rem", marginLeft: "4px" }}>▼</span>
            </button>
            <div className="dropdown-content">
              {group.items.map((item) => (
                <button
                  key={item.key}
                  className={activePage === item.key ? "active" : ""}
                  onClick={() => navigate(item.key)}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="user">User</div>
    </div>
  );
}