"use client";

import { Plus, Save, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { hasSupabasePublicEnv } from "@/lib/supabase/config";

const api = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5157";

const emptyOffer = {
  id: "new",
  title: "",
  description: "",
  discountType: "percentage",
  discountValue: 10,
  startsAtUtc: new Date().toISOString().slice(0, 16),
  endsAtUtc: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
  isActive: true,
  registeredCustomersOnly: false,
};

function toInputDate(value) {
  if (!value) return "";
  return String(value).slice(0, 16);
}

function toPayload(offer) {
  return {
    title: offer.title,
    description: offer.description,
    discountType: offer.discountType,
    discountValue: Number(offer.discountValue || 0),
    startsAtUtc: new Date(offer.startsAtUtc).toISOString(),
    endsAtUtc: new Date(offer.endsAtUtc).toISOString(),
    isActive: Boolean(offer.isActive),
    registeredCustomersOnly: Boolean(offer.registeredCustomersOnly),
  };
}

export default function AdminOffersManager({ initialOffers = [] }) {
  const [offers, setOffers] = useState(initialOffers);
  const [draft, setDraft] = useState(emptyOffer);
  const [query, setQuery] = useState("");
  const [savingId, setSavingId] = useState("");
  const [message, setMessage] = useState("");

  const filteredOffers = useMemo(() => {
    const value = query.trim().toLowerCase();
    if (!value) return offers;
    return offers.filter((offer) => `${offer.title} ${offer.description} ${offer.discountType}`.toLowerCase().includes(value));
  }, [offers, query]);

  function updateDraft(field, value) {
    setDraft((current) => ({ ...current, [field]: value }));
  }

  function updateLocal(id, field, value) {
    setOffers((current) => current.map((offer) => (offer.id === id ? { ...offer, [field]: value } : offer)));
  }

  async function getToken() {
    if (!hasSupabasePublicEnv()) {
      setMessage("Supabase keys missing. Admin offer update cannot be sent.");
      return "";
    }

    const supabase = createSupabaseBrowserClient();
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;

    if (!token) setMessage("Admin session expired. Please login again.");
    return token || "";
  }

  async function saveOffer(offer) {
    setSavingId(offer.id);
    setMessage("");

    if (!offer.title?.trim()) {
      setMessage("Offer title is required.");
      setSavingId("");
      return;
    }

    const token = await getToken();
    if (!token) {
      setSavingId("");
      return;
    }

    const isNew = offer.id === "new";
    const response = await fetch(`${api}/api/offers/admin${isNew ? "" : `/${offer.id}`}`, {
      method: isNew ? "POST" : "PATCH",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(toPayload(offer)),
    });

    if (!response.ok) {
      const result = await response.json().catch(() => ({}));
      setMessage(result.message || "Could not save offer.");
      setSavingId("");
      return;
    }

    const updated = await response.json();
    if (isNew) {
      setOffers((current) => [updated, ...current]);
      setDraft(emptyOffer);
    } else {
      setOffers((current) => current.map((item) => (item.id === updated.id ? updated : item)));
    }

    setMessage(isNew ? "Offer added successfully." : "Offer updated successfully.");
    setSavingId("");
  }

  async function deleteOffer(offer) {
    setSavingId(offer.id);
    setMessage("");

    const token = await getToken();
    if (!token) {
      setSavingId("");
      return;
    }

    const response = await fetch(`${api}/api/offers/admin/${offer.id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      const result = await response.json().catch(() => ({}));
      setMessage(result.message || "Could not deactivate offer.");
      setSavingId("");
      return;
    }

    const updated = await response.json();
    setOffers((current) => current.map((item) => (item.id === updated.id ? updated : item)));
    setMessage("Offer deactivated successfully.");
    setSavingId("");
  }

  return (
    <section className="admin-offers-manager">
      <div className="admin-manager-tools">
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search offer, discount type, description..." />
        {message && <p className="admin-inline-message">{message}</p>}
      </div>

      <article className="admin-offer-row admin-offer-row-new">
        <label>Title<input value={draft.title} onChange={(event) => updateDraft("title", event.target.value)} placeholder="Festival Home Care" /></label>
        <label>Type<select value={draft.discountType} onChange={(event) => updateDraft("discountType", event.target.value)}><option value="percentage">Percentage</option><option value="flat">Flat</option><option value="package">Package</option></select></label>
        <label>Value<input value={draft.discountValue} onChange={(event) => updateDraft("discountValue", event.target.value)} inputMode="decimal" placeholder="15" /></label>
        <label>Start<input value={toInputDate(draft.startsAtUtc)} onChange={(event) => updateDraft("startsAtUtc", event.target.value)} type="datetime-local" /></label>
        <label>End<input value={toInputDate(draft.endsAtUtc)} onChange={(event) => updateDraft("endsAtUtc", event.target.value)} type="datetime-local" /></label>
        <label>Status<select value={draft.isActive ? "active" : "inactive"} onChange={(event) => updateDraft("isActive", event.target.value === "active")}><option value="active">Active</option><option value="inactive">Inactive</option></select></label>
        <label>Reg Only<select value={draft.registeredCustomersOnly ? "yes" : "no"} onChange={(event) => updateDraft("registeredCustomersOnly", event.target.value === "yes")}><option value="no">No</option><option value="yes">Yes</option></select></label>
        <button className="button button-primary admin-save-button" type="button" disabled={savingId === "new"} onClick={() => saveOffer(draft)}>
          <Plus size={15} /> {savingId === "new" ? "Adding..." : "Add"}
        </button>
      </article>

      <div className="admin-offer-list">
        {filteredOffers.map((offer) => (
          <article className={offer.isActive ? "admin-offer-row" : "admin-offer-row muted"} key={offer.id}>
            <label>Title<input value={offer.title || ""} onChange={(event) => updateLocal(offer.id, "title", event.target.value)} /></label>
            <label>Type<select value={offer.discountType || "percentage"} onChange={(event) => updateLocal(offer.id, "discountType", event.target.value)}><option value="percentage">Percentage</option><option value="flat">Flat</option><option value="package">Package</option></select></label>
            <label>Value<input value={offer.discountValue || ""} onChange={(event) => updateLocal(offer.id, "discountValue", event.target.value)} inputMode="decimal" /></label>
            <label>Start<input value={toInputDate(offer.startsAtUtc)} onChange={(event) => updateLocal(offer.id, "startsAtUtc", event.target.value)} type="datetime-local" /></label>
            <label>End<input value={toInputDate(offer.endsAtUtc)} onChange={(event) => updateLocal(offer.id, "endsAtUtc", event.target.value)} type="datetime-local" /></label>
            <label>Status<select value={offer.isActive ? "active" : "inactive"} onChange={(event) => updateLocal(offer.id, "isActive", event.target.value === "active")}><option value="active">Active</option><option value="inactive">Inactive</option></select></label>
            <label>Reg Only<select value={offer.registeredCustomersOnly ? "yes" : "no"} onChange={(event) => updateLocal(offer.id, "registeredCustomersOnly", event.target.value === "yes")}><option value="no">No</option><option value="yes">Yes</option></select></label>
            <button className="button button-primary admin-save-button" type="button" disabled={savingId === offer.id} onClick={() => saveOffer(offer)}>
              <Save size={15} /> {savingId === offer.id ? "Saving..." : "Save"}
            </button>
            <button className="button button-ghost admin-save-button" type="button" disabled={savingId === offer.id || !offer.isActive} onClick={() => deleteOffer(offer)}>
              <Trash2 size={15} /> Hide
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}
