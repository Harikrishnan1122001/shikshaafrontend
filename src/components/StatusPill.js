import React from "react";

const map = {
  Enquiry: "pill-enquiry",
  "Follow-up": "pill-followup",
  Joined: "pill-joined",
  Dropped: "pill-dropped",
};

export default function StatusPill({ status }) {
  return <span className={`pill ${map[status] || "pill-enquiry"}`}>{status}</span>;
}
