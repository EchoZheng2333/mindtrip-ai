# AGENTS.md — 心旅 AI（MindTrip AI）

心旅 AI：心理-美学评测 × 文旅场景匹配推荐系统（Express + EJS + 本地 JSON 持久化）。
本文件为在该仓库中工作的 agent 提供工程约定。

## Agent skills

### Issue tracker

Issues and specs live as local markdown files under `.scratch/<feature>/` (this repo has no git remote; GitHub Issues not in use). See `docs/agents/issue-tracker.md`.

### Triage labels

Default five-role vocabulary: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context layout: one `CONTEXT.md` + `docs/adr/` at the repo root, created lazily by `/domain-modeling` when terms or decisions resolve. See `docs/agents/domain.md`.
