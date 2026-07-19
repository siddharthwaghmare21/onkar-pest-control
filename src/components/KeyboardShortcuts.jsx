"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function KeyboardShortcuts() {
  const router = useRouter();

  useEffect(() => {
    function handleShortcut(event) {
      if (!event.altKey || !event.shiftKey) return;

      const key = event.key.toLowerCase();
      if (key === "a") {
        event.preventDefault();
        router.push("/admin");
      }

      if (key === "u") {
        event.preventDefault();
        router.push("/dashboard");
      }
    }

    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, [router]);

  return null;
}
