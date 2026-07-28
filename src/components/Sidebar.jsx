import React from "react";
import { NavLink } from "react-router-dom";

const navItems = [
  { to: "/", label: "Dashboard", icon: "▤", end: true },
  { to: "/enquiries", label: "Enquiries & Walk-ins", icon: "☰" },
  { to: "/payments", label: "Payments", icon: "₹" },
  { to: "/staff", label: "Staff", icon: "◎" },
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-logo-wrap">
          <img src="/logo.png" alt="Shikshaa" className="sidebar-logo" />
        </div>
        <p className="sidebar-tagline">SIMPLE. LEARN. · CRM</p>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}
          >
            <span className="nav-icon">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">Shikshaa CRM v1.0</div>
    </aside>
  );
}
