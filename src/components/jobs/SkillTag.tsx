// Server component: resolves the icon URL on the server (no client icon map)
// and delegates only the failable <img> to the SkillIcon client island.

import { getIconSrc } from "@/lib/skill-icons";
import { SkillIcon } from "./SkillIcon";

export function SkillTag({ name, size = "sm" }: { name: string; size?: "sm" | "md" }) {
  const src = getIconSrc(name);

  const padding  = size === "md" ? "7px 12px" : undefined;
  const fontSize = size === "md" ? 13 : undefined;

  return (
    <span className="tag tag-skill" style={size === "md" ? { padding, fontSize, gap: 7 } : undefined}>
      {src && <SkillIcon src={src} />}
      {name}
    </span>
  );
}
