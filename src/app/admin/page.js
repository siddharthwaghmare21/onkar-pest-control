import Link from "next/link";
import {
  BarChart3,
  CalendarClock,
  CheckCircle2,
  CreditCard,
  Gift,
  IndianRupee,
  Images,
  Inbox,
  LayoutDashboard,
  Megaphone,
  MessageSquareText,
  PhoneCall,
  Settings,
  ShieldCheck,
  Star,
  UsersRound,
} from "lucide-react";
import { redirect } from "next/navigation";
import AdminBookingsManager from "@/components/AdminBookingsManager";
import AdminServicesManager from "@/components/AdminServicesManager";
import LogoutButton from "@/components/LogoutButton";
import PanelSearch from "@/components/PanelSearch";
import ProfileMenu from "@/components/ProfileMenu";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import ThemeToggle from "@/components/ThemeToggle";
import { isAdminUser } from "@/lib/auth/roles";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const api = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5157";

const menuItems = [
  ["Dashboard", LayoutDashboard],
  ["Bookings", Inbox],
  ["Customers", UsersRound],
  ["Messages", MessageSquareText],
  ["Services & Rates", IndianRupee],
  ["Offers", Gift],
  ["Gallery", Images],
  ["Reports", BarChart3],
  ["Settings", Settings],
];

const sourceRows = [
  ["Website", 9, "38%"],
  ["Justdial", 7, "29%"],
  ["WhatsApp", 5, "21%"],
  ["Phone/Referral", 3, "12%"],
];

const bookingRows = [
  ["Cockroach service", "Rahul Patil", "Website", "New"],
  ["Termite inspection", "Sangli Hotel", "Justdial", "Confirmed"],
  ["Hospital pest audit", "City Care", "Phone", "Follow-up"],
  ["Residential service", "Priya Jadhav", "WhatsApp", "Completed"],
];

const offerRows = [
  ["Festival Home Care", "15% off", "Draft"],
  ["Restaurant Monthly Plan", "Package", "Active"],
  ["First Booking Visit", "No travel charge", "Active"],
];

function statusClass(status) {
  return `admin-status ${status.toLowerCase().replaceAll(" ", "-")}`;
}

async function getAdminRequests(supabase) {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;

  if (!token) return { requests: [], error: "Admin session token is not available yet." };

  try {
    const response = await fetch(`${api}/api/service-requests/admin`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });

    if (!response.ok) return { requests: [], error: "Could not load admin bookings from API." };
    return { requests: await response.json(), error: "" };
  } catch {
    return { requests: [], error: "Backend API is not running or is not reachable." };
  }
}

async function getAdminServices(supabase) {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;

  if (!token) return { services: [], error: "Admin session token is not available yet." };

  try {
    const response = await fetch(`${api}/api/services/admin`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });

    if (!response.ok) return { services: [], error: "Could not load service rates from API." };
    return { services: await response.json(), error: "" };
  } catch {
    return { services: [], error: "Backend API is not running or is not reachable." };
  }
}

function getAdminStats(requests) {
  const pendingPayments = requests.filter((request) => request.paymentStatus !== "Paid").length;

  return [
    { label: "Total Bookings", value: String(requests.length || 24), note: requests.length ? "Live booking records" : "+5 demo records", icon: Inbox, featured: true, emoji: "📋" },
    { label: "New Enquiries", value: String(requests.filter((request) => request.status === "New").length || 10), note: "Website + calls", icon: MessageSquareText, emoji: "💬" },
    { label: "Confirmed Visits", value: String(requests.filter((request) => request.status === "Confirmed").length || 12), note: "This week", icon: CalendarClock, emoji: "🗓️" },
    { label: "Pending Payments", value: String(requests.length ? pendingPayments : 2), note: "Follow-up needed", icon: CreditCard, emoji: "💳" },
  ];
}

function getSourceRows(requests) {
  if (!requests.length) return sourceRows;

  const counts = requests.reduce((result, request) => {
    const source = request.leadSource || "Other";
    result[source] = (result[source] || 0) + 1;
    return result;
  }, {});

  return Object.entries(counts).map(([source, count]) => [
    source,
    count,
    `${Math.max(8, Math.round((count / requests.length) * 100))}%`,
  ]);
}

function getBookingRows(requests) {
  if (!requests.length) return bookingRows;

  return requests.slice(0, 6).map((request) => [
    request.serviceName || "Service request",
    request.fullName,
    request.leadSource,
    request.status,
  ]);
}

export default async function AdminPage() {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return (
      <>
        <SiteHeader />
        <main className="container dashboard-wrap">
          <section className="dashboard-panel">
            <h2>Admin setup pending</h2>
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

  if (!isAdminUser(user, { allowDevelopmentFallback: true })) {
    redirect("/dashboard");
  }

  const adminName = user.user_metadata?.full_name || "Admin";
  const initials = adminName.slice(0, 1).toUpperCase();
  const { requests, error: adminDataError } = await getAdminRequests(supabase);
  const { services, error: servicesError } = await getAdminServices(supabase);
  const stats = getAdminStats(requests);
  const visibleSourceRows = getSourceRows(requests);
  const visibleBookingRows = getBookingRows(requests);
  const collectedAmount = requests.reduce((total, request) => total + (request.advancePaid || 0), 0);

  return (
    <main className="admin-workspace">
      <aside className="admin-sidebar">
        <Link className="admin-brand" href="/">
          <span><ShieldCheck size={24} /></span>
          <strong>Onkar</strong>
        </Link>

        <nav className="admin-menu" aria-label="Admin menu">
          <small>MENU</small>
          {menuItems.map(([label, Icon], index) => (
            <a className={index === 0 ? "active" : ""} href={`#${label.toLowerCase().replaceAll(" & ", "-").replaceAll(" ", "-")}`} key={label}>
              <Icon size={18} /> {label}
            </a>
          ))}
        </nav>

        <div className="admin-shortcuts">
          <strong>Shortcuts ⚡</strong>
          <span>Alt + Shift + A: Admin</span>
          <span>Alt + Shift + U: User</span>
        </div>
      </aside>

      <section className="admin-main">
        <header className="admin-topbar">
          <PanelSearch placeholder="Search booking, customer, phone..." />
          <div className="admin-top-actions">
            <ThemeToggle />
            <ProfileMenu />
            <LogoutButton />
          </div>
        </header>

        <section className="admin-hero-row">
          <div>
            <p className="section-kicker">ADMIN DASHBOARD <span /></p>
            <h1>Dashboard</h1>
            <p>Track enquiries, service visits, Justdial leads, offers and revenue from one clean control room.</p>
          </div>
          <div className="admin-user-chip">
            <span>{initials}</span>
            <div>
              <strong>{adminName}</strong>
              <small>{user.email}</small>
            </div>
          </div>
        </section>

        <section className="admin-stat-grid">
          {stats.map(({ label, value, note, icon: Icon, featured, emoji }) => (
            <article className={featured ? "admin-stat-card featured" : "admin-stat-card"} key={label}>
              <div>
                <span>{emoji} {label}</span>
                <Icon size={18} />
              </div>
              <strong>{value}</strong>
              <small>{note}</small>
            </article>
          ))}
        </section>

        <section className="admin-content-grid">
          {adminDataError && (
            <article className="admin-panel wide">
              <div className="form-message error" role="alert">{adminDataError}</div>
            </article>
          )}

          <article className="admin-panel wide" id="reports">
            <div className="admin-panel-head">
              <h2>Lead Analytics 📊</h2>
              <span>This month</span>
            </div>
            <div className="lead-chart" aria-label="Lead source chart">
              {visibleSourceRows.map(([label, count, percent]) => (
                <div className="lead-chart-row" key={label}>
                  <span>{label}</span>
                  <div><i style={{ width: percent }} /></div>
                  <strong>{count}</strong>
                </div>
              ))}
            </div>
          </article>

          <article className="admin-panel">
            <div className="admin-panel-head">
              <h2>Revenue Snapshot 💰</h2>
              <CreditCard size={20} />
            </div>
            <div className="revenue-meter">
              <strong>₹{collectedAmount ? collectedAmount.toLocaleString("en-IN") : "42,500"}</strong>
              <span>Collected</span>
            </div>
            <p className="admin-muted">Demo numbers for now. Actual billing will connect after accounting fields are added.</p>
          </article>

          <article className="admin-panel">
            <div className="admin-panel-head">
              <h2>Today&apos;s Focus 🧭</h2>
              <PhoneCall size={20} />
            </div>
            <h3>Call Justdial enquiries</h3>
            <p className="admin-muted">3 leads need confirmation before 7 PM.</p>
            <button className="button button-primary" type="button">Review Leads</button>
          </article>

          <article className="admin-panel wide" id="bookings">
            <div className="admin-panel-head">
              <h2>Recent Bookings 📋</h2>
              <a href="#bookings">View all</a>
            </div>
            <div className="admin-table">
              {visibleBookingRows.map(([service, customer, source, status]) => (
                <div className="admin-table-row" key={`${service}-${customer}`}>
                  <span>{service}</span>
                  <span>{customer}</span>
                  <span>{source}</span>
                  <strong className={statusClass(status)}>{status}</strong>
                </div>
              ))}
            </div>
          </article>

          <article className="admin-panel wide admin-manager-panel" id="booking-management">
            <div className="admin-panel-head">
              <h2>Booking Management</h2>
              <span>Status, source and billing</span>
            </div>
            <AdminBookingsManager initialRequests={requests} />
          </article>

          <article className="admin-panel wide admin-manager-panel" id="services-rates">
            <div className="admin-panel-head">
              <h2>Services & Rates</h2>
              <IndianRupee size={20} />
            </div>
            {servicesError && <div className="form-message error" role="alert">{servicesError}</div>}
            <p className="admin-muted">Rates should live here, separate from Accounts. Accounts can stay for profile/login settings later.</p>
            <AdminServicesManager initialServices={services} />
          </article>

          <article className="admin-panel" id="offers">
            <div className="admin-panel-head">
              <h2>Offers 🎁</h2>
              <Gift size={20} />
            </div>
            <div className="offer-list">
              {offerRows.map(([name, type, status]) => (
                <div key={name}>
                  <span><Star size={15} /> {name}</span>
                  <small>{type} - {status}</small>
                </div>
              ))}
            </div>
          </article>

          <article className="admin-panel" id="gallery">
            <div className="admin-panel-head">
              <h2>Service Proof 🖼️</h2>
              <Images size={20} />
            </div>
            <div className="proof-grid">
              <span>Hotel</span>
              <span>Kitchen</span>
              <span>Hospital</span>
              <span>Home</span>
            </div>
          </article>

          <article className="admin-panel wide" id="billing">
            <div className="admin-panel-head">
              <h2>Accounting Plan 💳</h2>
              <CheckCircle2 size={20} />
            </div>
            <div className="accounting-strip">
              <span>Lead Source</span>
              <span>Service Amount</span>
              <span>Advance</span>
              <span>Balance</span>
              <span>Invoice</span>
            </div>
          </article>

          <article className="admin-panel" id="lead-sources">
            <div className="admin-panel-head">
              <h2>Justdial 📣</h2>
              <Megaphone size={20} />
            </div>
            <strong className="big-number">7</strong>
            <p className="admin-muted">Manual Justdial entry module will come with bookings management.</p>
          </article>
        </section>
      </section>
    </main>
  );
}
