import React, { useCallback, useEffect, useState } from "react";
import { StudentAPI, StaffAPI, exportStudentsUrl } from "../api";
import StatusPill from "../components/StatusPill";
import EnquiryFormModal from "../components/EnquiryFormModal";
import StudentDetailModal from "../components/StudentDetailModal";

const quickFilters = [
  { key: "all", label: "All" },
  { key: "Walk-in", label: "Walk-ins" },
  { key: "Follow-up", label: "Follow-ups" },
  { key: "Joined", label: "Joined" },
];

function formatCurrency(n) {
  return "₹" + Number(n || 0).toLocaleString("en-IN");
}
function formatDate(d) {
  return d ? new Date(d).toLocaleDateString("en-IN") : "—";
}

export default function Students() {
  const [students, setStudents] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [quick, setQuick] = useState("all");
  const [search, setSearch] = useState("");
  const [staffFilter, setStaffFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [detailId, setDetailId] = useState(null);

  const buildParams = useCallback(() => {
    const params = {};
    if (quick === "Walk-in") params.source = "Walk-in";
    if (quick === "Follow-up") params.status = "Follow-up";
    if (quick === "Joined") params.status = "Joined";
    if (statusFilter) params.status = statusFilter;
    if (staffFilter) params.staff = staffFilter;
    if (search) params.q = search;
    if (from) params.from = from;
    if (to) params.to = to;
    return params;
  }, [quick, statusFilter, staffFilter, search, from, to]);

  const fetchStudents = useCallback(() => {
    setLoading(true);
    StudentAPI.list(buildParams())
      .then((data) => {
        setStudents(data);
        setError("");
      })
      .catch((err) => setError(err.message || "Failed to load"))
      .finally(() => setLoading(false));
  }, [buildParams]);

  useEffect(() => {
    StaffAPI.list().then(setStaffList).catch(() => {});
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  async function handleSave(payload) {
    if (editing) {
      await StudentAPI.update(editing._id, payload);
    } else {
      await StudentAPI.create(payload);
    }
    setShowForm(false);
    setEditing(null);
    fetchStudents();
  }

  function openEdit(student) {
    setEditing(student);
    setDetailId(null);
    setShowForm(true);
  }

  return (
    <>
      <div className="topbar">
        <div>
          <h1>Enquiries &amp; Walk-ins</h1>
          <div className="topbar-sub">Track enquiries, follow-ups, joinings and payments</div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <a className="btn btn-outline" href={exportStudentsUrl(buildParams())} target="_blank" rel="noreferrer">
            ⬇ Export to Excel
          </a>
          <button className="btn btn-primary" onClick={() => { setEditing(null); setShowForm(true); }}>
            + New Enquiry
          </button>
        </div>
      </div>

      <div className="content">
        <div className="filter-bar">
          {quickFilters.map((f) => (
            <button
              key={f.key}
              className={"btn btn-sm " + (quick === f.key ? "btn-primary" : "btn-outline")}
              onClick={() => setQuick(f.key)}
            >
              {f.label}
            </button>
          ))}
          <input
            type="text"
            placeholder="Search name, phone, email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All statuses</option>
            <option>Enquiry</option>
            <option>Follow-up</option>
            <option>Joined</option>
            <option>Dropped</option>
          </select>
          <select value={staffFilter} onChange={(e) => setStaffFilter(e.target.value)}>
            <option value="">All staff</option>
            {staffList.map((s) => (
              <option key={s._id} value={s._id}>{s.name}</option>
            ))}
          </select>
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} title="From date" />
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)} title="To date" />
        </div>

        <div className="panel">
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Source</th>
                  <th>Name</th>
                  <th>Phone</th>
                  <th>Course</th>
                  <th>Staff</th>
                  <th>Status</th>
                  <th>Total Fee</th>
                  <th>Paid</th>
                  <th>Balance</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s) => (
                  <tr key={s._id} onClick={() => setDetailId(s._id)}>
                    <td>{formatDate(s.enquiryDate)}</td>
                    <td>{s.source}</td>
                    <td><strong>{s.name}</strong></td>
                    <td>
                      {s.phone}{" "}
                      {s.phoneVerified && (
                        <span title="Phone verified" style={{ color: "var(--green)" }}>✓</span>
                      )}
                    </td>
                    <td>{s.courseEnquired || "—"}</td>
                    <td>{s.assignedStaff?.name || "—"}</td>
                    <td><StatusPill status={s.status} /></td>
                    <td>{formatCurrency(s.totalFee)}</td>
                    <td>{formatCurrency(s.totalPaid)}</td>
                    <td style={{ color: s.balance > 0 ? "var(--red)" : "var(--green)", fontWeight: 600 }}>
                      {formatCurrency(s.balance)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!loading && students.length === 0 && (
              <div className="empty-state">
                <div className="icon">🗂</div>
                No records match these filters. Try adjusting them or add a new enquiry.
              </div>
            )}
            {loading && <div className="empty-state">Loading…</div>}
            {error && <div className="empty-state" style={{ color: "var(--red)" }}>{error}</div>}
          </div>
        </div>
      </div>

      {showForm && (
        <EnquiryFormModal
          initial={editing}
          staffList={staffList}
          onClose={() => { setShowForm(false); setEditing(null); }}
          onSave={handleSave}
        />
      )}

      {detailId && (
        <StudentDetailModal
          studentId={detailId}
          onClose={() => setDetailId(null)}
          onChanged={fetchStudents}
          onEdit={openEdit}
        />
      )}
    </>
  );
}
