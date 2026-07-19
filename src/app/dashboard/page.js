import { CalendarCheck, Gift, ShieldCheck, Sparkles } from "lucide-react";
import { redirect } from "next/navigation";
import FloatingActions from "@/components/FloatingActions";
import LogoutButton from "@/components/LogoutButton";
import PageHero from "@/components/PageHero";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

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
            <h2>Service tracking will live here.</h2>
            <p>For now, your login session is connected. Next we will link bookings to registered customers and show request history here.</p>
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
            <h3>Coming next</h3>
            <p>Registered user bookings will be attached to this account in the next backend step.</p>
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
      </main>
      <SiteFooter />
      <FloatingActions />
    </>
  );
}
