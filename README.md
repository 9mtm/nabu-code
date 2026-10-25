# Dpro Code — internal editor source

This directory supplies the editor used by **Code** inside Dpro Agent/Bot. Code appears directly in the **bottom navigation**, alongside Terminal. It opens inside the same Dpro window; The existing Code and Chat destinations switch between the retained editor and Dpro chat. The Dpro footer remains available for other applications.

There is no standalone Nabu product or separate sign-in. Existing Dpro chat, agents, personalities, skills and authentication remain the shared implementation. Switching views preserves open files. Closing unsaved work defaults to keeping it open.

## Local development

On the configured Mac, `npm start` opens the existing Dpro desktop preview. It does not build, install or start a separate Nabu application. Set `DPRO_DESKTOP_APP` to an existing Dpro app path if the workspace layout differs.

The current local preview uses the existing Dpro UI at `http://127.0.0.1:42522` and the internal compiled editor in this directory. The optional desktop adapter loads `nabu/runtime.json` and starts `nabu/dpro/editor-runtime.mjs` on demand. The editor server binds only to loopback and keeps its connection token in the desktop profile, outside renderer state.

`npm run prepare:editor` prepares source hooks. Use Node.js 24 for the upstream editor build and `npm test`. The imported upstream is VS Code 1.143.1 under `editor/`; provenance is recorded in [UPSTREAM.json](docs/UPSTREAM.json).

## Release status

The native local preview has been exercised with Dpro sign-in, Code/Chat switching, file save and other application navigation. A self-contained installer, production editor staging, signed release and installed-app updater are not completed by this development preview. The editor is maintained as one internal component, to be shipped through Dpro releases.

Source publication is not authorized. Upstream components retain their respective licenses. Earlier standalone or reciprocal-product plans in the historical documentation are superseded by the owner's in-Dpro-only decision.

## Documentation

- [Product concept and owner decisions](docs/PRODUCT.md)
- [Decision history](docs/DECISIONS.md)
- [Roadmap](docs/ROADMAP.md)
- [Architecture](docs/ARCHITECTURE.md)
