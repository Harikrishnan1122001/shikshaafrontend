import React, { useEffect, useState } from "react";
import { OtpAPI } from "../api";

const emptyForm = {
  source: "Walk-in",
  name: "",
  phone: "",
  phoneVerified: false,
  address: "",
  email: "",
  courseEnquired: "",
  assignedStaff: "",
  status: "Enquiry",
  followUpDate: "",
  notes: "",
  courseFeesQuoted: "",
  totalFee: "",
  joiningDate: "",
  franchiseName: "",
  batch: "",
};

export default function EnquiryFormModal({ initial, staffList, onClose, onSave }) {
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [otpStage, setOtpStage] = useState("idle"); // idle | sent | verified
  const [otpValue, setOtpValue] = useState("");
  const [otpDemo, setOtpDemo] = useState("");
  const [otpMsg, setOtpMsg] = useState("");
  const [otpBusy, setOtpBusy] = useState(false);

  useEffect(() => {
    if (initial) {
      setForm({
        ...emptyForm,
        ...initial,
        assignedStaff: initial.assignedStaff?._id || initial.assignedStaff || "",
        followUpDate: initial.followUpDate ? initial.followUpDate.slice(0, 10) : "",
        joiningDate: initial.joiningDate ? initial.joiningDate.slice(0, 10) : "",
      });
      setOtpStage(initial.phoneVerified ? "verified" : "idle");
    }
  }, [initial]);

  async function sendOtp() {
    if (!form.phone || form.phone.trim().length < 6) {
      setOtpMsg("Enter a valid phone number first");
      return;
    }
    setOtpBusy(true);
    setOtpMsg("");
    try {
      const res = await OtpAPI.send(form.phone);
      setOtpStage("sent");
      setOtpDemo(res.demoOtp || "");
      setOtpMsg(res.message || "OTP sent");
    } catch (err) {
      setOtpMsg(err?.response?.data?.error || "Failed to send OTP");
    } finally {
      setOtpBusy(false);
    }
  }

  async function verifyOtp() {
    setOtpBusy(true);
    setOtpMsg("");
    try {
      await OtpAPI.verify(form.phone, otpValue);
      setOtpStage("verified");
      setForm((f) => ({ ...f, phoneVerified: true }));
      setOtpMsg("Phone number verified");
    } catch (err) {
      setOtpMsg(err?.response?.data?.error || "Verification failed");
    } finally {
      setOtpBusy(false);
    }
  }

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload = {
        ...form,
        courseFeesQuoted: Number(form.courseFeesQuoted) || 0,
        totalFee: Number(form.totalFee) || 0,
        assignedStaff: form.assignedStaff || null,
        followUpDate: form.followUpDate || null,
        joiningDate: form.joiningDate || null,
      };
      await onSave(payload);
    } catch (err) {
      setError(err?.response?.data?.error || err.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2>{initial ? "Edit Enquiry" : "New Enquiry"}</h2>
          <button className="close-x" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && <p style={{ color: "var(--red)", fontSize: 12.5 }}>{error}</p>}
            <div className="form-grid">
              <div className="form-section-title">Enquiry Details</div>

              <div className="form-field">
                <label>Source</label>
                <select value={form.source} onChange={(e) => update("source", e.target.value)}>
                  <option>Walk-in</option>
                  <option>Call</option>
                  <option>Online</option>
                  <option>Reference</option>
                </select>
              </div>
              <div className="form-field">
                <label>Student Name *</label>
                <input
                  required
                  value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                  placeholder="Full name"
                />
              </div>
              <div className="form-field">
                <label>Phone No *</label>
                <div style={{ display: "flex", gap: 6 }}>
                  <input
                    required
                    style={{ flex: 1 }}
                    value={form.phone}
                    onChange={(e) => {
                      update("phone", e.target.value);
                      update("phoneVerified", false);
                      setOtpStage("idle");
                      setOtpMsg("");
                    }}
                    placeholder="10-digit number"
                  />
                  {otpStage === "verified" ? (
                    <span
                      className="pill pill-joined"
                      style={{ alignSelf: "center", whiteSpace: "nowrap" }}
                    >
                      ✓ Verified
                    </span>
                  ) : (
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      disabled={otpBusy}
                      onClick={sendOtp}
                    >
                      {otpStage === "sent" ? "Resend OTP" : "Send OTP"}
                    </button>
                  )}
                </div>
                {otpStage === "sent" && (
                  <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
                    <input
                      style={{ flex: 1 }}
                      value={otpValue}
                      onChange={(e) => setOtpValue(e.target.value)}
                      placeholder="Enter OTP"
                      maxLength={4}
                    />
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      disabled={otpBusy || !otpValue}
                      onClick={verifyOtp}
                    >
                      Verify
                    </button>
                  </div>
                )}
                {otpMsg && (
                  <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>
                    {otpMsg}
                    {otpDemo && otpStage === "sent" ? ` — demo code: ${otpDemo}` : ""}
                  </div>
                )}
              </div>
              <div className="form-field">
                <label>Mail ID</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                  placeholder="name@example.com"
                />
              </div>
              <div className="form-field full">
                <label>Address</label>
                <input
                  value={form.address}
                  onChange={(e) => update("address", e.target.value)}
                />
              </div>
              <div className="form-field">
                <label>Course Enquired</label>
                <input
                  value={form.courseEnquired}
                  onChange={(e) => update("courseEnquired", e.target.value)}
                />
              </div>
              <div className="form-field">
                <label>Assigned Staff</label>
                <select
                  value={form.assignedStaff}
                  onChange={(e) => update("assignedStaff", e.target.value)}
                >
                  <option value="">Unassigned</option>
                  {staffList.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.name} ({s.role})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-field">
                <label>Status</label>
                <select value={form.status} onChange={(e) => update("status", e.target.value)}>
                  <option>Enquiry</option>
                  <option>Follow-up</option>
                  <option>Joined</option>
                  <option>Dropped</option>
                </select>
              </div>
              <div className="form-field">
                <label>Follow-up Date</label>
                <input
                  type="date"
                  value={form.followUpDate}
                  onChange={(e) => update("followUpDate", e.target.value)}
                />
              </div>
              <div className="form-field full">
                <label>Notes</label>
                <textarea
                  rows={2}
                  value={form.notes}
                  onChange={(e) => update("notes", e.target.value)}
                />
              </div>

              <div className="form-section-title">Joining &amp; Fee Details</div>
              <div className="form-field">
                <label>Course Fees Quoted</label>
                <input
                  type="number"
                  min="0"
                  value={form.courseFeesQuoted}
                  onChange={(e) => update("courseFeesQuoted", e.target.value)}
                />
              </div>
              <div className="form-field">
                <label>Total Fee (final)</label>
                <input
                  type="number"
                  min="0"
                  value={form.totalFee}
                  onChange={(e) => update("totalFee", e.target.value)}
                />
              </div>
              <div className="form-field">
                <label>Joining Date</label>
                <input
                  type="date"
                  value={form.joiningDate}
                  onChange={(e) => update("joiningDate", e.target.value)}
                />
              </div>
              <div className="form-field">
                <label>Batch</label>
                <input value={form.batch} onChange={(e) => update("batch", e.target.value)} />
              </div>
              <div className="form-field full">
                <label>Franchise Name</label>
                <input
                  value={form.franchiseName}
                  onChange={(e) => update("franchiseName", e.target.value)}
                />
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? "Saving…" : "Save Enquiry"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
