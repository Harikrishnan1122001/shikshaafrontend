import axios from "axios";

// In local development, use a relative path so requests go to the
// CRA dev server (http://localhost:3000/api/...) and get proxied
// server-side to the backend (see "proxy" in package.json). This
// avoids the browser CORS check entirely, since the browser only
// ever talks to localhost:3000 — the proxy hop happens outside the browser.
//
// In production (the built app), there is no dev-server proxy, so we
// call the deployed backend directly. REACT_APP_API_URL can still
// override either case if you need to point at a different backend.
const isLocalDev = process.env.NODE_ENV === "development";
const API_URL = isLocalDev
  ? "/api"
  : process.env.REACT_APP_API_URL || "https://shikshaabackend.vercel.app/api";

const api = axios.create({
  baseURL: API_URL,
});

export const downloadStudentsExcel = async () => {
  const response = await axios.get(`${API_URL}/export/students`, { responseType: "blob" });
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `shikshaa-students-${Date.now()}.xlsx`);
  document.body.appendChild(link);
  link.click();
  link.remove();
};

export default api;
