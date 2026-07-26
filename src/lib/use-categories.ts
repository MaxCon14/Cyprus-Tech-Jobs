"use client";

import { useEffect, useState } from "react";
import type { NavCategory } from "./taxonomy";

/**
 * The top-level categories, for client components that cannot be handed them by
 * a server parent. Returns an empty list until the fetch lands, so callers
 * should render whatever they show for "no categories" in the meantime.
 */
export function useCategories(): NavCategory[] {
  const [categories, setCategories] = useState<NavCategory[]>([]);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/categories")
      .then(r => (r.ok ? r.json() : []))
      .then((data: NavCategory[]) => { if (!cancelled) setCategories(data); })
      .catch(() => { /* leave the list empty rather than blocking the form */ });
    return () => { cancelled = true; };
  }, []);

  return categories;
}
