"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { isAdminUser } from "@/lib/auth/roles";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { hasSupabasePublicEnv } from "@/lib/supabase/config";

export default function LoginForm() {
  const router = useRouter();
  const [state, setState] = useState({ status: "idle", message: "" });

  async function submit(event) {
    event.preventDefault();
    setState({ status: "sending", message: "" });

    if (!hasSupabasePublicEnv()) {
      setState({ status: "error", message: "Supabase keys are missing. Add them in .env.local first." });
      return;
    }

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") || "").trim();
    const password = String(formData.get("password") || "");

    const supabase = createSupabaseBrowserClient();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setState({ status: "error", message: error.message });
      return;
    }

    setState({ status: "success", message: "Signed in successfully. Redirecting..." });
    router.refresh();
    router.push(isAdminUser(data.user) ? "/admin" : "/dashboard");
  }

  return (
    <form className="booking-form narrow-form" onSubmit={submit}>
      <label>
        Email
        <input name="email" type="email" autoComplete="email" required placeholder="you@example.com" />
      </label>
      <label>
        Password
        <input name="password" type="password" autoComplete="current-password" required placeholder="Your password" />
      </label>
      <button className="button button-primary" disabled={state.status === "sending"}>
        {state.status === "sending" ? "Signing in..." : "Sign In ->"}
      </button>
      {state.message && (
        <p className={`form-message ${state.status === "error" ? "error" : "success"}`} role={state.status === "error" ? "alert" : "status"}>
          {state.message}
        </p>
      )}
      <p>
        New customer? <Link href="/register" className="text-link">Create an account</Link>
      </p>
    </form>
  );
}
