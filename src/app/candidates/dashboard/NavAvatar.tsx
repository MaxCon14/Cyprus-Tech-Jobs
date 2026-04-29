"use client";

import { useState } from "react";

interface NavAvatarProps {
  avatarUrl: string | null;
  displayName: string;
  initials: string;
}

export function NavAvatar({ avatarUrl, displayName, initials }: NavAvatarProps) {
  const [imgError, setImgError] = useState(false);

  return (
    <div style={{ width: 28, height: 28, borderRadius: "50%", overflow: "hidden", background: "var(--accent-soft)", border: "1.5px solid var(--accent)", display: "grid", placeItems: "center", flexShrink: 0 }}>
      {avatarUrl && !imgError
        ? <img src={avatarUrl} alt={displayName} onError={() => setImgError(true)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        : <span style={{ fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: 11, color: "var(--accent)" }}>{initials}</span>
      }
    </div>
  );
}
