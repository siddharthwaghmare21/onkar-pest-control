"use client";

import Link from "next/link";
import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { hasSupabasePublicEnv } from "@/lib/supabase/config";

export default function RegisterForm() {
  const [state, setState] = useState({ status: "idle", message: "" });

  async function submit(event) {
    event.preventDefault();
    setState({ status: "sending", message: "" });

    if (!hasSupabasePublicEnv()) {
      setState({ status: "error", message: "Supabase keys are missing. Add them in .env.local first." });
      return;
    }

    const form = event.currentTarget;
    const formData = new FormData(form);
    const fullName = String(formData.get("fullName") || "").trim();
    const phone = String(formData.get("phone") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const password = String(formData.get("password") || "");

    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          phone,
          role: "customer",
        },
      },
    });

    if (error) {
      setState({ status: "error", message: error.message });
      return;
    }

    form.reset();
    setState({
      status: "success",
      message: "Account created. Please check your email if Supabase asks for confirmation.",
    });
  }

  return (
    <form className="booking-form narrow-form" onSubmit={submit}>
      <label>
        Full Name
        <input name="fullName" autoComplete="name" required placeholder="Your name" />
      </label>
      <label>
        Phone Number
        <input name="phone" required type="tel" inputMode="numeric" pattern="[0-9]{10}" autoComplete="tel" placeholder="10-digit mobile number" />
      </label>
      <label>
        Email
        <input name="email" type="email" autoComplete="email" required placeholder="you@example.com" />
      </label>
      <label>
        Password
        <input name="password" type="password" autoComplete="new-password" minLength={6} required placeholder="Create a password" />
      </label>
      <button className="button button-primary" disabled={state.status === "sending"}>
        {state.status === "sending" ? "Creating..." : "Create Account ->"}
      </button>
      {state.message && (
        <p className={`form-message ${state.status === "error" ? "error" : "success"}`} role={state.status === "error" ? "alert" : "status"}>
          {state.message}
        </p>
      )}
      <p>
        Already registered? <Link href="/login" className="text-link">Sign in</Link>
      </p>
    </form>
  );
}
