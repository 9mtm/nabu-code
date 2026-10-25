# Product concept

## Purpose

Bring the existing terminal-based collaboration workflow into a dedicated coding editor: the user talks directly to an official coding tool while seeing project files, changes, command output and approval requests together.

## Intended workflow

1. Open a local project folder.
2. Select Claude Code or Codex.
3. Start or resume a session where supported.
4. Send a request from the editor interface.
5. Inspect responses, file changes and command results.
6. Respond to approval requests and review the resulting changes.

These are intended capabilities, not verified integrations.

## Editor foundation

A derivative of the open-source VS Code codebase is a candidate foundation. This could provide file editing, navigation, search, Git integration and terminal functionality. No foundation has been selected yet. Distribution, branding, extension availability, updates and licensing need investigation before adoption.

## Agent connection

Prefer documented structured interfaces exposed by official coding tools. Verify streaming events, authentication, session continuity, cancellation, approval handling and recovery for each tool independently. Do not assume parsing terminal text is a complete integration or that all tools expose identical behavior.

The initial concept does not require a separate model API-key chat service. Subscription compatibility and usage limits depend on each provider's supported integration and terms.

## Dpro Bot integration

Nabu Code remains independently usable. A later optional interface may expose selected agents, personalities, skills and memory from Dpro Bot. Sharing must be explicit and scoped; integration must not silently copy credentials, private memory or permissions. The interface and source of truth remain to be designed.

## Initial scope to evaluate

- Local project and file editing.
- Integrated terminal and Git change review.
- One reliable coding-tool session before adding a second adapter.
- Clear session, execution and approval states.
- Explicit cancellation and failure recovery.

## Open questions

- VS Code derivative or another editor foundation?
- Which official coding-tool interface should be implemented first?
- Which operating system should receive the first prototype?
- What is the smallest useful Dpro Bot integration?
- Are the product name, domains and relevant trademarks available?


## 2026-10-25 — Free editor and product sign-in

Owner direction: offer Nabu Code as a free standalone editor with Google sign-in for its product account. Google sign-in identifies the Nabu user; it does not authenticate Claude Code or Codex, grant a model subscription, or make provider usage free. Account infrastructure, offline behavior, and whether sign-in is mandatory remain to be specified. A VS Code-derived foundation is the intended direction for evaluation, with distribution and licensing still to be reviewed.

## 2026-10-25 — Main-agent runtime and team orchestration

In Dpro Bot settings, the owner should configure the main coordinating agent's execution backend: a local runtime, Claude Code, or Codex. The preferred cloud-tool path uses the user's own supported tool login/subscription rather than requiring a separate model API key. Each provider retains its own authentication, supported capabilities and usage limits; compatibility is not yet verified.

The user primarily talks to the main agent. That agent decides which team member to involve, delegates bounded tasks, collects results and manages the overall work using the existing agent identities, skills, memory and permission gates. A selected runtime is the execution engine for an agent, not a replacement for the team model. Worker runtime selection, delegation depth, concurrent sessions, budget limits and recovery need an explicit design; selecting a coordinator backend must not silently give every worker the same provider credentials or authority.

When connected to Dpro Bot, Nabu Code should reuse the configured team and main coordinator through a defined integration rather than create a second unrelated team. Standalone Nabu operation remains supported as a product requirement.

This is requested behavior, not confirmation that today's Dpro chat/settings already provide this complete flow. Audit existing runtime selection and orchestration before implementation; reuse existing components wherever possible. No implementation or activation is authorized by this documentation update.


## 2026-10-25 — Proprietary product and integrated editor experience

Owner decision: Nabu Code is a proprietary, closed-source product, not an open-source release. Free use of the editor does not imply publication of its source. Do not publish the repository or source without explicit owner authorization. Third-party source remains subject to its own licenses and notices; review the chosen VS Code foundation and dependencies before distribution. This decision does not assert ownership over upstream code or permission to remove required notices.

Offer both a standalone application and an editor experience visible inside Dpro Bot when integrated. Opening an external app alone does not fulfill the requested in-product experience. The embedding/composition mechanism is not selected; validate technical feasibility before implementation. Reuse the same product capabilities and authorized agent/team context rather than maintain two independent editors.

Closed source means source is not intentionally distributed as an open repository. It is not a promise that installed client code cannot be inspected or reverse-engineered. Keep credentials and server-side secrets out of distributable client code.
