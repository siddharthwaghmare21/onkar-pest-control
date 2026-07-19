import { redirect } from "next/navigation";
import FloatingActions from "@/components/FloatingActions";
import PageHero from "@/components/PageHero";
import ProfileForm from "@/components/ProfileForm";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return (
      <>
        <SiteHeader />
        <PageHero eyebrow="PROFILE" title={<>Profile setup <em>pending.</em></>} copy="Add Supabase keys first, then profile management will work." />
        <main className="container form-wrap">
          <p className="form-message error">Supabase environment variables are missing.</p>
        </main>
        <SiteFooter />
      </>
    );
  }

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <>
      <SiteHeader />
      <PageHero eyebrow="PROFILE" title={<>Manage your <em>account.</em></>} copy="Update your profile details or manage account access." />
      <main className="container form-wrap">
        <ProfileForm user={user} />
      </main>
      <SiteFooter />
      <FloatingActions />
    </>
  );
}
