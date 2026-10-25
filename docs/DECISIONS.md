# Product decisions

## 2026-10-25 — Product name

Owner-approved name: **Nabu Code**. Short name: **Nabu**. Arabic name: نابو كود. Name availability has not been checked.

## 2026-10-25 — Separate product

Keep Nabu Code outside the Agent Player / Dpro Bot application source. Use its own project folder and, when authorized, its own repository and release lifecycle. Later Dpro Bot integration is optional.

Project location: `/Users/mohamedalarade/Documents/Projects/htdocs/dpro/nabu-code/`.

## 2026-10-25 — Direct coding-tool workflow

The intended agent experience connects to Claude Code and Codex through their official supported local interfaces, reflecting the owner's existing terminal workflow. Protocol and runtime details remain unverified.

## 2026-10-25 — Documentation setup

The owner authorizes folder creation and concept documentation. Editor implementation, dependency installation, server startup and publication are outside this setup task.


## 2026-10-25 — Free editor and product sign-in

Owner direction: offer Nabu Code as a free standalone editor with Google sign-in for its product account. Google sign-in identifies the Nabu user; it does not authenticate Claude Code or Codex, grant a model subscription, or make provider usage free. Account infrastructure, offline behavior, and whether sign-in is mandatory remain to be specified. A VS Code-derived foundation is the intended direction for evaluation, with distribution and licensing still to be reviewed.

## 2026-10-25 — Main-agent runtime and team orchestration

In Dpro Bot settings, the owner should configure the main coordinating agent's execution backend: a local runtime, Claude Code, or Codex. The preferred cloud-tool path uses the user's own supported tool login/subscription rather than requiring a separate model API key. Each provider retains its own authentication, supported capabilities and usage limits; compatibility is not yet verified.

The user primarily talks to the main agent. That agent decides which team member to involve, delegates bounded tasks, collects results and manages the overall work using the existing agent identities, skills, memory and permission gates. A selected runtime is the execution engine for an agent, not a replacement for the team model. Worker runtime selection, delegation depth, concurrent sessions, budget limits and recovery need an explicit design; selecting a coordinator backend must not silently give every worker the same provider credentials or authority.

When connected to Dpro Bot, Nabu Code should reuse the configured team and main coordinator through a defined integration rather than create a second unrelated team. Standalone Nabu operation remains supported as a product requirement.

This is requested behavior, not confirmation that today's Dpro chat/settings already provide this complete flow. Audit existing runtime selection and orchestration before implementation; reuse existing components wherever possible. No implementation or activation is authorized by this documentation update.


## 2026-10-25 — Consolidated project layout

Owner approved and requested the following layout. Keep editor source under `editor/` and Nabu-specific features under `nabu/`, without separate packages for every adapter.

```text
nabu-code/
├── editor/          # Upstream editor source and editor modifications
├── nabu/
│   ├── chat/        # Chat interface and team coordination
│   ├── agents/      # Claude Code, Codex and local runtime adapters
│   ├── account/     # Product account and sign-in integration
│   └── dpro/        # Optional Dpro Bot integration
├── assets/          # Branding and icons
├── scripts/         # Build and packaging tools
├── tests/           # Integration verification
├── docs/            # Product concept, decisions and roadmap
└── README.md
```

Directories are created. No upstream source has been downloaded and no runtime has been implemented. Account service deployment boundaries remain to be designed; this layout does not place OAuth secrets in client code. Empty directories are intentional during documentation setup.


## 2026-10-25 — Proprietary product and integrated editor experience

Owner decision: Nabu Code is a proprietary, closed-source product, not an open-source release. Free use of the editor does not imply publication of its source. Do not publish the repository or source without explicit owner authorization. Third-party source remains subject to its own licenses and notices; review the chosen VS Code foundation and dependencies before distribution. This decision does not assert ownership over upstream code or permission to remove required notices.

Offer both a standalone application and an editor experience visible inside Dpro Bot when integrated. Opening an external app alone does not fulfill the requested in-product experience. The embedding/composition mechanism is not selected; validate technical feasibility before implementation. Reuse the same product capabilities and authorized agent/team context rather than maintain two independent editors.

Closed source means source is not intentionally distributed as an open repository. It is not a promise that installed client code cannot be inspected or reverse-engineered. Keep credentials and server-side secrets out of distributable client code.


## 2026-10-25 — Standalone first

Owner confirms: build Nabu Code first as a separate standalone application. Defer Dpro Bot integration and its in-product editor surface until after the standalone workflow is established. Retain the proprietary/closed-source direction and the consolidated folder layout. This sets sequencing; it does not authorize downloads, installations, service starts or publication.
