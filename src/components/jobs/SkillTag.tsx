// Server component: resolves the icon URL on the server (no client icon map)
// and delegates only the failable <img> to the SkillIcon client island.

import Link from "next/link";
import { getIconSrc } from "@/lib/skill-icons";
import { SkillIcon } from "./SkillIcon";

/**
 * @param href  Render as a link to the filtered listing. Off by default because
 *   JobCard already wraps its whole body in a Link, and an anchor inside an
 *   anchor is invalid. The job detail page shows these standalone, so there it
 *   is safe — and a skill you can click is the shortest route from one job to
 *   others like it.
 */
export function SkillTag({ name, size = "sm", href }: { name: string; size?: "sm" | "md"; href?: string }) {
  const src = getIconSrc(name);

  const padding  = size === "md" ? "7px 12px" : undefined;
  const fontSize = size === "md" ? 13 : undefined;
  const style    = size === "md" ? { padding, fontSize, gap: 7 } : undefined;

  const body = (
    <>
      {src && <SkillIcon src={src} />}
      {name}
    </>
  );

  if (href) {
    return (
      <Link href={href} className="tag tag-skill tag-skill-link" style={style} title={`See ${name} jobs`}>
        {body}
      </Link>
    );
  }

  return <span className="tag tag-skill" style={style}>{body}</span>;
}
