"use client";

import { useState } from "react";
import { X } from "lucide-react";

export default function GalleryGrid({ items = [] }) {
  const [openIndex, setOpenIndex] = useState(-1);

  function open(i) {
    setOpenIndex(i);
  }
  function close() {
    setOpenIndex(-1);
  }

  return (
    <>
      <div className="gallery-grid">
        {items.map((item, index) => (
          <figure className={`gallery-item gallery-item-${(index % 4) + 1}`} key={item.id || index} onClick={() => open(index)} style={{ cursor: "pointer" }}>
            <div className="gallery-image" style={{ backgroundImage: `url(${item.imageUrl})` }} />
            <figcaption>{item.captionEnglish || item.captionMarathi}</figcaption>
          </figure>
        ))}
      </div>

      {openIndex >= 0 && (
        <div className="lightbox" role="dialog" aria-modal="true">
          <button className="lightbox-close" onClick={close} aria-label="Close"><X /></button>
          <div className="lightbox-content">
            <img src={items[openIndex].imageUrl} alt={items[openIndex].captionEnglish || "Gallery image"} />
            <figcaption>{items[openIndex].captionEnglish || items[openIndex].captionMarathi}</figcaption>
          </div>
        </div>
      )}
    </>
  );
}
