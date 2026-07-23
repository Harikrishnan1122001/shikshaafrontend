import axios from "axios";

const API_BASE = process.env.REACT_APP_API_URL || "https://shikshaabackend.vercel.app/api";

const client = axios.create({ baseURL: API_BASE });

export const StudentAPI = {
  list: (params) => client.get("/students", { params }).then((r) => r.data),
  get: (id) => client.get(`/students/${id}`).then((r) => r.data),
  create: (data) => client.post("/students", data).then((r) => r.data),
  update: (id, data) => client.put(`/students/${id}`, data).then((r) => r.data),
  remove: (id) => client.delete(`/students/${id}`).then((r) => r.data),
  stats: () => client.get("/students/stats/summary").then((r) => r.data),
  addPayment: (id, data) =>
    client.post(`/students/${id}/payments`, data).then((r) => r.data),
  removePayment: (id, paymentId) =>
    client.delete(`/students/${id}/payments/${paymentId}`).then((r) => r.data),
};

export const StaffAPI = {
  list: () => client.get("/staff").then((r) => r.data),
  create: (data) => client.post("/staff", data).then((r) => r.data),
  update: (id, data) => client.put(`/staff/${id}`, data).then((r) => r.data),
  remove: (id) => client.delete(`/staff/${id}`).then((r) => r.data),
};

export const OtpAPI = {
  send: (phone) => client.post("/otp/send", { phone }).then((r) => r.data),
  verify: (phone, otp) => client.post("/otp/verify", { phone, otp }).then((r) => r.data),
};

export const PaymentAPI = {
  list: (params) => client.get("/payments", { params }).then((r) => r.data),
  summary: (params) => client.get("/payments/summary", { params }).then((r) => r.data),
};

export function exportStudentsUrl(params) {
  const query = new URLSearchParams(params || {}).toString();
  return `${API_BASE}/export/students${query ? `?${query}` : ""}`;
}

export default client;