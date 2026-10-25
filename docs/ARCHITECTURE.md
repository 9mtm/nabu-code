# Embedded Code architecture

Dpro owns the main native window, sign-in, chat, agents, skills, memory and navigation. Code is a bottom navigation destination alongside Terminal. The editor stays in a sandboxed child view while Chat and other sections use their existing renderer. The Dpro header and footer remain visible.

The desktop adapter reads `nabu/runtime.json` from a trusted local root and loads `nabu/dpro/editor-runtime.mjs`. The runtime starts the compiled editor web server on a random loopback port, using a private connection-token file in the Dpro desktop profile. Only the native main process receives its URL. No additional account or API key is introduced.

Switching destinations hides the child view without closing files. Parent reload or sign-out hides it. Closing dirty work defaults to keeping it open. Dpro owns and stops the editor server during shutdown.

`npm run prepare:editor` applies web-workbench defaults and nested build-path fixes. Build the imported editor client/server and remote dependencies with the upstream toolchain before activation. `npm start` opens an already configured Dpro desktop app; it does not launch a standalone Nabu product.

The verified local preview depends on the existing Dpro service and compiled editor checkout. Production artifact staging, installer integration and installed-app updates remain release work. Dpro's public adapter consumes this internal runtime without publishing its source in the public repository.
