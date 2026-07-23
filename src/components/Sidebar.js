import React from "react";
import { NavLink } from "react-router-dom";

const links = [
  { to: "/", label: "Dashboard", icon: "◧", end: true },
  { to: "/students", label: "Enquiries & Walk-ins", icon: "☰" },
  { to: "/payments", label: "Payments", icon: "₹" },
  { to: "/staff", label: "Staff", icon: "◎" },
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <img src="/logo.png" alt="Shikshaa" className="sidebar-logo-img" />
        <div className="sidebar-logo-sub">Simple. Learn. &middot; CRM</div>
      </div>
      <nav>
        {links.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            end={l.end}
            className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}
          >
            <span className="nav-icon">{l.icon}</span>
            {l.label}
          </NavLink>
        ))}
      </nav>
      <div className="sidebar-footer">Shikshaa CRM v1.0</div>
    </aside>
  );
}
