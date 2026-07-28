import React, { useEffect, useState } from "react";
import api from "../api";

const cards = [
  { key: "totalEnquiries", label: "Total Enquiries", color: "dark" },
  { key: "walkIns", label: "Walk-ins", color: "dark" },
  { key: "followUpsPending", label: "Follow-ups Pending", color: "dark" },
  { key: "joinedStudents", label: "Joined Students", color: "orange" },
  { key: "totalRevenue", label: "Total Revenue", color: "orange", isCurrency: true },
];

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/dashboard/stats")
      .then((res) => setStats(res.data))
      .catch(() => setError("Could not load dashboard stats. Is the backend running?"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <header className="page-header">
        <h1>Dashboard</h1>
        <p>Overview of enquiries, joinings &amp; revenue</p>
      </header>

      {error && <div className="alert-error">{error}</div>}

      <div className="stat-grid">
        {cards.map((c) => (
          <div className="stat-card" key={c.key}>
            <div className="stat-label">{c.label.toUpperCase()}</div>
            <div className={"stat-value " + c.color}>
              {loading
                ? "—"
                : c.isCurrency
                ? `₹${(stats?.[c.key] || 0).toLocaleString("en-IN")}`
                : stats?.[c.key] ?? 0}
            </div>
          </div>
        ))}
      </div>

      <div className="info-card">
        <h3>Getting started</h3>
        <p>
          Head to <strong>Enquiries &amp; Walk-ins</strong> to log a new student enquiry, assign
          staff, track follow-ups, mark joinings, record payments and export the list to Excel at
          any time.
        </p>
      </div>
    </div>
  );
}
