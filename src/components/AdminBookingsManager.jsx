"use client";

import { Save } from "lucide-react";
import { useMemo, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { hasSupabasePublicEnv } from "@/lib/supabase/config";

const api = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5157";
const statuses = ["New", "Contacted", "Confirmed", "InProgress", "Completed", "Cancelled"];
const leadSources = ["Website", "Phone", "WhatsApp", "Justdial", "Referral", "Repeat Customer", "Other"];
const paymentStatuses = ["Pending", "Partial", "Paid"];
const paymentModes = ["", "Cash", "UPI", "Bank Transfer", "Card"];

export default function AdminBookingsManager({ initialRequests = [] }) {
  const [requests, setRequests] = useState(initialRequests);
  const [query, setQuery] = useState("");
  const [savingId, setSavingId] = useState("");
  const [message, setMessage] = useState("");

  const filteredRequests = useMemo(() => {
    const value = query.trim().toLowerCase();
    if (!value) return requests;
    return requests.filter((request) => `${request.fullName} ${request.phone} ${request.serviceName} ${request.leadSource} ${request.status}`.toLowerCase().includes(value));
  }, [query, requests]);

  function updateLocal(id, field, value) {
    setRequests((current) => current.map((request) => (request.id === id ? { ...request, [field]: value } : request)));
  }

  async function saveRequest(request) {
    setSavingId(request.id);
    setMessage("");

    if (!hasSupabasePublicEnv()) {
      setMessage("Supabase keys missing. Admin update cannot be sent.");
      setSavingId("");
      return;
    }

    const supabase = createSupabaseBrowserClient();
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;

    if (!token) {
      setMessage("Admin session expired. Please login again.");
      setSavingId("");
      return;
    }

    const response = await fetch(`${api}/api/service-requests/admin/${request.id}`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        serviceName: request.serviceName,
        leadSource: request.leadSource,
        status: request.status,
        adminNote: request.adminNote,
        serviceAmount: request.serviceAmount ? Number(request.serviceAmount) : null,
        advancePaid: request.advancePaid ? Number(request.advancePaid) : null,
        paymentStatus: request.paymentStatus,
        paymentMode: request.paymentMode,
        invoiceNumber: request.invoiceNumber,
        completedAtUtc: request.status === "Completed" ? request.completedAtUtc || new Date().toISOString() : request.completedAtUtc,
      }),
    });

    if (!response.ok) {
      const result = await response.json().catch(() => ({}));
      setMessage(result.message || "Could not update booking.");
      setSavingId("");
      return;
    }

    const updated = await response.json();
    setRequests((current) => current.map((item) => (item.id === updated.id ? updated : item)));
    setMessage("Booking updated successfully.");
    setSavingId("");
  }

  if (!requests.length) {
    return (
      <div className="admin-manage-empty">
        <h3>No live bookings yet</h3>
        <p>Once website, phone, WhatsApp or Justdial enquiries are added, they will be editable here.</p>
      </div>
    );
  }

  return (
    <section className="admin-booking-manager">
      <div className="admin-manager-tools">
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Filter by customer, phone, service, source..." />
        {message && <p className="admin-inline-message">{message}</p>}
      </div>
      <div className="admin-manage-list">
        {filteredRequests.map((request) => (
          <article className="admin-manage-row" key={request.id}>
            <div className="admin-manage-primary">
              <strong>{request.fullName}</strong>
              <small>{request.phone} - {request.city} - {request.preferredDate || "Date pending"}</small>
            </div>
            <label>Service<input value={request.serviceName || ""} onChange={(event) => updateLocal(request.id, "serviceName", event.target.value)} /></label>
            <label>Source<select value={request.leadSource || "Website"} onChange={(event) => updateLocal(request.id, "leadSource", event.target.value)}>{leadSources.map((source) => <option key={source}>{source}</option>)}</select></label>
            <label>Status<select value={request.status || "New"} onChange={(event) => updateLocal(request.id, "status", event.target.value)}>{statuses.map((status) => <option key={status}>{status}</option>)}</select></label>
            <label>Amount<input value={request.serviceAmount || ""} onChange={(event) => updateLocal(request.id, "serviceAmount", event.target.value)} inputMode="decimal" placeholder="0" /></label>
            <label>Advance<input value={request.advancePaid || ""} onChange={(event) => updateLocal(request.id, "advancePaid", event.target.value)} inputMode="decimal" placeholder="0" /></label>
            <label>Payment<select value={request.paymentStatus || "Pending"} onChange={(event) => updateLocal(request.id, "paymentStatus", event.target.value)}>{paymentStatuses.map((status) => <option key={status}>{status}</option>)}</select></label>
            <label>Mode<select value={request.paymentMode || ""} onChange={(event) => updateLocal(request.id, "paymentMode", event.target.value)}>{paymentModes.map((mode) => <option key={mode} value={mode}>{mode || "Select"}</option>)}</select></label>
            <label>Invoice<input value={request.invoiceNumber || ""} onChange={(event) => updateLocal(request.id, "invoiceNumber", event.target.value)} placeholder="INV-001" /></label>
            <button className="button button-primary admin-save-button" type="button" disabled={savingId === request.id} onClick={() => saveRequest(request)}>
              <Save size={15} /> {savingId === request.id ? "Saving..." : "Save"}
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}
