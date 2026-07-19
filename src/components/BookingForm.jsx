"use client";

import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { hasSupabasePublicEnv } from "@/lib/supabase/config";

const api = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5157";

export default function BookingForm() {
  const [state, setState] = useState("idle");

  async function submit(event) {
    event.preventDefault();
    setState("sending");

    const form = event.currentTarget;
    const body = Object.fromEntries(new FormData(form).entries());
    body.preferredDate = body.preferredDate || null;
    body.serviceId = null;
    body.problemDescription = `${body.problemDescription}\n\nSelected service: ${body.serviceName}`;
    delete body.serviceName;

    try {
      const headers = { "Content-Type": "application/json" };

      if (hasSupabasePublicEnv()) {
        const supabase = createSupabaseBrowserClient();
        const { data } = await supabase.auth.getSession();
        if (data.session?.access_token) {
          headers.Authorization = `Bearer ${data.session.access_token}`;
        }
      }

      const response = await fetch(`${api}/api/service-requests`, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      });

      if (!response.ok) throw new Error();

      form.reset();
      setState("success");
    } catch {
      setState("error");
    }
  }

  return (
    <form className="booking-form" onSubmit={submit}>
      <label>
        Full Name
        <input name="fullName" required placeholder="Your name" />
      </label>
      <label>
        Phone Number
        <input name="phone" required type="tel" pattern="[0-9]{10}" placeholder="10-digit mobile number" />
      </label>
      <label>
        Email <span>(optional)</span>
        <input name="email" type="email" placeholder="you@example.com" />
      </label>
      <label>
        Full Address
        <textarea name="address" required placeholder="Where should we visit?" />
      </label>
      <label>
        City
        <input name="city" required placeholder="Sangli" />
      </label>
      <label>
        Pincode
        <input name="pincode" required inputMode="numeric" pattern="[0-9]{6}" placeholder="6-digit pincode" />
      </label>
      <label>
        Service
        <select name="serviceName" required defaultValue="">
          <option value="" disabled>Select a service</option>
          <option>General Pest Control</option>
          <option>Termite Control</option>
          <option>Residential Pest Control</option>
          <option>Commercial Pest Control</option>
        </select>
      </label>
      <label>
        Property Type
        <select name="propertyType" required defaultValue="">
          <option value="" disabled>Select property type</option>
          <option>Home</option>
          <option>Apartment</option>
          <option>Office</option>
          <option>Shop</option>
          <option>Warehouse</option>
          <option>Restaurant</option>
          <option>Other</option>
        </select>
      </label>
      <label>
        Preferred Date
        <input name="preferredDate" required type="date" />
      </label>
      <label>
        Preferred Time
        <select name="preferredTime" required defaultValue="">
          <option value="" disabled>Select preferred time</option>
          <option>Morning (8 AM - 12 PM)</option>
          <option>Afternoon (12 PM - 4 PM)</option>
          <option>Evening (4 PM - 8 PM)</option>
        </select>
      </label>
      <label>
        Problem Description
        <textarea name="problemDescription" required placeholder="Tell us what you are noticing" />
      </label>
      <button className="button button-primary" disabled={state === "sending"}>
        {state === "sending" ? "Sending..." : "Send Enquiry ->"}
      </button>
      {state === "success" && <p className="form-message success" role="status">Thank you! We received your booking request.</p>}
      {state === "error" && <p className="form-message error" role="alert">Something went wrong. Please call us directly.</p>}
    </form>
  );
}
