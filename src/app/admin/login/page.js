import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import PageHero from "@/components/PageHero";
import LoginForm from "@/components/LoginForm";

export default function AdminLogin() {
  return (
    <>
      <SiteHeader />
      <PageHero
        eyebrow="ADMIN LOGIN"
        title={<>Admin <em>access.</em></>}
        copy="Sign in to manage bookings, service rates, offers and Onkar Pest Control operations."
      />
      <main className="container form-wrap">
        <LoginForm mode="admin" />
      </main>
      <SiteFooter />
    </>
  );
}
