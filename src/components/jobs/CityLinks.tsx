import Link from "next/link";
import { CORE_CITIES } from "@/lib/city-guides";

export function CityLinks() {
  return <nav aria-label="Tech jobs by city" style={{ marginBlock: 32 }}>
    <h2 className="h3" style={{ marginBottom: 14 }}>Explore tech jobs by city</h2>
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
      {CORE_CITIES.map(city => <Link className="chip" key={city.slug} href={`/jobs/${city.slug}`}>Tech jobs in {city.displayName}</Link>)}
      <Link className="chip" href="/jobs/remote">Remote jobs in Cyprus</Link>
    </div>
  </nav>;
}
