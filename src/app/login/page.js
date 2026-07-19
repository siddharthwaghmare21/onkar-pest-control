import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import PageHero from "@/components/PageHero";
import LoginForm from "@/components/LoginForm";

export default function Login() {
  return (
    <>
      <SiteHeader />
      <PageHero
        eyebrow="CUSTOMER LOGIN"
        title={<>Welcome <em>back.</em></>}
        copy="Sign in to manage your Onkar Pest Control account."
      />
      <main className="container form-wrap">
        <LoginForm />
      </main>
      <SiteFooter />
    </>
  );
}
