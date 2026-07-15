import { MessageCircle, Phone } from "lucide-react";
import { company, whatsappUrl } from "@/data/company";
export default function FloatingActions(){return <div className="floating-actions"><a className="float-call" href={`tel:${company.phone}`} aria-label="Call Onkar Pest Control"><Phone/></a><a className="float-whatsapp" href={whatsappUrl} target="_blank" rel="noreferrer" aria-label="Message Onkar Pest Control on WhatsApp"><MessageCircle/></a></div>}
