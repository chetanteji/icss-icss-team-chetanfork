import React, { useState } from "react";
import "./App.css";
import Layout from "./Layout";

// Import components
import ProgramOverview from "./components/ProgramOverview";
import ModuleOverview from "./components/ModuleOverview";
import LecturerOverview from "./components/LecturerOverview";
import RoomOverview from "./components/RoomOverview";
import GroupOverview from "./components/GroupOverview";
import ConstraintOverview from "./components/ConstraintOverview";
import AvailabilityOverview from "./components/AvailabilityOverview";
import SemesterManager from "./components/SemesterManager"; // El de Shayan
import OfferedModules from "./components/OfferedModules";   // ✅ EL TUYO (Nuevo)

function App() {
  const [activeTab, setActiveTab] = useState("programs");
  // Leemos el token y rol guardados, o por defecto Guest
  const [token] = useState(localStorage.getItem("token"));
  const [currentUserRole, setCurrentUserRole] = useState(localStorage.getItem("userRole") || "Guest");
  const [navData, setNavData] = useState(null);

  const handleNavigate = (tab, data = null) => {
    setActiveTab(tab);
    setNavData(data);
  };

  const renderContent = () => {
    // Si no hay token (simulamos login simple con roles), mostramos mensaje de bienvenida
    // Ojo: En tu lógica actual parece que permites navegar si seleccionan rol abajo.
    // Si la lógica de "token" es estricta, mantenlo. Si solo dependen del rol, esto está bien.
    if (!token && currentUserRole === "Guest") {
      return (
        <div style={{textAlign: "center", marginTop: "100px", color: "#64748b"}}>
          <h2>Welcome to ICSS Scheduler</h2>
          <p>Please select a Role in the bottom-left corner to start testing.</p>
        </div>
      );
    }

    const commonProps = { currentUserRole, onNavigate: handleNavigate };

    switch (activeTab) {
      case "programs":
        return <ProgramOverview initialData={navData} clearInitialData={() => setNavData(null)} {...commonProps} />;
      case "modules":
        return <ModuleOverview onNavigate={handleNavigate} {...commonProps} />;
      case "lecturers":
        return <LecturerOverview {...commonProps} />;
      case "rooms":
        return <RoomOverview {...commonProps} />;
      case "groups":
        return <GroupOverview {...commonProps} />;
      case "constraints":
        return <ConstraintOverview {...commonProps} />;
      case "availabilities":
        return <AvailabilityOverview {...commonProps} />;

      case "semesters":
        return <SemesterManager {...commonProps} />; // Pantalla de Shayan

      // ✅ TU PANTALLA INTEGRADA
      case "semester-planning":
        return <OfferedModules {...commonProps} />;

      default:
        return <ProgramOverview {...commonProps} />;
    }
  };

  return (
    <Layout
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      currentUserRole={currentUserRole}
      setCurrentUserRole={setCurrentUserRole}
    >
      {renderContent()}
    </Layout>
  );
}

export default App;