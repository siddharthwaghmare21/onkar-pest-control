import { redirect } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import AdminGalleryManager from "@/components/AdminGalleryManager";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isAdminUser } from "@/lib/auth/roles";

export const dynamic = "force-dynamic";

export default async function AdminGalleryPage() {
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
  if (!user) redirect("/admin/login");
  if (!isAdminUser(user, { allowDevelopmentFallback: true })) redirect("/dashboard");

  // fetch initial items using admin API token
  const token = (await supabase.auth.getSession()).data.session?.access_token;
  let initialItems = [];
  if (token) {
    try {
      const api = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5157";
      const res = await fetch(`${api}/api/gallery/admin`, { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });
      if (res.ok) initialItems = await res.json();
    } catch {
      initialItems = [];
    }
  }

  return (
    <>
      <SiteHeader />
      <main className="container section-pad">
        <AdminGalleryManager initialItems={initialItems} />
      </main>
      <SiteFooter />
    </>
  );
}
