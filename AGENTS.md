<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Branches: `main` ships, `test` doesn't

There are exactly two long-lived branches. Do not create others.

- **`main` is live.** Vercel Branch Tracking points at it, so *every push to `main`
  deploys to production* (`cyprustech.careers`) within about 90 seconds. There is
  no manual promote step and no staging gate. Push to `main` only when the change
  is meant to be public right now.
- **`test` is the safe branch.** It builds to a preview URL and can never reach
  production. Break it freely.

## Which branch does my work go on?

Default to `main`. Switch to `test` when the user says "test", "staging", "try
it first", "don't put it live yet", or anything else meaning *not yet public*.

When working on `test`, **do not touch `main` at all** — no merges, no
cherry-picks, no "while I'm here" commits. `main` moves only when the user asks
to release.

## Keeping `test` current

`test` must not drift. Before starting any work on it, bring it up to date:

```bash
git checkout test && git fetch origin main && git merge origin/main
```

To release approved work, merge the other way and push:

```bash
git checkout main && git merge test && git push -u origin main
```

After a release the two branches are level again — that's the resting state.

## Caution

Preview deployments read the **same database as production** unless the Preview
environment overrides `DATABASE_URL` in Vercel. Verify before running anything
destructive on `test`; writes from a preview can hit real user data.
