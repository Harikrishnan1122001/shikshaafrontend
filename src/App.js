import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Dashboard from "./components/Dashboard";
import Enquiries from "./components/Enquiries";
import Payments from "./components/Payments";
import Staff from "./components/Staff";

function App() {
  return (
    <BrowserRouter>
      <div className="app-shell">
        <Sidebar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/enquiries" element={<Enquiries />} />
            <Route path="/payments" element={<Payments />} />
            <Route path="/staff" element={<Staff />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
