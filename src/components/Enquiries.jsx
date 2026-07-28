import React, { useEffect, useState, useCallback } from "react";
import api, { downloadStudentsExcel } from "../api";

const emptyForm = {
  name: "",
  phone: "",
  email: "",
  course: "",
  source: "Walk-in",
  isWalkIn: false,
  staffAssigned: "",
  status: "Enquiry",
  followUpDate: "",
  notes: "",
};

const STATUS_OPTIONS = ["Enquiry", "Follow-up", "Joined", "Not Interested"];
const SOURCE_OPTIONS = ["Walk-in", "Phone", "Online", "Referral", "Social Media", "Other"];

export default function Enquiries() {
  const [students, setStudents] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [filters, setFilters] = useState({
    search: "",
    status: "",
    staff: "",
    source: "",
    walkIn: "",
    from: "",
    to: "",
  });

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchStaff = useCallback(() => {
    api.get("/staff").then((res) => setStaffList(res.data)).catch(() => {});
  }, []);

  const fetchStudents = useCallback(() => {
    setLoading(true);
    const params = {};
    Object.entries(filters).forEach(([k, v]) => {
      if (v) params[k] = v;
    });
    api
      .get("/students", { params })
      .then((res) => setStudents(res.data))
      .catch(() => setError("Could not load students. Is the backend running?"))
      .finally(() => setLoading(false));
  }, [filters]);

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  useEffect(() => {
    const t = setTimeout(fetchStudents, 300); // debounce search
    return () => clearTimeout(t);
  }, [fetchStudents]);

  const openAddModal = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEditModal = (s) => {
    setEditingId(s._id);
    setForm({
      name: s.name || "",
      phone: s.phone || "",
      email: s.email || "",
      course: s.course || "",
      source: s.source || "Walk-in",
      isWalkIn: !!s.isWalkIn,
      staffAssigned: s.staffAssigned?._id || "",
      status: s.status || "Enquiry",
      followUpDate: s.followUpDate ? s.followUpDate.substring(0, 10) : "",
      notes: s.notes || "",
    });
    setShowModal(true);
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form };
      if (!payload.staffAssigned) payload.staffAssigned = null;
      if (!payload.followUpDate) payload.followUpDate = null;

      if (editingId) {
        await api.put(`/students/${editingId}`, payload);
      } else {
        await api.post("/students", payload);
      }
      setShowModal(false);
      fetchStudents();
    } catch (err) {
      alert(err.response?.data?.message || "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this student record? This cannot be undone.")) return;
    try {
      await api.delete(`/students/${id}`);
      fetchStudents();
    } catch (err) {
      alert(err.response?.data?.message || "Could not delete");
    }
  };

  const quickStatusChange = async (id, status) => {
    try {
      await api.put(`/students/${id}`, { status });
      fetchStudents();
    } catch (err) {
      alert(err.response?.data?.message || "Could not update status");
    }
  };

  return (
    <div>
      <header className="page-header page-header-row">
        <div>
          <h1>Enquiries &amp; Walk-ins</h1>
          <p>Log enquiries, track follow-ups and manage walk-ins</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-outline" onClick={downloadStudentsExcel}>
            ⬇ Export to Excel
          </button>
          <button className="btn btn-primary" onClick={openAddModal}>
            + Add Enquiry
          </button>
        </div>
      </header>

      <div className="filter-bar">
        <input
          className="input"
          placeholder="Search name, phone, email, course..."
          value={filters.search}
          onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
        />
        <select
          className="input"
          value={filters.status}
          onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
        >
          <option value="">All Statuses</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <select
          className="input"
          value={filters.staff}
          onChange={(e) => setFilters((f) => ({ ...f, staff: e.target.value }))}
        >
          <option value="">All Staff</option>
          {staffList.map((s) => (
            <option key={s._id} value={s._id}>{s.name}</option>
          ))}
        </select>
        <select
          className="input"
          value={filters.source}
          onChange={(e) => setFilters((f) => ({ ...f, source: e.target.value }))}
        >
          <option value="">All Sources</option>
          {SOURCE_OPTIONS.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <select
          className="input"
          value={filters.walkIn}
          onChange={(e) => setFilters((f) => ({ ...f, walkIn: e.target.value }))}
        >
          <option value="">Walk-in: All</option>
          <option value="true">Walk-in Only</option>
          <option value="false">Non Walk-in</option>
        </select>
        <input
          type="date"
          className="input"
          value={filters.from}
          onChange={(e) => setFilters((f) => ({ ...f, from: e.target.value }))}
        />
        <input
          type="date"
          className="input"
          value={filters.to}
          onChange={(e) => setFilters((f) => ({ ...f, to: e.target.value }))}
        />
      </div>

      {error && <div className="alert-error">{error}</div>}

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Contact</th>
              <th>Course</th>
              <th>Source</th>
              <th>Staff</th>
              <th>Status</th>
              <th>Follow-up</th>
              <th>Enquiry Date</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={9} className="empty-row">Loading…</td></tr>
            ) : students.length === 0 ? (
              <tr><td colSpan={9} className="empty-row">No records found. Click "Add Enquiry" to create one.</td></tr>
            ) : (
              students.map((s) => (
                <tr key={s._id}>
                  <td>
                    <div className="cell-title">{s.name}</div>
                    {s.isWalkIn && <span className="badge badge-walkin">Walk-in</span>}
                  </td>
                  <td>
                    <div>{s.phone}</div>
                    <div className="cell-sub">{s.email}</div>
                  </td>
                  <td>{s.course}</td>
                  <td>{s.source}</td>
                  <td>{s.staffAssigned?.name || <span className="cell-muted">Unassigned</span>}</td>
                  <td>
                    <select
                      className={"status-select status-" + s.status.replace(/\s/g, "").toLowerCase()}
                      value={s.status}
                      onChange={(e) => quickStatusChange(s._id, e.target.value)}
                    >
                      {STATUS_OPTIONS.map((st) => (
                        <option key={st} value={st}>{st}</option>
                      ))}
                    </select>
                  </td>
                  <td>{s.followUpDate ? new Date(s.followUpDate).toLocaleDateString() : "—"}</td>
                  <td>{new Date(s.createdAt).toLocaleDateString()}</td>
                  <td className="actions-cell">
                    <button className="link-btn" onClick={() => openEditModal(s)}>Edit</button>
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
            <h2>{editingId ? "Edit Enquiry" : "Add New Enquiry"}</h2>
            <form onSubmit={handleSubmit} className="form-grid">
              <label>
                Full Name *
                <input required name="name" value={form.name} onChange={handleFormChange} className="input" />
              </label>
              <label>
                Phone *
                <input required name="phone" value={form.phone} onChange={handleFormChange} className="input" />
              </label>
              <label>
                Email
                <input type="email" name="email" value={form.email} onChange={handleFormChange} className="input" />
              </label>
              <label>
                Course *
                <input required name="course" value={form.course} onChange={handleFormChange} className="input" />
              </label>
              <label>
                Source
                <select name="source" value={form.source} onChange={handleFormChange} className="input">
                  {SOURCE_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </label>
              <label>
                Staff Assigned
                <select name="staffAssigned" value={form.staffAssigned} onChange={handleFormChange} className="input">
                  <option value="">Unassigned</option>
                  {staffList.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
                </select>
              </label>
              <label>
                Status
                <select name="status" value={form.status} onChange={handleFormChange} className="input">
                  {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </label>
              <label>
                Follow-up Date
                <input type="date" name="followUpDate" value={form.followUpDate} onChange={handleFormChange} className="input" />
              </label>
              <label className="checkbox-label">
                <input type="checkbox" name="isWalkIn" checked={form.isWalkIn} onChange={handleFormChange} />
                Mark as Walk-in
              </label>
              <label className="full-width">
                Notes
                <textarea name="notes" value={form.notes} onChange={handleFormChange} className="input" rows={3} />
              </label>

              <div className="modal-actions full-width">
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? "Saving..." : editingId ? "Save Changes" : "Add Enquiry"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
