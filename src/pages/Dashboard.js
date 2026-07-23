import React, { useEffect, useState } from "react";
import { StudentAPI } from "../api";

function formatCurrency(n) {
  return "₹" + Number(n || 0).toLocaleString("en-IN");
}

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    StudentAPI.stats()
      .then(setStats)
      .catch((err) => setError(err.message || "Failed to load stats"));
  }, []);

  return (
    <>
      <div className="topbar">
        <div>
          <h1>Dashboard</h1>
          <div className="topbar-sub">Overview of enquiries, joinings & revenue</div>
        </div>
      </div>
      <div className="content">
        {error && <p style={{ color: "var(--red)" }}>{error}</p>}
        <div className="stat-grid">
          <div className="stat-card">
            <div className="label">Total Enquiries</div>
            <div className="value">{stats ? stats.total : "—"}</div>
          </div>
          <div className="stat-card">
            <div className="label">Walk-ins</div>
            <div className="value">{stats ? stats.walkins : "—"}</div>
          </div>
          <div className="stat-card">
            <div className="label">Follow-ups Pending</div>
            <div className="value">{stats ? stats.followUps : "—"}</div>
          </div>
          <div className="stat-card accent">
            <div className="label">Joined Students</div>
            <div className="value">{stats ? stats.joined : "—"}</div>
          </div>
          <div className="stat-card accent">
            <div className="label">Total Revenue</div>
            <div className="value">{stats ? formatCurrency(stats.totalRevenue) : "—"}</div>
          </div>
        </div>

        <div className="panel">
          <div className="panel-header">
            <h2>Getting started</h2>
          </div>
          <div className="panel-body" style={{ fontSize: 12.5, color: "var(--text-muted)", lineHeight: 1.7 }}>
            Head to <strong>Enquiries &amp; Walk-ins</strong> to log a new student enquiry,
            assign staff, track follow-ups, mark joinings, record payments and export the
            list to Excel at any time.
          </div>
        </div>
      </div>
    </>
  );
}
