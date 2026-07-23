import React, { useEffect, useState } from "react";
import { StaffAPI } from "../api";

const emptyForm = { name: "", role: "Counsellor", phone: "", email: "" };

export default function Staff() {
  const [staff, setStaff] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  function load() {
    StaffAPI.list().then(setStaff).catch((err) => setError(err.message));
  }

  useEffect(load, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await StaffAPI.create(form);
      setForm(emptyForm);
      load();
    } catch (err) {
      setError(err?.response?.data?.error || err.message);
    } finally {
      setSaving(false);
    }
  }

  async function deactivate(id) {
    if (!window.confirm("Deactivate this staff member?")) return;
    await StaffAPI.remove(id);
    load();
  }

  return (
    <>
      <div className="topbar">
        <div>
          <h1>Staff</h1>
          <div className="topbar-sub">Manage counsellors and enquiry assignment</div>
        </div>
      </div>
      <div className="content">
        <div className="detail-grid">
          <div className="panel">
            <div className="panel-header"><h2>Team Members</h2></div>
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Role</th>
                    <th>Phone</th>
                    <th>Email</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {staff.map((s) => (
                    <tr key={s._id}>
                      <td><strong>{s.name}</strong></td>
                      <td>{s.role}</td>
                      <td>{s.phone || "—"}</td>
                      <td>{s.email || "—"}</td>
                      <td>{s.active ? "Active" : "Inactive"}</td>
                      <td>
                        {s.active && (
                          <button className="btn-ghost" onClick={() => deactivate(s._id)}>Deactivate</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {staff.length === 0 && (
                <div className="empty-state">No staff added yet.</div>
              )}
            </div>
          </div>

          <div className="panel">
            <div className="panel-header"><h2>Add Staff</h2></div>
            <div className="panel-body">
              {error && <p style={{ color: "var(--red)", fontSize: 12.5 }}>{error}</p>}
              <form onSubmit={handleSubmit} className="form-grid" style={{ gridTemplateColumns: "1fr" }}>
                <div className="form-field">
                  <label>Name *</label>
                  <input required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
                </div>
                <div className="form-field">
                  <label>Role</label>
                  <select value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}>
                    <option>Counsellor</option>
                    <option>Admissions Head</option>
                    <option>Front Office</option>
                    <option>Trainer</option>
                  </select>
                </div>
                <div className="form-field">
                  <label>Phone</label>
                  <input value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
                </div>
                <div className="form-field">
                  <label>Email</label>
                  <input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
                </div>
                <button className="btn btn-primary" disabled={saving} type="submit">
                  {saving ? "Adding…" : "Add Staff"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
