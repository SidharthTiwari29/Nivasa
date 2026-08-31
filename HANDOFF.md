# HANDOFF — Read this first in any new session

**Repo**: https://github.com/SidharthTiwari29/Nivasa
**Branch**: `codex/phase-2-completion`
**PR**: #55 (open, not yet merged as of this document)
**Last commit as of writing**: `612176f`

> This document is a snapshot, not a substitute for reality. Before acting on anything below, run `git log --oneline -30` and `git status` to confirm current state — this file can go stale the moment someone else pushes.

## What Nivasa/Niwasthan actually is

An AI-native home interior design platform for India. Full product vision lives in `README.md` at repo root — read that for the real spec (Property → Design → Budget → Procurement → Execution pipeline, Source/Evidence market intelligence architecture, "no fabricated certainty" principle governing every AI-adjacent feature).

## ⚠️ Active, incomplete work: product rename Nivasa → Niwasthan

Domain `nivasa.com`/`.in` wasn't available; `niwasthan.com`/`.in` are registered. Rename is **partially done**:

**Done** (commit `612176f`):

- All markdown docs (README, ARCHITECTURE, everything in `docs/`)
- `package.json` name field
- Commercial package codes/names in `src/server/payments/packages.ts` (`NIVASA_DESIGN` → `NIWASTHAN_DESIGN`, etc.)

**NOT done yet — pick this up next**:

- Test files still reference old `NIVASA_*` codes (grep for `NIVASA_` across `src/**/*.test.ts` — at minimum `renderTierGating.test.ts`, `jobService.test.ts`, `featureGating.test.ts`, `featureAccessService.test.ts` need updating)
- `featureGating.ts` and `renderTierGating.ts` — their `PLAN_FEATURES`/`PLAN_RENDER_TYPES` mapping tables still key on old `NIVASA_*` strings, need updating to `NIWASTHAN_*` to match `packages.ts`
- AI assistant persona/branding — not yet renamed to "Niwasthan Humsafar" anywhere in `src/server/assistant/`
- "Smart features" branding as "Niwasthan Delight" — not implemented anywhere (this is a marketing/UI naming concept, no backend code currently references it)
- **Deliberately deferred, not forgotten**: the `nivasaCommissionBps` column on the `Quote` model (real Prisma schema field) — renaming this needs an actual migration, not a text swap, and it's never user-facing, so there's no urgency. Don't rename this casually.
- Internal-only identifiers (`NivasaJobQueue` constant in `src/server/jobs/queue.ts`, `createNivasaWorker` function) — zero user-facing impact, safe cosmetic cleanup whenever convenient, not urgent.

## Requested but not yet built

- **Italicized cursive styling for "Humsafar"** (the AI assistant name) — this is frontend/CSS work; **no frontend UI codebase exists in this repo yet** (it's API/backend only so far), so this can't be implemented until a frontend project exists.
- The 4-tier plan → feature/render-type mapping needs a real decision for where "Home Intelligence" (₹2,599) sits relative to "Complete" (₹999) and "Immersive" (₹9,999) — a reasonable default was implied (Home Intelligence ≈ Complete's render access + deeper reporting/export) but this was never explicitly confirmed with the user before the session ended.

## Architecture ground truth — verified, not assumed

Two market-intelligence-adjacent systems coexist and are **not duplicates**, confirmed via git history investigation:

- `src/server/marketIntelligence/` — a real, 30+ file, pre-existing module (Source/Evidence/CanonicalProduct-style governance, ingestion, value ranking, substitution). Do not rebuild this.
- Real Budget system: `BudgetPlan` → `BudgetVersion` → `BudgetLine` → `BudgetImpact`, accessed via raw SQL (`$queryRaw`/`$executeRaw`) in `src/server/repositories/budgetRepository.ts`, not the typed Prisma client API. This is intentional — matches an existing convention, not a bug.

**Recurring bug pattern to watch for**: `vi.mocked(prisma)` without `{ deep: true }` only types the top-level mock object; nested methods (`prisma.user.findUnique` etc.) silently keep their real typed signatures with no `.mockResolvedValue`, causing real CI typecheck failures that don't show up locally in this sandbox. Fixed at least twice this session (`accountDeletionService.test.ts`, others). Always use `vi.mocked(prisma, { deep: true })`.

## Sandbox limitation, permanent, not a bug to chase

This development sandbox cannot reach Prisma's binary CDN, so `npx prisma generate` fails here. This means:

- `npx vitest run` will always show **3 pre-existing test file failures** (files that import the real Prisma client unmocked) — this is expected, not a regression, as long as the count stays at exactly 3 and the same files.
- `npx prisma generate`, `npx prisma validate`, and `npm run build` cannot be verified in this sandbox at all — only real GitHub Actions CI can confirm these. Always push and check the real CI result before treating anything as "done."

## How pushes actually happened this session

A GitHub Personal Access Token was used directly via `git push https://x-access-token:TOKEN@github.com/...` — **that token should already be revoked** per repeated recommendation throughout the session. Any new session needs a fresh token from the user to push directly, or work should go through whatever normal process (PR from a fork, Codex, etc.) the user prefers going forward.

## Verified state as of commit `612176f`

- `npx prettier --check .` — clean, whole repo
- `npx eslint .` — clean, whole repo
- `npx vitest run` — 358/358 real tests passing, 74/77 files (3 expected sandbox-only failures)
- Real GitHub CI — confirmed green on the commit immediately prior (`018b2d9`); **not yet re-verified on `612176f`** — check this first in a new session

## Recommended immediate next steps, in order

1. Verify CI on `612176f` (the rename checkpoint) actually passed
2. Finish the rename: update remaining test files' `NIVASA_*` references, update the two gating tables, rename assistant persona to Humsafar
3. Get explicit confirmation on the Home Intelligence tier's exact feature/render-type mapping before finalizing gating logic
4. Everything else genuinely blocked on business decisions (visualization provider credential, real market data feed activation, production infra signup) — see `README.md` and prior conversation for full context on why these specifically can't be coded around
