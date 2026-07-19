"use client";

import { Plus, Save, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { hasSupabasePublicEnv } from "@/lib/supabase/config";

const api = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5157";

const emptyService = {
  id: "new",
  nameEnglish: "",
  nameMarathi: "",
  slug: "",
  descriptionEnglish: "",
  descriptionMarathi: "",
  startingPrice: "",
  offerPrice: "",
  displayOrder: 10,
  isActive: true,
};

function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function toPayload(service) {
  return {
    nameEnglish: service.nameEnglish,
    nameMarathi: service.nameMarathi || "",
    slug: service.slug,
    descriptionEnglish: service.descriptionEnglish || "",
    descriptionMarathi: service.descriptionMarathi || "",
    startingPrice: service.startingPrice === "" || service.startingPrice === null ? null : Number(service.startingPrice),
    offerPrice: service.offerPrice === "" || service.offerPrice === null ? null : Number(service.offerPrice),
    displayOrder: Number(service.displayOrder || 0),
    isActive: Boolean(service.isActive),
  };
}

export default function AdminServicesManager({ initialServices = [] }) {
  const [services, setServices] = useState(initialServices);
  const [draft, setDraft] = useState(emptyService);
  const [query, setQuery] = useState("");
  const [savingId, setSavingId] = useState("");
  const [message, setMessage] = useState("");

  const filteredServices = useMemo(() => {
    const value = query.trim().toLowerCase();
    if (!value) return services;
    return services.filter((service) => `${service.nameEnglish} ${service.nameMarathi} ${service.slug}`.toLowerCase().includes(value));
  }, [query, services]);

  function updateLocal(id, field, value) {
    setServices((current) => current.map((service) => (service.id === id ? { ...service, [field]: value } : service)));
  }

  function updateDraft(field, value) {
    setDraft((current) => {
      const next = { ...current, [field]: value };
      if (field === "nameEnglish" && !current.slug) next.slug = slugify(value);
      return next;
    });
  }

  async function getToken() {
    if (!hasSupabasePublicEnv()) {
      setMessage("Supabase keys missing. Admin service update cannot be sent.");
      return "";
    }

    const supabase = createSupabaseBrowserClient();
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;

    if (!token) setMessage("Admin session expired. Please login again.");
    return token || "";
  }

  async function saveService(service) {
    setSavingId(service.id);
    setMessage("");

    if (!service.nameEnglish?.trim() || !service.slug?.trim()) {
      setMessage("Service name and slug are required.");
      setSavingId("");
      return;
    }

    const token = await getToken();
    if (!token) {
      setSavingId("");
      return;
    }

    const isNew = service.id === "new";
    const response = await fetch(`${api}/api/services/admin${isNew ? "" : `/${service.id}`}`, {
      method: isNew ? "POST" : "PATCH",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(toPayload(service)),
    });

    if (!response.ok) {
      const result = await response.json().catch(() => ({}));
      setMessage(result.message || "Could not save service.");
      setSavingId("");
      return;
    }

    const updated = await response.json();
    if (isNew) {
      setServices((current) => [...current, updated].sort((a, b) => a.displayOrder - b.displayOrder));
      setDraft(emptyService);
    } else {
      setServices((current) => current.map((item) => (item.id === updated.id ? updated : item)));
    }

    setMessage(isNew ? "Service added successfully." : "Service updated successfully.");
    setSavingId("");
  }

  async function deleteService(service) {
    setSavingId(service.id);
    setMessage("");

    const token = await getToken();
    if (!token) {
      setSavingId("");
      return;
    }

    const response = await fetch(`${api}/api/services/admin/${service.id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      const result = await response.json().catch(() => ({}));
      setMessage(result.message || "Could not deactivate service.");
      setSavingId("");
      return;
    }

    const updated = await response.json();
    setServices((current) => current.map((item) => (item.id === updated.id ? updated : item)));
    setMessage("Service deactivated successfully.");
    setSavingId("");
  }

  return (
    <section className="admin-services-manager">
      <div className="admin-manager-tools">
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search service name, Marathi name, slug..." />
        {message && <p className="admin-inline-message">{message}</p>}
      </div>

      <article className="admin-service-row admin-service-row-new">
        <label>Name<input value={draft.nameEnglish} onChange={(event) => updateDraft("nameEnglish", event.target.value)} placeholder="Bed Bug Control" /></label>
        <label>Slug<input value={draft.slug} onChange={(event) => updateDraft("slug", slugify(event.target.value))} placeholder="bed-bug-control" /></label>
        <label>Base Rate<input value={draft.startingPrice} onChange={(event) => updateDraft("startingPrice", event.target.value)} inputMode="decimal" placeholder="1200" /></label>
        <label>Offer Rate<input value={draft.offerPrice} onChange={(event) => updateDraft("offerPrice", event.target.value)} inputMode="decimal" placeholder="999" /></label>
        <label>Order<input value={draft.displayOrder} onChange={(event) => updateDraft("displayOrder", event.target.value)} inputMode="numeric" /></label>
        <button className="button button-primary admin-save-button" type="button" disabled={savingId === "new"} onClick={() => saveService(draft)}>
          <Plus size={15} /> {savingId === "new" ? "Adding..." : "Add"}
        </button>
      </article>

      <div className="admin-service-list">
        {filteredServices.map((service) => (
          <article className={service.isActive ? "admin-service-row" : "admin-service-row muted"} key={service.id}>
            <label>Name<input value={service.nameEnglish || ""} onChange={(event) => updateLocal(service.id, "nameEnglish", event.target.value)} /></label>
            <label>Slug<input value={service.slug || ""} onChange={(event) => updateLocal(service.id, "slug", slugify(event.target.value))} /></label>
            <label>Base Rate<input value={service.startingPrice || ""} onChange={(event) => updateLocal(service.id, "startingPrice", event.target.value)} inputMode="decimal" /></label>
            <label>Offer Rate<input value={service.offerPrice || ""} onChange={(event) => updateLocal(service.id, "offerPrice", event.target.value)} inputMode="decimal" /></label>
            <label>Order<input value={service.displayOrder || 0} onChange={(event) => updateLocal(service.id, "displayOrder", event.target.value)} inputMode="numeric" /></label>
            <label>Status<select value={service.isActive ? "active" : "inactive"} onChange={(event) => updateLocal(service.id, "isActive", event.target.value === "active")}><option value="active">Active</option><option value="inactive">Inactive</option></select></label>
            <button className="button button-primary admin-save-button" type="button" disabled={savingId === service.id} onClick={() => saveService(service)}>
              <Save size={15} /> {savingId === service.id ? "Saving..." : "Save"}
            </button>
            <button className="button button-ghost admin-save-button" type="button" disabled={savingId === service.id || !service.isActive} onClick={() => deleteService(service)}>
              <Trash2 size={15} /> Hide
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}
