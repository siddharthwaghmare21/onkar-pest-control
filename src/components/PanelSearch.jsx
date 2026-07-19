"use client";

import { Search } from "lucide-react";
import { useState } from "react";

export default function PanelSearch({ placeholder = "Search..." }) {
  const [query, setQuery] = useState("");

  return (
    <label className="panel-search">
      <Search size={18} />
      <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={placeholder} />
    </label>
  );
}
