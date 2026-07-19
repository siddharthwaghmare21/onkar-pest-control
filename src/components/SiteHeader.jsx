"use client";

import Link from "next/link";
import { Menu, Phone, ShieldCheck, X } from "lucide-react";
import { useState } from "react";
import ProfileMenu from "@/components/ProfileMenu";
import ThemeToggle from "@/components/ThemeToggle";
import { company } from "@/data/company";

const links = [
  ["Home", "/"],
  ["About", "/about"],
  ["Services", "/services"],
  ["Gallery", "/gallery"],
  ["Reviews", "/reviews"],
  ["Contact", "/contact"],
];

export default function SiteHeader() {
  const [open, setOpen] = useState(false);

  function closeMobileMenu() {
    if (window.matchMedia("(max-width: 980px)").matches) {
      setOpen(false);
    }
  }

  return (
    <header className="site-header">
      <div className="utility-bar">
        <div className="container utility-inner">
          <span>Serving Sangli and nearby regions</span>
          <span className="utility-phones">
            <a href={`tel:${company.phone}`}><Phone size={14} /> {company.phone}</a>
            <a href={`tel:${company.alternatePhone}`}><Phone size={14} /> {company.alternatePhone}</a>
          </span>
        </div>
      </div>

      <div className="container nav-wrap">
        <Link className="brand" href="/" onClick={closeMobileMenu}>
          <span className="brand-mark"><ShieldCheck size={25} /></span>
          <span>
            <strong>Onkar Pest Control</strong>
            <small>{company.tagline}</small>
          </span>
        </Link>

        <nav className={open ? "main-nav open" : "main-nav"}>
          {links.map(([label, href]) => (
            <Link key={href} href={href} onClick={closeMobileMenu}>{label}</Link>
          ))}
          <Link className="nav-cta" href="/book-service" onClick={closeMobileMenu}>Book a Service</Link>
        </nav>

        <div className="header-actions">
          <ThemeToggle />
          <ProfileMenu onNavigate={closeMobileMenu} />
          <button className="menu-button" onClick={() => setOpen(!open)} aria-expanded={open} aria-label="Toggle navigation">
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </div>
    </header>
  );
}
