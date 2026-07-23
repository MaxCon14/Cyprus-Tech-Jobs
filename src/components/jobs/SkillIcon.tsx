"use client";

import { useState } from "react";

/** Minimal client island: renders a skill icon and hides it if it fails to load.
 *  The skill→URL resolution happens on the server so the icon map never ships. */
export function SkillIcon({ src }: { src: string }) {
  const [failed, setFailed] = useState(false);
  if (failed) return null;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      width={13}
      height={13}
      className="skill-tag-icon"
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
    />
  );
}
