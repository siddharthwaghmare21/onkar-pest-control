import { CalendarCheck, Gift, ShieldCheck, Sparkles } from "lucide-react";
import { redirect } from "next/navigation";
import FloatingActions from "@/components/FloatingActions";
import LogoutButton from "@/components/LogoutButton";
import PageHero from "@/components/PageHero";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const api = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5157";

async function getCustomerBookings(supabase) {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;

  if (!token) {
    return { bookings: [], error: "Session token is not available yet." };
  }

  try {
    const response = await fetch(`${api}/api/service-requests/my`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });

    if (!response.ok) {
      return { bookings: [], error: "Could not load your booking history right now." };
    }

    return { bookings: await response.json(), error: "" };
  } catch {
    return { bookings: [], error: "Backend API is not running or is not reachable." };
  }
}

function getServiceLabel(problemDescription) {
  const marker = "Selected service:";
  if (!problemDescription?.includes(marker)) return "Service request";
  return problemDescription.split(marker).at(-1).trim();
}

export default async function Dashboard() {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return (
      <>
        <SiteHeader />
        <PageHero
          eyebrow="CUSTOMER DASHBOARD"
          title={<>Account setup <em>pending.</em></>}
          copy="Add Supabase URL and anon key in .env.local, then restart the Next.js dev server."
        />
        <main className="container dashboard-wrap">
          <section className="dashboard-panel">
            <h2>Supabase environment needed</h2>
            <p>Your dashboard is ready, but it needs `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` to read the login session.</p>
          </section>
        </main>
        <SiteFooter />
      </>
    );
  }

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const fullName = user.user_metadata?.full_name || "Customer";
  const phone = user.user_metadata?.phone || "Not added";
  const { bookings, error: bookingsError } = await getCustomerBookings(supabase);
  const activeBookings = bookings.filter((booking) => !["Completed", "Cancelled"].includes(booking.status)).length;

  return (
    <>
      <SiteHeader />
      <PageHero
        eyebrow="CUSTOMER DASHBOARD"
        title={<>Namaste, <em>{fullName}</em></>}
        copy="Your personal Onkar Pest Control account space is now started."
      />
      <main className="container dashboard-wrap">
        <section className="dashboard-top">
          <div>
            <p className="section-kicker">ACCOUNT <span /></p>
            <h2>Your service tracking is live.</h2>
            <p>Bookings made while signed in will appear here with status, preferred visit time and request details.</p>
          </div>
          <LogoutButton />
        </section>

        <section className="dashboard-grid">
          <article className="dashboard-card">
            <ShieldCheck size={25} />
            <span>Customer</span>
            <h3>{fullName}</h3>
            <p>{user.email}</p>
            <p>Phone: {phone}</p>
          </article>
          <article className="dashboard-card">
            <CalendarCheck size={25} />
            <span>Bookings</span>
            <h3>{bookings.length}</h3>
            <p>{activeBookings} active request{activeBookings === 1 ? "" : "s"} linked to this account.</p>
          </article>
          <article className="dashboard-card">
            <Gift size={25} />
            <span>Discounts</span>
            <h3>Member benefits</h3>
            <p>Registered customer discounts and package offers are planned for the pricing phase.</p>
          </article>
          <article className="dashboard-card">
            <Sparkles size={25} />
            <span>Offers</span>
            <h3>Festival offers</h3>
            <p>Admin-created offers will appear here once the admin panel phase starts.</p>
          </article>
        </section>

        <section className="dashboard-history">
          <div className="dashboard-section-head">
            <p className="section-kicker">SERVICE REQUESTS <span /></p>
            <h2>Booking History</h2>
          </div>

          {bookingsError && <p className="form-message error" role="alert">{bookingsError}</p>}

          {!bookingsError && bookings.length === 0 && (
            <div className="dashboard-empty">
              <h3>No bookings yet</h3>
              <p>Book a service while signed in, and your request will show here automatically.</p>
            </div>
          )}

          <div className="booking-history-list">
            {bookings.map((booking) => (
              <article className="booking-history-item" key={booking.id}>
                <div>
                  <span>{booking.status}</span>
                  <h3>{getServiceLabel(booking.problemDescription)}</h3>
                  <p>{booking.propertyType} • {booking.preferredDate || "Date pending"} • {booking.preferredTime || "Time pending"}</p>
                </div>
                <small>{new Date(booking.createdAtUtc).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</small>
              </article>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
      <FloatingActions />
    </>
  );
}
