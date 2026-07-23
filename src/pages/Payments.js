import React, { useCallback, useEffect, useState } from "react";
import { PaymentAPI, StaffAPI } from "../api";
import StudentDetailModal from "../components/StudentDetailModal";

function formatCurrency(n) {
  return "₹" + Number(n || 0).toLocaleString("en-IN");
}
function formatDateTime(d) {
  return d ? new Date(d).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";
}

export default function Payments() {
  const [payments, setPayments] = useState([]);
  const [summary, setSummary] = useState(null);
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [detailId, setDetailId] = useState(null);

  const [type, setType] = useState("");
  const [mode, setMode] = useState("");
  const [staff, setStaff] = useState("");
  const [q, setQ] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const buildParams = useCallback(() => {
    const params = {};
    if (type) params.type = type;
    if (mode) params.mode = mode;
    if (staff) params.staff = staff;
    if (q) params.q = q;
    if (from) params.from = from;
    if (to) params.to = to;
    return params;
  }, [type, mode, staff, q, from, to]);

  const fetchAll = useCallback(() => {
    setLoading(true);
    const params = buildParams();
    Promise.all([PaymentAPI.list(params), PaymentAPI.summary(params)])
      .then(([list, sum]) => {
        setPayments(list);
        setSummary(sum);
        setError("");
      })
      .catch((err) => setError(err.message || "Failed to load payments"))
      .finally(() => setLoading(false));
  }, [buildParams]);

  useEffect(() => {
    StaffAPI.list().then(setStaffList).catch(() => {});
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return (
    <>
      <div className="topbar">
        <div>
          <h1>Payment Details</h1>
          <div className="topbar-sub">All advances, installments and balances across students</div>
        </div>
      </div>

      <div className="content">
        <div className="stat-grid" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
          <div className="stat-card accent">
            <div className="label">Total Collected</div>
            <div className="value">{summary ? formatCurrency(summary.total) : "—"}</div>
          </div>
          <div className="stat-card">
            <div className="label">Payments Recorded</div>
            <div className="value">{summary ? summary.count : "—"}</div>
          </div>
          <div className="stat-card">
            <div className="label">Advance Collected</div>
            <div className="value">{summary ? formatCurrency(summary.byType?.Advance) : "—"}</div>
          </div>
          <div className="stat-card">
            <div className="label">Balance / Full Settled</div>
            <div className="value">
              {summary
                ? formatCurrency((summary.byType?.Balance || 0) + (summary.byType?.Full || 0))
                : "—"}
            </div>
          </div>
        </div>

        <div className="filter-bar">
          <input
            type="text"
            placeholder="Search student name / phone…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <select value={type} onChange={(e) => setType(e.target.value)}>
            <option value="">All types</option>
            <option>Advance</option>
            <option>Installment</option>
            <option>Balance</option>
            <option>Full</option>
          </select>
          <select value={mode} onChange={(e) => setMode(e.target.value)}>
            <option value="">All modes</option>
            <option>Cash</option>
            <option>Card</option>
            <option>UPI</option>
            <option>Bank Transfer</option>
            <option>Cheque</option>
            <option>Other</option>
          </select>
          <select value={staff} onChange={(e) => setStaff(e.target.value)}>
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
                  <th>Student</th>
                  <th>Phone</th>
                  <th>Staff</th>
                  <th>Type</th>
                  <th>Mode</th>
                  <th>Amount</th>
                  <th>Remarks</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p._id} onClick={() => p.student && setDetailId(p.student._id)}>
                    <td>{formatDateTime(p.date)}</td>
                    <td><strong>{p.student?.name || "—"}</strong></td>
                    <td>{p.student?.phone || "—"}</td>
                    <td>{p.student?.assignedStaff?.name || "—"}</td>
                    <td>{p.type}</td>
                    <td>{p.mode}</td>
                    <td style={{ fontWeight: 600 }}>{formatCurrency(p.amount)}</td>
                    <td>{p.remarks || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!loading && payments.length === 0 && (
              <div className="empty-state">
                <div className="icon">₹</div>
                No payments match these filters yet.
              </div>
            )}
            {loading && <div className="empty-state">Loading…</div>}
            {error && <div className="empty-state" style={{ color: "var(--red)" }}>{error}</div>}
          </div>
        </div>
      </div>

      {detailId && (
        <StudentDetailModal
          studentId={detailId}
          onClose={() => setDetailId(null)}
          onChanged={fetchAll}
        />
      )}
    </>
  );
}
