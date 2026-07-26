import { prisma } from "./prisma";
import { slugify } from "./utils";

/**
 * Attach skill tags to a job, creating any that do not exist yet.
 *
 * Every write path used to do `tag.findMany({ where: { name: { in: names } } })`
 * and link only what came back, so a skill the picker offered but the `tags`
 * table had never heard of was dropped without a word — the job saved, the
 * skill vanished from the card, and /jobs?skill=<name> could never find it.
 * The picker is a closed list (no free text), so anything arriving here is a
 * name the site itself offered and is safe to create.
 */
export async function linkJobTags(jobId: string, tagNames: string[]) {
  const names = [...new Set(tagNames.map(n => n.trim()).filter(Boolean))];
  if (names.length === 0) return;

  const existing = await prisma.tag.findMany({ where: { name: { in: names } } });
  const byName   = new Map(existing.map(t => [t.name, t.id]));

  for (const name of names) {
    if (byName.has(name)) continue;
    const created = await createTag(name);
    if (created) byName.set(name, created.id);
  }

  const data = names
    .map(n => byName.get(n))
    .filter((tagId): tagId is string => Boolean(tagId))
    .map(tagId => ({ jobId, tagId }));

  if (data.length > 0) {
    await prisma.jobTag.createMany({ data, skipDuplicates: true });
  }
}

/** Parse the JSON array of tag names the job forms submit. */
export function parseTagNames(raw: unknown): string[] {
  try {
    const parsed = JSON.parse(String(raw));
    return Array.isArray(parsed) ? parsed.filter(t => typeof t === "string") : [];
  } catch {
    return [];
  }
}

async function createTag(name: string) {
  const base = slugify(name) || "tag";

  /* Slugs are unique and lossy — "C#" and "C++" both reduce to "c" — so a
     colliding slug gets a numeric suffix rather than failing the whole save.
     Taken slugs are looked up rather than discovered by a failed insert, so a
     normal collision does not log a constraint violation. */
  for (let attempt = 0; attempt < 6; attempt++) {
    const slug = attempt === 0 ? base : `${base}-${attempt + 1}`;
    if (await prisma.tag.findUnique({ where: { slug } })) continue;
    try {
      return await prisma.tag.create({ data: { name, slug } });
    } catch {
      /* Lost a race: another request took either this slug or this name in the
         moment between the check and the insert. Take theirs if it is the tag
         we wanted, otherwise fall through and try the next slug. */
      const raced = await prisma.tag.findUnique({ where: { name } });
      if (raced) return raced;
    }
  }

  console.error(`[job-tags] could not create tag "${name}"`);
  return null;
}
