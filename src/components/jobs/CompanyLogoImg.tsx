"use client";

import { useState } from "react";

/** Minimal client island: shows the company logo and falls back to the
 *  initial letter if the image fails. The src is resolved on the server. */
export function CompanyLogoImg({ src, name, initial }: { src: string; name: string; initial: string }) {
  const [failed, setFailed] = useState(false);
  if (failed) return <div className="job-card-logo job-card-logo-fallback">{initial}</div>;
  return (
    <div className="job-card-logo">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={name}
        width={48}
        height={48}
        className="job-card-logo-img"
        loading="lazy"
        decoding="async"
        onError={() => setFailed(true)}
      />
    </div>
  );
}
