import React from "react";
import { Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import Students from "./pages/Students";
import Payments from "./pages/Payments";
import Staff from "./pages/Staff";

export default function App() {
  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/students" element={<Students />} />
          <Route path="/payments" element={<Payments />} />
          <Route path="/staff" element={<Staff />} />
        </Routes>
      </div>
    </div>
  );
}
