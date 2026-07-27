"use client";

import { useState } from "react";
import { Plus, Save, Trash2, Upload } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { hasSupabasePublicEnv } from "@/lib/supabase/config";

const api = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5157";

const emptyDraft = { id: "new", imageUrl: "", captionEnglish: "", captionMarathi: "", displayOrder: 10, isActive: true };

export default function AdminGalleryManager({ initialItems = [] }) {
  const [items, setItems] = useState(initialItems);
  const [draft, setDraft] = useState(emptyDraft);
  const [message, setMessage] = useState("");
  const [savingId, setSavingId] = useState("");
  const [uploading, setUploading] = useState(false);

  function updateDraft(field, value) {
    setDraft((d) => ({ ...d, [field]: value }));
  }

  async function getToken() {
    if (!hasSupabasePublicEnv()) {
      setMessage("Supabase keys missing. Admin actions require Supabase env keys.");
      return "";
    }

    const supabase = createSupabaseBrowserClient();
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (!token) setMessage("Admin session expired. Please login again.");
    return token || "";
  }

  async function uploadFile(file) {
    if (!hasSupabasePublicEnv()) {
      setMessage("Supabase keys missing. Cannot upload.");
      return null;
    }

    const supabase = createSupabaseBrowserClient();
    const bucket = "gallery";
    setUploading(true);

    // ensure file name unique
    const filename = `${Date.now()}-${file.name}`;
    const { error: uploadError, data } = await supabase.storage.from(bucket).upload(filename, file, { cacheControl: "3600", upsert: false });
    setUploading(false);

    if (uploadError) {
      setMessage(uploadError.message || "Upload failed. Make sure a 'gallery' bucket exists in Supabase Storage.");
      return null;
    }

    const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(data.path);
    return publicUrlData.publicUrl;
  }

  async function saveItem(isNew) {
    setSavingId(draft.id);
    setMessage("");

    const payload = {
      imageUrl: draft.imageUrl,
      captionEnglish: draft.captionEnglish || "",
      captionMarathi: draft.captionMarathi || "",
      isActive: Boolean(draft.isActive),
      displayOrder: Number(draft.displayOrder || 0),
    };

    const token = await getToken();
    if (!token) { setSavingId(""); return; }

    const response = await fetch(`${api}/api/gallery/admin${isNew ? "" : `/${draft.id}`}`, {
      method: isNew ? "POST" : "PATCH",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const res = await response.json().catch(() => ({}));
      setMessage(res.message || "Could not save gallery item.");
      setSavingId("");
      return;
    }

    const updated = await response.json();
    if (isNew) {
      setItems((cur) => [...cur, updated].sort((a, b) => a.displayOrder - b.displayOrder));
      setDraft(emptyDraft);
    } else {
      setItems((cur) => cur.map((it) => (it.id === updated.id ? updated : it)));
    }

    setMessage(isNew ? "Gallery item added." : "Gallery item updated.");
    setSavingId("");
  }

  async function deleteItem(item) {
    setSavingId(item.id);
    setMessage("");

    const token = await getToken();
    if (!token) { setSavingId(""); return; }

    const response = await fetch(`${api}/api/gallery/admin/${item.id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      const res = await response.json().catch(() => ({}));
      setMessage(res.message || "Could not remove gallery item.");
      setSavingId("");
      return;
    }

    const updated = await response.json();
    setItems((cur) => cur.map((it) => (it.id === updated.id ? updated : it)));
    setMessage("Gallery item hidden.");
    setSavingId("");
  }

  async function handleFileInput(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    setMessage("");
    const url = await uploadFile(file);
    if (url) updateDraft("imageUrl", url);
  }

  return (
    <section className="admin-panel admin-gallery-manager">
      <div className="admin-panel-head">
        <h2>Gallery Manager</h2>
        <span>Manage public gallery — image URL or upload via Supabase Storage.</span>
      </div>

      <div className="admin-manager-tools">
        {message && <div className="form-message">{message}</div>}
      </div>

      <article className="admin-gallery-form">
        <label>Image URL
          <input value={draft.imageUrl} onChange={(e) => updateDraft("imageUrl", e.target.value)} placeholder="https://..." />
        </label>

        <label>Or upload image (Supabase Storage)
          <div className="upload-row">
            <input type="file" accept="image/*" onChange={handleFileInput} />
            <button type="button" className="button button-ghost" disabled={uploading} onClick={() => document.querySelector('.admin-gallery-form input[type=file]').click()}>
              <Upload size={14} /> {uploading ? "Uploading..." : "Choose file"}
            </button>
          </div>
        </label>

        <label>Caption (English)
          <input value={draft.captionEnglish} onChange={(e) => updateDraft("captionEnglish", e.target.value)} />
        </label>

        <label>Caption (Marathi)
          <input value={draft.captionMarathi} onChange={(e) => updateDraft("captionMarathi", e.target.value)} />
        </label>

        <label>Display order
          <input value={draft.displayOrder} onChange={(e) => updateDraft("displayOrder", e.target.value)} inputMode="numeric" />
        </label>

        <label>Status
          <select value={draft.isActive ? "active" : "inactive"} onChange={(e) => updateDraft("isActive", e.target.value === "active")}>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </label>

        <div className="admin-form-actions">
          <button className="button button-primary" type="button" disabled={savingId === draft.id} onClick={() => saveItem(true)}>
            <Plus size={14} /> Add
          </button>
          <button className="button button-ghost" type="button" disabled={savingId === draft.id} onClick={() => { setDraft(emptyDraft); setMessage(""); }}>
            Reset
          </button>
        </div>
      </article>

      <div className="admin-gallery-list">
        {items.map((item) => (
          <article key={item.id} className={item.isActive ? "admin-gallery-row" : "admin-gallery-row muted"}>
            <div className="thumb"><img src={item.imageUrl} alt={item.captionEnglish || "Image"} /></div>
            <div className="meta">
              <input value={item.captionEnglish || ""} onChange={(e) => setItems((cur) => cur.map((it) => (it.id === item.id ? { ...it, captionEnglish: e.target.value } : it)))} />
              <input value={item.captionMarathi || ""} onChange={(e) => setItems((cur) => cur.map((it) => (it.id === item.id ? { ...it, captionMarathi: e.target.value } : it)))} />
              <input value={item.displayOrder || 0} onChange={(e) => setItems((cur) => cur.map((it) => (it.id === item.id ? { ...it, displayOrder: Number(e.target.value) } : it)))} inputMode="numeric" />
              <label>Status<select value={item.isActive ? "active" : "inactive"} onChange={(e) => setItems((cur) => cur.map((it) => (it.id === item.id ? { ...it, isActive: e.target.value === "active" } : it)))}><option value="active">Active</option><option value="inactive">Inactive</option></select></label>

              <div className="row-actions">
                <button className="button button-primary" disabled={savingId === item.id} onClick={() => { setDraft({ ...item }); saveItem(false); }}><Save size={14} /> Save</button>
                <button className="button button-ghost" disabled={savingId === item.id} onClick={() => deleteItem(item)}><Trash2 size={14} /> Hide</button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
