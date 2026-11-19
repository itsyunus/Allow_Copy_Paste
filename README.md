# Copy Paste Enabler - Chrome Extension

A lightweight Chrome Manifest V3 extension that bypasses web page copy, paste, text selection, and context-menu restrictions by neutralizing DOM event blockers in both the isolated world and direct page execution contexts.

## Technical Mechanisms

- Prototype Interception: Injects `inject.js` directly into the document root context to override `addEventListener` on `EventTarget`, neutralizing handlers for `copy`, `cut`, `paste`, `selectstart`, `contextmenu`, and keydown combinations.
- CSS Override: Resets restricted CSS rules dynamically (`user-select: text !important`, `-webkit-user-select: text !important`).
- Manifest V3 Architecture: Minimal permission footprint utilizing `activeTab` and `scripting`.

## Installation

1. Clone repository locally.
2. Open Google Chrome and navigate to `chrome://extensions/`.
3. Enable "Developer mode".
4. Select "Load unpacked" and choose the `Allow_Copy_Paste` directory.
