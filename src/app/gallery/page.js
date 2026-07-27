import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import PageHero from "@/components/PageHero";
import FloatingActions from "@/components/FloatingActions";

export const dynamic = "force-dynamic";

async function fetchGallery() {
  try {
    const api = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5157";
    const res = await fetch(`${api}/api/gallery`, { cache: "no-store" });
    if (!res.ok) return [];
    return await res.json();
  } catch (e) {
    return [];
  }
}

export default async function Gallery() {
  const items = await fetchGallery();

  const fallback = [
    ["/images/hotel-service.png", "Hotel pest control"],
    ["/images/kitchen-service.png", "Commercial kitchen service"],
    ["/images/home-service.png", "Home pest control"],
    ["/images/hospital-service.png", "Hospital pest control"],
  ];

  const visible = items && items.length ? items : fallback.map(([src, caption]) => ({ id: src, imageUrl: src, captionEnglish: caption }));

  return (
    <>
      <SiteHeader />
      <PageHero eyebrow="GALLERY" title={<>Real service. <em>Real care.</em></>} copy="Professional pest-control work across homes, hotels, kitchens and healthcare spaces." />

      <main className="container gallery-grid section-pad">
        {visible.length === 0 && <p className="empty-state">No gallery items yet.</p>}

        {visible.map((item, index) => (
          <figure className={`gallery-item gallery-item-${(index % 4) + 1}`} key={item.id}>
            <div className="gallery-image" style={{ backgroundImage: `url(${item.imageUrl})` }} />
            <figcaption>{item.captionEnglish || item.captionMarathi}</figcaption>
          </figure>
        ))}
      </main>

      <SiteFooter />
      <FloatingActions />
    </>
  );
}

