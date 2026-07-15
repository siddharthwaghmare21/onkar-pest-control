import Link from "next/link";
import { ArrowRight, Check, ChevronRight, Clock3, MapPin, Phone, ShieldCheck } from "lucide-react";
import { company } from "@/data/company";
import { services } from "@/data/services";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import FloatingActions from "@/components/FloatingActions";

export default function Home() {
  return <>
    <SiteHeader />
    <main>
      <section className="hero-section"><div className="hero-image" aria-hidden="true" /><div className="hero-overlay" /><div className="container hero-content">
        <p className="eyebrow"><span /> Smart Protection. Safer Spaces.</p><h1>घर आणि व्यवसायासाठी<br /><em>सुरक्षित</em> व प्रभावी<br />pest control.</h1><p className="hero-copy">विश्वासार्ह pest control सेवा, तुमच्या जागेची समस्या समजून घेऊन योग्य पद्धतीने.</p><div className="hero-actions"><Link className="button button-primary" href="/book-service">Book a Service <ArrowRight size={17} /></Link><a className="button button-ghost" href={`tel:${company.phone}`}><Phone size={17} /> Call Now</a></div><div className="hero-note"><ShieldCheck size={18} /><span>Homes & businesses across Sangli<br /><small>Clear communication at every step</small></span></div>
      </div></section>
      <section className="intro-section container section-pad"><div className="section-kicker">OUR SERVICES <span /></div><div className="intro-heading"><h2>Right care for<br /><em>every space.</em></h2><p>घर, office किंवा commercial जागा—तुमच्या गरजेनुसार thoughtful आणि व्यवस्थित pest control service.</p></div><div className="services-grid">{services.map((service, index) => { const Icon = service.icon; return <Link className="service-card" href={`/services/${service.slug}`} key={service.slug}><div className="service-number">0{index + 1}</div><div className="service-icon"><Icon size={23} strokeWidth={1.7} /></div><h3>{service.nameEn}</h3><p className="marathi-name">{service.nameMr}</p><p>{service.summary}</p><span className="card-link">Explore service <ChevronRight size={15} /></span></Link> })}</div></section>
      <section className="about-band"><div className="container about-grid"><div><div className="section-kicker light">ABOUT ONKAR <span /></div><h2>Safe spaces begin<br />with <em>thoughtful care.</em></h2></div><div><p className="about-lead">Onkar Pest Control ही निवासी आणि व्यावसायिक ठिकाणांसाठी विश्वासार्ह pest control सेवा देणारी कंपनी आहे.</p><p>झुरळे, वाळवी, ढेकूण, डास, उंदीर आणि इतर सामान्य कीटकांच्या नियंत्रणासाठी आम्ही सुरक्षित, प्रभावी आणि गरजेनुसार उपाय प्रदान करतो.</p><Link className="text-link light-link" href="/about">More about us <ArrowRight size={16} /></Link></div></div></section>
      <section className="why-section container section-pad"><div className="section-kicker">WHY ONKAR <span /></div><div className="why-grid"><div><h2>Professional in approach.<br /><em>Personal in care.</em></h2></div><div className="why-list"><div><span><Check size={17} /></span><p><strong>Problem-first assessment</strong><br />We understand the space before suggesting the service.</p></div><div><span><Check size={17} /></span><p><strong>Clear, honest communication</strong><br />Simple guidance before, during and after your service.</p></div><div><span><Check size={17} /></span><p><strong>Built around your routine</strong><br />Service coordination that respects your home or business.</p></div></div></div></section>
      <section className="areas-section"><div className="container areas-grid"><div><div className="section-kicker">WHERE WE SERVE <span /></div><h2>Care that travels<br /><em>with you.</em></h2><p>सांगलीपासून आसपासच्या शहरांपर्यंत residential आणि commercial pest control services.</p></div><div className="area-content"><div className="area-tags">{company.serviceAreas.map((area) => <span key={area}><MapPin size={14} />{area}</span>)}</div><p className="area-note"><Clock3 size={16} /><span>{company.workingHours}<br /><strong>First booking वर travelling charges नाहीत.</strong><br />Subsequent bookings outside Sangli may attract travelling charges.</span></p></div></div></section>
      <section className="cta-section container"><div className="cta-card"><div><p className="eyebrow"><span /> START WITH A CONVERSATION</p><h2>Ready for a cleaner,<br /><em>safer space?</em></h2></div><Link className="button button-amber" href="/book-service">Book a Service <ArrowRight size={17} /></Link></div></section>
    </main><SiteFooter /><FloatingActions />
  </>;
}
