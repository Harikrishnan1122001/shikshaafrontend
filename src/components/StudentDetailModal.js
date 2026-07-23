import React, { useEffect, useState } from "react";
import { StudentAPI } from "../api";
import StatusPill from "./StatusPill";

function formatCurrency(n) {
  return "₹" + Number(n || 0).toLocaleString("en-IN");
}
function formatDate(d) {
  return d ? new Date(d).toLocaleDateString("en-IN") : "—";
}

export default function StudentDetailModal({ studentId, onClose, onChanged, onEdit }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [payForm, setPayForm] = useState({ amount: "", type: "Installment", mode: "Cash", remarks: "" });
  const [submitting, setSubmitting] = useState(false);

  function load() {
    StudentAPI.get(studentId)
      .then(setData)
      .catch((err) => setError(err.message));
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentId]);

  async function addPayment(e) {
    e.preventDefault();
    if (!payForm.amount) return;
    setSubmitting(true);
    try {
      await StudentAPI.addPayment(studentId, {
        ...payForm,
        amount: Number(payForm.amount),
      });
      setPayForm({ amount: "", type: "Installment", mode: "Cash", remarks: "" });
      load();
      onChanged && onChanged();
    } catch (err) {
      setError(err?.response?.data?.error || err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function removePayment(paymentId) {
    if (!window.confirm("Remove this payment entry?")) return;
    await StudentAPI.removePayment(studentId, paymentId);
    load();
    onChanged && onChanged();
  }

  if (!data) {
    return (
      <div className="modal-overlay">
        <div className="modal">
          <div className="modal-body">Loading…</div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 760 }}>
        <div className="modal-header">
          <h2>
            {data.name} &nbsp;
            <StatusPill status={data.status} />
          </h2>
          <button className="close-x" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          {error && <p style={{ color: "var(--red)", fontSize: 12.5 }}>{error}</p>}

          <div className="fee-summary">
            <div className="fee-box">
              <div className="label">Total Fee</div>
              <div className="amount">{formatCurrency(data.totalFee)}</div>
            </div>
            <div className="fee-box paid">
              <div className="label">Paid</div>
              <div className="amount">{formatCurrency(data.totalPaid)}</div>
            </div>
            <div className="fee-box balance">
              <div className="label">Balance</div>
              <div className="amount">{formatCurrency(data.balance)}</div>
            </div>
          </div>

          <div className="detail-grid">
            <div>
              <div className="panel">
                <div className="panel-header">
                  <h2>Student Info</h2>
                  {onEdit && (
                    <button className="btn btn-outline btn-sm" onClick={() => onEdit(data)}>
                      Edit
                    </button>
                  )}
                </div>
                <div className="panel-body">
                  <div className="info-row">
                    <span className="k">Phone</span>
                    <span className="v">
                      {data.phone}{" "}
                      {data.phoneVerified ? (
                        <span style={{ color: "var(--green)", fontSize: 11 }}>✓ Verified</span>
                      ) : (
                        <span style={{ color: "var(--text-muted)", fontSize: 11 }}>Unverified</span>
                      )}
                    </span>
                  </div>
                  <div className="info-row"><span className="k">Email</span><span className="v">{data.email || "—"}</span></div>
                  <div className="info-row"><span className="k">Address</span><span className="v">{data.address || "—"}</span></div>
                  <div className="info-row"><span className="k">Source</span><span className="v">{data.source}</span></div>
                  <div className="info-row"><span className="k">Course Enquired</span><span className="v">{data.courseEnquired || "—"}</span></div>
                  <div className="info-row"><span className="k">Assigned Staff</span><span className="v">{data.assignedStaff?.name || "Unassigned"}</span></div>
                  <div className="info-row"><span className="k">Enquiry Date</span><span className="v">{formatDate(data.enquiryDate)}</span></div>
                  <div className="info-row"><span className="k">Follow-up Date</span><span className="v">{formatDate(data.followUpDate)}</span></div>
                  <div className="info-row"><span className="k">Joining Date</span><span className="v">{formatDate(data.joiningDate)}</span></div>
                  <div className="info-row"><span className="k">Franchise</span><span className="v">{data.franchiseName || "—"}</span></div>
                  <div className="info-row"><span className="k">Batch</span><span className="v">{data.batch || "—"}</span></div>
                  {data.notes && (
                    <div className="info-row"><span className="k">Notes</span><span className="v">{data.notes}</span></div>
                  )}
                </div>
              </div>
            </div>

            <div>
              <div className="panel" style={{ marginBottom: 14 }}>
                <div className="panel-header">
                  <h2>Record Payment</h2>
                </div>
                <div className="panel-body">
                  <form onSubmit={addPayment} className="form-grid" style={{ gridTemplateColumns: "1fr 1fr" }}>
                    <div className="form-field">
                      <label>Amount</label>
                      <input
                        type="number"
                        min="0"
                        required
                        value={payForm.amount}
                        onChange={(e) => setPayForm((f) => ({ ...f, amount: e.target.value }))}
                      />
                    </div>
                    <div className="form-field">
                      <label>Type</label>
                      <select
                        value={payForm.type}
                        onChange={(e) => setPayForm((f) => ({ ...f, type: e.target.value }))}
                      >
                        <option>Advance</option>
                        <option>Installment</option>
                        <option>Balance</option>
                        <option>Full</option>
                      </select>
                    </div>
                    <div className="form-field">
                      <label>Mode</label>
                      <select
                        value={payForm.mode}
                        onChange={(e) => setPayForm((f) => ({ ...f, mode: e.target.value }))}
                      >
                        <option>Cash</option>
                        <option>Card</option>
                        <option>UPI</option>
                        <option>Bank Transfer</option>
                        <option>Cheque</option>
                        <option>Other</option>
                      </select>
                    </div>
                    <div className="form-field">
                      <label>Remarks</label>
                      <input
                        value={payForm.remarks}
                        onChange={(e) => setPayForm((f) => ({ ...f, remarks: e.target.value }))}
                      />
                    </div>
                    <div className="form-field full">
                      <button className="btn btn-primary" disabled={submitting} type="submit">
                        {submitting ? "Adding…" : "Add Payment"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>

              <div className="panel">
                <div className="panel-header">
                  <h2>Payment History</h2>
                </div>
                <div className="panel-body">
                  {data.payments && data.payments.length ? (
                    data.payments.map((p) => (
                      <div className="payment-item" key={p._id}>
                        <div>
                          <div>
                            {formatCurrency(p.amount)} <span className="meta">· {p.type} · {p.mode}</span>
                          </div>
                          <div className="meta">{formatDate(p.date)} {p.remarks ? `· ${p.remarks}` : ""}</div>
                        </div>
                        <button className="btn-ghost" onClick={() => removePayment(p._id)} title="Remove">
                          ✕
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="empty-state" style={{ padding: 20 }}>
                      No payments recorded yet.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-outline" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}
