<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Branches: `main` ships, `test` doesn't

There are exactly two branches, `main` and `test`. Do not create others — no
`claude/*` working branches, no feature branches. A stale branch that looks
current is what caused the production rollback described in `context.md`.

- **`main` is live.** Vercel Branch Tracking points at it, so *every push to `main`
  deploys to production* (`cyprustech.careers`) within about 90 seconds. There is
  no manual promote step and no staging gate. Push to `main` only when the change
  is meant to be public right now.
- **`test` is the safe branch.** It builds to a preview URL and can never reach
  production. Break it freely.

## Which branch does my work go on?

**`test`. Always `test`.** Every change lands there first so it can be checked
on the preview URL before anyone outside sees it.

```bash
git checkout test && git fetch origin test && git merge origin/test
# …work, commit…
git push -u origin test
```

**`main` moves only when the user explicitly asks to release it** — "push it to
main", "ship it", "put it live". Nothing else counts: not an approving comment
about the work, not "looks good", not finishing the task you were given. When
the ask does come, fast-forward and push:

```bash
git checkout main && git merge --ff-only test && git push -u origin main
```

`--ff-only` is deliberate. Because all work goes to `test` first, `main` should
always be an ancestor of `test`; if the fast-forward is refused, something has
been committed straight to `main` and you should stop and say so rather than
forcing a merge.

Between releases `test` is ahead of `main` and that is the normal resting
state. Never push to `main` to "keep it in sync".

## Caution

Preview deployments read the **same database as production** unless the Preview
environment overrides `DATABASE_URL` in Vercel. Verify before running anything
destructive on `test`; writes from a preview can hit real user data.
