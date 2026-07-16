import { Bug, Building2, House, PanelsTopLeft } from "lucide-react";

export const services = [
  { slug: "general-pest-control", nameEn: "General Pest Control", nameMr: "सर्वसाधारण कीटक नियंत्रण", icon: Bug, demoPrice: 1299, summary: "Practical protection from cockroaches, ants, spiders, lizards, bed bugs, mosquitoes and other common pests." },
  { slug: "termite-control", nameEn: "Termite Control", nameMr: "वाळवी नियंत्रण", icon: PanelsTopLeft, demoPrice: 3499, summary: "Treatment and protection for wooden furniture, doors, walls and buildings affected by termites." },
  { slug: "residential-pest-control", nameEn: "Residential Pest Control", nameMr: "निवासी कीटक नियंत्रण", icon: House, demoPrice: 999, summary: "Pest control for homes, apartments, flats, bungalows and housing societies." },
  { slug: "commercial-pest-control", nameEn: "Commercial Pest Control", nameMr: "व्यावसायिक कीटक नियंत्रण", icon: Building2, demoPrice: 2499, summary: "Solutions for shops, offices, hotels, restaurants, hospitals, warehouses and institutions." },
];

export function getService(slug) { return services.find((service) => service.slug === slug); }
