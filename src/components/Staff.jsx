import React, { useEffect, useState, useCallback } from "react";
import api from "../api";

const ROLES = ["Counsellor", "Trainer", "Admin", "Manager", "Other"];
const emptyForm = { name: "", email: "", phone: "", role: "Counsellor", active: true };

export default function Staff() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchStaff = useCallback(() => {
    setLoading(true);
    api
      .get("/staff")
      .then((res) => setStaff(res.data))
      .catch(() => setError("Could not load staff. Is the backend running?"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (s) => {
    setEditingId(s._id);
    setForm({ name: s.name, email: s.email || "", phone: s.phone || "", role: s.role, active: s.active });
    setShowModal(true);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        await api.put(`/staff/${editingId}`, form);
      } else {
        await api.post("/staff", form);
      }
      setShowModal(false);
      fetchStaff();
    } catch (err) {
      alert(err.response?.data?.message || "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Remove this staff member?")) return;
    try {
      await api.delete(`/staff/${id}`);
      fetchStaff();
    } catch (err) {
      alert(err.response?.data?.message || "Could not delete");
    }
  };

  return (
    <div>
      <header className="page-header page-header-row">
        <div>
          <h1>Staff</h1>
          <p>Manage counsellors and trainers who handle enquiries</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-primary" onClick={openAdd}>+ Add Staff</button>
        </div>
      </header>

      {error && <div className="alert-error">{error}</div>}

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th><th>Role</th><th>Phone</th><th>Email</th><th>Status</th><th></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="empty-row">Loading…</td></tr>
            ) : staff.length === 0 ? (
              <tr><td colSpan={6} className="empty-row">No staff added yet.</td></tr>
            ) : (
              staff.map((s) => (
                <tr key={s._id}>
                  <td className="cell-title">{s.name}</td>
                  <td>{s.role}</td>
                  <td>{s.phone}</td>
                  <td>{s.email}</td>
                  <td>
                    <span className={"pill " + (s.active ? "pill-green" : "pill-gray")}>
                      {s.active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="actions-cell">
                    <button className="link-btn" onClick={() => openEdit(s)}>Edit</button>
                    <button className="link-btn danger" onClick={() => handleDelete(s._id)}>Delete</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>{editingId ? "Edit Staff" : "Add Staff"}</h2>
            <form onSubmit={handleSubmit} className="form-grid">
              <label>
                Name *
                <input required name="name" value={form.name} onChange={handleChange} className="input" />
              </label>
              <label>
                Role
                <select name="role" value={form.role} onChange={handleChange} className="input">
                  {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </label>
              <label>
                Phone
                <input name="phone" value={form.phone} onChange={handleChange} className="input" />
              </label>
              <label>
                Email
                <input type="email" name="email" value={form.email} onChange={handleChange} className="input" />
              </label>
              <label className="checkbox-label">
                <input type="checkbox" name="active" checked={form.active} onChange={handleChange} />
                Active
              </label>

              <div className="modal-actions full-width">
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? "Saving..." : editingId ? "Save Changes" : "Add Staff"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
