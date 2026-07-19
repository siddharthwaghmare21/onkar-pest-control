import { BarChart3, CalendarClock, CreditCard, Gift, Images, Inbox, Megaphone, ShieldCheck } from "lucide-react";
import { redirect } from "next/navigation";
import FloatingActions from "@/components/FloatingActions";
import LogoutButton from "@/components/LogoutButton";
import PageHero from "@/components/PageHero";
import PanelSearch from "@/components/PanelSearch";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import { isAdminUser } from "@/lib/auth/roles";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return (
      <>
        <SiteHeader />
        <PageHero
          eyebrow="ADMIN PANEL"
          title={<>Admin setup <em>pending.</em></>}
          copy="Add Supabase environment variables first, then admin access can be checked."
        />
        <main className="container dashboard-wrap">
          <section className="dashboard-panel">
            <h2>Supabase environment needed</h2>
            <p>Admin access depends on Supabase auth. Add public Supabase keys in .env.local and restart the dev server.</p>
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

  if (!isAdminUser(user)) {
    redirect("/dashboard");
  }

  const adminName = user.user_metadata?.full_name || "Admin";

  return (
    <>
      <SiteHeader />
      <PageHero
        eyebrow="ADMIN PANEL"
        title={<>Onkar control <em>room.</em></>}
        copy={`Welcome ${adminName}. This is the secure foundation for managing bookings, offers, gallery and customers.`}
      />
      <main className="container dashboard-wrap">
        <section className="dashboard-top">
          <div>
            <p className="section-kicker">ADMIN FOUNDATION <span /></p>
            <h2>Design-ready admin panel shell.</h2>
            <p>The access control is in place. Once you share the admin design, we will replace this placeholder with the full working panel.</p>
          </div>
          <div className="panel-actions">
            <PanelSearch placeholder="Search bookings, customer, phone..." />
            <LogoutButton />
          </div>
        </section>

        <section className="dashboard-grid admin-grid">
          <article className="dashboard-card">
            <Inbox size={25} />
            <span>Requests</span>
            <h3>📋 Bookings</h3>
            <p>View, filter, assign and update customer service request status.</p>
          </article>
          <article className="dashboard-card">
            <Gift size={25} />
            <span>Offers</span>
            <h3>🎁 Create offers</h3>
            <p>Add, edit and delete festival or seasonal offers.</p>
          </article>
          <article className="dashboard-card">
            <Images size={25} />
            <span>Gallery</span>
            <h3>🖼️ Media</h3>
            <p>Manage pest control location photos and service visuals.</p>
          </article>
          <article className="dashboard-card">
            <CalendarClock size={25} />
            <span>Schedule</span>
            <h3>🗓️ Visits</h3>
            <p>Track upcoming calls, confirmed visits and completed work.</p>
          </article>
          <article className="dashboard-card">
            <BarChart3 size={25} />
            <span>Reports</span>
            <h3>📊 Overview</h3>
            <p>See lead volume, active bookings and conversion summary.</p>
          </article>
          <article className="dashboard-card">
            <Megaphone size={25} />
            <span>Lead Sources</span>
            <h3>📣 Justdial</h3>
            <p>Track Website, WhatsApp, phone, Justdial and referral enquiries separately.</p>
          </article>
          <article className="dashboard-card">
            <CreditCard size={25} />
            <span>Billing</span>
            <h3>💳 Accounts</h3>
            <p>Plan revenue, advance, balance, payment mode and invoice tracking.</p>
          </article>
          <article className="dashboard-card">
            <ShieldCheck size={25} />
            <span>Access</span>
            <h3>🔐 Roles</h3>
            <p>Keep admin controls separate from customer dashboard access.</p>
          </article>
        </section>
      </main>
      <SiteFooter />
      <FloatingActions />
    </>
  );
}
