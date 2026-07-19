import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import PageHero from "@/components/PageHero";
import RegisterForm from "@/components/RegisterForm";

export default function Register() {
  return (
    <>
      <SiteHeader />
      <PageHero
        eyebrow="CREATE ACCOUNT"
        title={<>Stay in the <em>loop.</em></>}
        copy="Create your customer account for future discounts, offers and service tracking."
      />
      <main className="container form-wrap">
        <RegisterForm />
      </main>
      <SiteFooter />
    </>
  );
}
