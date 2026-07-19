"use client";

import { Trash2, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { hasSupabasePublicEnv } from "@/lib/supabase/config";

export default function ProfileForm({ user }) {
  const router = useRouter();
  const [state, setState] = useState({ status: "idle", message: "" });
  const [deleteText, setDeleteText] = useState("");

  async function updateProfile(event) {
    event.preventDefault();
    setState({ status: "sending", message: "" });

    if (!hasSupabasePublicEnv()) {
      setState({ status: "error", message: "Supabase keys are missing." });
      return;
    }

    const formData = new FormData(event.currentTarget);
    const fullName = String(formData.get("fullName") || "").trim();
    const phone = String(formData.get("phone") || "").trim();

    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.updateUser({
      data: {
        ...user.user_metadata,
        full_name: fullName,
        phone,
      },
    });

    if (error) {
      setState({ status: "error", message: error.message });
      return;
    }

    setState({ status: "success", message: "Profile updated successfully." });
    router.refresh();
  }

  async function deleteAccount() {
    if (deleteText !== "DELETE") {
      setState({ status: "error", message: "Type DELETE to confirm account deletion." });
      return;
    }

    setState({ status: "sending", message: "" });

    const response = await fetch("/api/account", { method: "DELETE" });
    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      setState({ status: "error", message: result.message || "Could not delete account." });
      return;
    }

    if (hasSupabasePublicEnv()) {
      const supabase = createSupabaseBrowserClient();
      await supabase.auth.signOut();
    }

    router.refresh();
    router.push("/register");
  }

  return (
    <section className="profile-layout">
      <form className="booking-form narrow-form profile-card" onSubmit={updateProfile}>
        <div className="profile-card-head">
          <UserRound size={22} />
          <div>
            <h2>Update Profile</h2>
            <p>Keep your contact details ready for bookings and service updates.</p>
          </div>
        </div>
        <label>
          Full Name
          <input name="fullName" defaultValue={user.user_metadata?.full_name || ""} required placeholder="Your name" />
        </label>
        <label>
          Phone Number
          <input name="phone" defaultValue={user.user_metadata?.phone || ""} type="tel" inputMode="numeric" pattern="[0-9]{10}" placeholder="10-digit mobile number" />
        </label>
        <label>
          Email
          <input value={user.email || ""} disabled />
        </label>
        <button className="button button-primary" disabled={state.status === "sending"}>{state.status === "sending" ? "Saving..." : "Save Profile ->"}</button>
        {state.message && (
          <p className={`form-message ${state.status === "error" ? "error" : "success"}`} role={state.status === "error" ? "alert" : "status"}>
            {state.message}
          </p>
        )}
      </form>

      <section className="profile-card danger-card">
        <div className="profile-card-head">
          <Trash2 size={22} />
          <div>
            <h2>Delete Account</h2>
            <p>This removes your Supabase login account. Existing completed service records may remain for accounting/legal history.</p>
          </div>
        </div>
        <label>
          Type DELETE to confirm
          <input value={deleteText} onChange={(event) => setDeleteText(event.target.value)} placeholder="DELETE" />
        </label>
        <button className="button danger-button" onClick={deleteAccount} disabled={state.status === "sending"} type="button">
          Delete My Account
        </button>
      </section>
    </section>
  );
}
