# Contributor pipeline gardening — reference (awesome-claude / HeyClaude)

## Product shape

Three code surfaces gardening scopes to:
- **`apps/web/src/`** — the TanStack Start website. `routes/` (~70 route files: browse, compare,
  entry detail, brief, jobs, validators, `.well-known` endpoints, OG images), `lib/` (~250 files,
  following a `foo.ts` + `foo-lib.ts` split for pure-function testability), `data/`. `generated/`
  is maintainer-owned — never a gardening-issue target.
- **`packages/registry/src/`** — schema/validation/submission-risk/content-builder libraries
  (`.js` + `.d.ts`) that define what a valid content entry is and score submission risk.
  `submission-risk.js` alone is ~76KB — a real, complex module worth auditing for gaps. No README
  exists here despite being the schema source-of-truth (a legitimate, low-effort docs-gap issue if
  nothing more substantive is found).
- **`packages/mcp/`** — the MCP server package (`registry-*-lib.js` files) exposing the registry
  over MCP tools/resources.

`content/` (curated directory entries) is a real contribution surface but explicitly PR-first —
never a gardening-issue target (see SKILL.md's "Scope" section for why).

## The gate — advisory, not a hard block

Platform/code PRs go through required CI + maintainer review; the shared `gittensory-orb` bot
posts an advisory readiness/coverage comment but never auto-merges or auto-closes here (unlike
loopover/metagraphed's one-shot gate). `.gittensory.yml` sets `gate.linkedIssue: advisory` — a PR
can merge without ever linking an issue. This means gardening's job is to make issues *worth*
picking up, not to rely on a gate forcing contributors toward them.

`.gittensory.yml`'s `linkedIssueLabelPropagation` block does auto-propagate `gittensor:bug`/
`gittensor:feature` from a linked issue onto the PR (trusting a maintainer-authored issue's
categorization) — `gittensor:priority` deliberately does NOT auto-propagate, since it's the
scarce, reward-bearing label and requires more trust than a linked-issue mechanic alone provides.

## Codecov — why this matters for what NOT to file

`codecov.yml`: `codecov/patch` target 70%, threshold 5%, **enforcing**; `codecov/project` target
auto, threshold 1%, enforcing (base-relative per-PR). This is a soft bar compared to loopover's
99% patch gate — trivially satisfied by adding tests to already-written code, which is the
mechanical reason contributors have defaulted to `test(...): cover X` PRs (path of least
resistance to a green, mergeable PR). Gardening does not need to "fix" this gate — just avoid
generating issues that invite the same low-effort response. See SKILL.md's "the one thing this
skill exists to prevent" section.

## Milestones

| Milestone | Number | State | Nature |
|---|---|---|---|
| `Code Quality — Round 5` | #3 | Closed | Historical sprint (CSP nonces, a11y fixes, perf memoization, timeout hardening — 20 issues, all closed). Reference for "what real value work looks like here," not a target. |
| `Growth & Maintainability — Round 7` | #4 | Closed | Historical sprint (SEO recency scoring, submission-gate refactor of a 5,137-line file, Lighthouse CI budgets, Core Web Vitals reporting — 26 issues, all closed). Same: reference only. |
| `Contributor Backlog (Gardening)` | #5 | **Open** | **Created 2026-07-17, the target for every gardening-generated issue.** Both Round milestones were fully closed/historical when this skill was built — nothing existing fit an ongoing, continuously-refreshed backlog, and this skill's own output is exactly the "recurring category that will keep needing a home" case that justifies a new milestone (same reasoning as loopover's `Miner Wave 4.5 — AMS Hardening Round 2`). Deliberately not numbered/dated like the Round milestones — it's evergreen, not a sprint, since gardening runs every 24h indefinitely. |

**Every gardening-generated issue gets milestone #5.** If a future run finds #5 has grown stale or
unwieldy (e.g. very old issues nobody picked up), that's a Pass 1 hygiene question (close/refresh
stale ones), not a reason to fragment into a new milestone without the same "recurring category"
bar the original creation used.

## Labels

- `gittensor:bug` (0.05x), `gittensor:feature` (0.25x), `gittensor:priority` (1.5x, scarce —
  reserved for real urgency, same convention as loopover; this repo does not have metagraphed's
  looser "used on a third of open issues" density) — same point-multiplier convention as the
  sibling repos, since `.gittensory.yml` explicitly says it's "Modeled on the upstream
  JSONbored/gittensory manifest."
- `help wanted` — paired with the points label, matching the existing `product-feature.yml`
  template's own default label.
- `maintainer-only` — "Owner-only work — yields no Gittensor points" (the label's own repo
  description). Use for anything requiring a business/design decision, touching generated
  artifacts, or needing access a contributor can't have.
- **Never apply**: `size:*` (XS/S/M/L/XL/XXL — this repo's own PR-sizing automation, not an
  issue-time label), `category:*` (content-taxonomy labels for directory entries, not code
  issues), `contributor:*`/`pr:*`/`submission-*` (the content-submission-gate's own bot-managed
  labels), `roadmap`, `slop`, `mod:warning`, `review-evasion`, `banned` (all gate/moderation
  machinery, not gardening's concern).

## Issue body — use the repo's own `product-feature.yml` template

This repo already has a maintainer-authored issue-form template built for exactly this purpose —
`.github/ISSUE_TEMPLATE/product-feature.yml`, description: "Propose contributor work for HeyClaude
product, website, API, MCP, Raycast, discovery, or design improvements." Its own guidance: "Good
issues are narrow enough for one PR, explicit about what is out of scope, and clear about the
proof required before merge." Use its exact field structure (either via `gh issue create --repo
JSONbored/awesome-claude --template product-feature.yml` if the CLI supports it cleanly, or by
matching the field labels manually in the issue body if scripting the creation):

```md
## Goal
<one clear outcome this issue should deliver>

## Why this matters
<user, contributor, traffic, trust, or product-growth value>

## Current behavior
<link relevant pages, files, APIs, or docs>

## Desired behavior
<exactly what should exist after the PR lands>

## Scope
<list allowed areas to edit — specific file paths, not vague directories>

## Out of scope
<explicitly forbid unrelated rewrites, generated artifact churn, automation changes not part of the issue>

## Acceptance criteria
- PR includes `Closes #<issue>`.
<concrete behavior/quality/accessibility/data/SEO/compatibility requirements>

## Quality evidence required in the PR
<exactly what screenshots/invariants/review proof the contributor must provide — frontend/UI changes need desktop+mobile screenshots or an explicit "No visual impact" note; API/MCP changes need invariants + backward-compatibility notes>

## Validation
<exact commands to run from repo root, e.g. `pnpm build`, `pnpm exec vitest run tests/<file>.test.ts`>
```

No separate "Test Coverage Requirements" section like loopover's template — this repo's Codecov
gate is soft enough that a dedicated coverage callout isn't needed; "Validation" covers what to
run, and "Acceptance criteria"/"Quality evidence" cover what must be true.

## Native relationship linking

Same as the sibling repos — GraphQL `addSubIssue`/`addBlockedBy` confirmed working on this repo
(2026-07-17). Most independent bug/feature issues need no link. Reserve for a genuine prerequisite
relationship.

```graphql
mutation { addSubIssue(input: { issueId: "<parent node id>", subIssueId: "<child node id>" }) { issue { number } } }
mutation { addBlockedBy(input: { issueId: "<blocked node id>", blockingIssueId: "<blocker node id>" }) { issue { number } } }
```

Get a node ID: `gh api graphql -f query='query { repository(owner:"JSONbored", name:"awesome-claude") { issue(number: N) { id } } }'`.

## gh CLI gotchas (same as sibling repos)

- `gh api graphql -f query=@file.txt` does not read the file — use `-F query=@file.txt`.
- `gh issue close` has no `--comment-file` flag — write the comment to a file, then
  `-c "$(cat file.md)"` (double-quoted).
- Never embed a body/comment string containing backticks inside a `python3 -c "..."`
  double-quoted bash argument — write to a file first.
