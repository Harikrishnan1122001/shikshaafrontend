import React, { useEffect, useState, useCallback } from "react";
import api from "../api";

const PAY_MODES = ["Cash", "UPI", "Card", "Bank Transfer", "Other"];

// Helper: never let balance display as negative
const clampBalance = (val) => Math.max(0, Number(val) || 0);

function StatusPill({ status }) {
  const cls =
    status === "Fully Paid" ? "pill pill-green" :
    status === "Partial" ? "pill pill-orange" :
    status === "Overpaid" ? "pill pill-red" :
    "pill pill-gray";
  return <span className={cls}>{status}</span>;
}

export default function Payments() {
  const [records, setRecords] = useState([]);
  const [summary, setSummary] = useState({ totalFee: 0, totalDiscount: 0, totalPaid: 0, totalBalance: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const [activeRecord, setActiveRecord] = useState(null); // record being edited in modal
  const [feeForm, setFeeForm] = useState({ totalFee: "", discount: "" });
  const [payForm, setPayForm] = useState({ amount: "", mode: "Cash", note: "" });
  const [saving, setSaving] = useState(false);

  const fetchPayments = useCallback(() => {
    setLoading(true);
    api
      .get("/payments")
      .then((res) => {
        setRecords(res.data.records);
        setSummary(res.data.summary);
      })
      .catch(() => setError("Could not load payments. Is the backend running?"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const openRecord = (r) => {
    setActiveRecord(r);
    setFeeForm({ totalFee: r.totalFee || 0, discount: r.discount || 0 });
    setPayForm({ amount: "", mode: "Cash", note: "" });
  };

  const closeModal = () => setActiveRecord(null);

  const saveFee = async (e) => {
    e.preventDefault();

    const totalFee = Number(feeForm.totalFee) || 0;
    const discount = Number(feeForm.discount) || 0;

    if (totalFee <= 0) {
      alert("Total Fee must be greater than 0.");
      return;
    }
    if (discount > totalFee) {
      alert("Discount cannot be greater than Total Fee.");
      return;
    }

    setSaving(true);
    try {
      const res = await api.put(`/payments/student/${activeRecord.student._id}`, {
        totalFee,
        discount,
      });
      setActiveRecord((prev) => ({ ...prev, ...res.data }));
      fetchPayments();
    } catch (err) {
      alert(err.response?.data?.message || "Could not update fee");
    } finally {
      setSaving(false);
    }
  };

  const addPayment = async (e) => {
    e.preventDefault();

    if (!activeRecord.totalFee || activeRecord.totalFee <= 0) {
      alert("Set the Total Fee before recording a payment.");
      return;
    }
    if (!payForm.amount || Number(payForm.amount) <= 0) {
      alert("Enter a valid amount");
      return;
    }

    // Prevent overpayment beyond the remaining balance
    const remaining = clampBalance(activeRecord.balance);
    if (Number(payForm.amount) > remaining) {
      const proceed = window.confirm(
        `This payment (₹${Number(payForm.amount).toLocaleString("en-IN")}) exceeds the remaining balance (₹${remaining.toLocaleString("en-IN")}). Continue anyway?`
      );
      if (!proceed) return;
    }

    setSaving(true);
    try {
      const res = await api.post(`/payments/student/${activeRecord.student._id}/pay`, {
        amount: Number(payForm.amount),
        mode: payForm.mode,
        note: payForm.note,
      });
      setActiveRecord((prev) => ({ ...prev, ...res.data }));
      setPayForm({ amount: "", mode: "Cash", note: "" });
      fetchPayments();
    } catch (err) {
      alert(err.response?.data?.message || "Could not add payment");
    } finally {
      setSaving(false);
    }
  };

  const deletePaymentEntry = async (entryId) => {
    if (!window.confirm("Remove this payment entry?")) return;
    try {
      const res = await api.delete(`/payments/student/${activeRecord.student._id}/pay/${entryId}`);
      setActiveRecord((prev) => ({ ...prev, ...res.data }));
      fetchPayments();
    } catch (err) {
      alert(err.response?.data?.message || "Could not delete entry");
    }
  };

  const filteredRecords = records.filter((r) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      r.student?.name?.toLowerCase().includes(s) ||
      r.student?.phone?.toLowerCase().includes(s) ||
      r.student?.course?.toLowerCase().includes(s)
    );
  });

  return (
    <div>
      <header className="page-header">
        <h1>Payments</h1>
        <p>Track advance payments, balances and total revenue</p>
      </header>

      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-label">TOTAL FEES</div>
          <div className="stat-value dark">₹{(summary.totalFee || 0).toLocaleString("en-IN")}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">TOTAL DISCOUNT</div>
          <div className="stat-value dark">₹{(summary.totalDiscount || 0).toLocaleString("en-IN")}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">TOTAL COLLECTED</div>
          <div className="stat-value orange">₹{(summary.totalPaid || 0).toLocaleString("en-IN")}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">TOTAL BALANCE DUE</div>
          <div className="stat-value orange">₹{clampBalance(summary.totalBalance).toLocaleString("en-IN")}</div>
        </div>
      </div>

      <div className="filter-bar">
        <input
          className="input"
          placeholder="Search by name, phone or course..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {error && <div className="alert-error">{error}</div>}

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Student</th>
              <th>Course</th>
              <th>Total Fee</th>
              <th>Discount</th>
              <th>Paid</th>
              <th>Balance</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} className="empty-row">Loading…</td></tr>
            ) : filteredRecords.length === 0 ? (
              <tr><td colSpan={8} className="empty-row">No payment records found.</td></tr>
            ) : (
              filteredRecords.map((r) => {
                const balance = clampBalance(r.balance);
                return (
                  <tr key={r._id}>
                    <td>
                      <div className="cell-title">{r.student?.name}</div>
                      <div className="cell-sub">{r.student?.phone}</div>
                    </td>
                    <td>{r.student?.course}</td>
                    <td>₹{(r.totalFee || 0).toLocaleString("en-IN")}</td>
                    <td>₹{(r.discount || 0).toLocaleString("en-IN")}</td>
                    <td>₹{(r.totalPaid || 0).toLocaleString("en-IN")}</td>
                    <td className={balance > 0 ? "balance-due" : ""}>
                      ₹{balance.toLocaleString("en-IN")}
                    </td>
                    <td><StatusPill status={r.paymentStatus} /></td>
                    <td className="actions-cell">
                      <button className="link-btn" onClick={() => openRecord(r)}>Update</button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {activeRecord && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal modal-wide" onClick={(e) => e.stopPropagation()}>
            <h2>{activeRecord.student?.name}</h2>
            <p className="modal-subtitle">{activeRecord.student?.course} · {activeRecord.student?.phone}</p>

            <div className="modal-columns">
              <form onSubmit={saveFee} className="modal-section">
                <h4>Fee Details</h4>
                <label>
                  Total Fee (₹)
                  <input
                    type="number"
                    min="0"
                    className="input"
                    value={feeForm.totalFee}
                    onChange={(e) => setFeeForm((f) => ({ ...f, totalFee: e.target.value }))}
                  />
                </label>
                <label>
                  Discount (₹)
                  <input
                    type="number"
                    min="0"
                    className="input"
                    value={feeForm.discount}
                    onChange={(e) => setFeeForm((f) => ({ ...f, discount: e.target.value }))}
                  />
                </label>
                <button className="btn btn-outline" disabled={saving}>Save Fee Details</button>

                <div className="fee-summary">
                  <div><span>Paid</span><strong>₹{(activeRecord.totalPaid || 0).toLocaleString("en-IN")}</strong></div>
                  <div><span>Balance</span><strong>₹{clampBalance(activeRecord.balance).toLocaleString("en-IN")}</strong></div>
                </div>
              </form>

              <form onSubmit={addPayment} className="modal-section">
                <h4>Record a Payment</h4>
                <label>
                  Amount (₹)
                  <input
                    type="number"
                    min="0"
                    className="input"
                    value={payForm.amount}
                    onChange={(e) => setPayForm((f) => ({ ...f, amount: e.target.value }))}
                  />
                </label>
                <label>
                  Mode
                  <select
                    className="input"
                    value={payForm.mode}
                    onChange={(e) => setPayForm((f) => ({ ...f, mode: e.target.value }))}
                  >
                    {PAY_MODES.map((m) => <option key={m} value={m}>{m}</option>)}
                  </select>
                </label>
                <label>
                  Note
                  <input
                    className="input"
                    placeholder="e.g. Advance payment"
                    value={payForm.note}
                    onChange={(e) => setPayForm((f) => ({ ...f, note: e.target.value }))}
                  />
                </label>
                <button className="btn btn-primary" disabled={saving}>+ Add Payment</button>
              </form>
            </div>

            <div className="payment-history">
              <h4>Payment History</h4>
              {activeRecord.payments?.length ? (
                <table className="data-table compact">
                  <thead>
                    <tr><th>Date</th><th>Amount</th><th>Mode</th><th>Note</th><th></th></tr>
                  </thead>
                  <tbody>
                    {[...activeRecord.payments].reverse().map((p) => (
                      <tr key={p._id}>
                        <td>{new Date(p.date).toLocaleDateString()}</td>
                        <td>₹{p.amount.toLocaleString("en-IN")}</td>
                        <td>{p.mode}</td>
                        <td>{p.note}</td>
                        <td>
                          <button className="link-btn danger" onClick={() => deletePaymentEntry(p._id)}>Remove</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="cell-muted">No payments recorded yet.</p>
              )}
            </div>

            <div className="modal-actions">
              <button className="btn btn-outline" onClick={closeModal}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}