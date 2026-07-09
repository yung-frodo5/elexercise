# Mobile App (Expo / React Native)

## One-time Mac setup

1. **Xcode**: install from the Mac App Store, then open it once and accept
   the license + let it install additional components.
2. **Xcode Command Line Tools**:
   ```bash
   xcode-select --install
   ```
3. **CocoaPods** (native dependency manager iOS builds use under the hood):
   ```bash
   sudo gem install cocoapods
   ```
4. **Watchman** (file watcher Metro uses; not strictly required but avoids
   flaky reloads on macOS):
   ```bash
   brew install watchman
   ```
5. You do **not** need to install Xcode's iOS Simulator separately — it
   ships with Xcode. Open Xcode → Settings → Platforms to confirm an iOS
   simulator runtime is installed.

You do not need an Apple Developer account to run on the Simulator. You'll
need one ($99/yr) only when you want to install on a physical iPhone or
submit to the App Store.

## Running it

From the repo root:

```bash
npm install          # if you haven't already, links this app into the workspace
npm run dev:mobile   # starts the Expo dev server
```

Then press `i` in the terminal to launch the iOS Simulator, or scan the QR
code with the Expo Go app on a physical iPhone (same Wi-Fi network as your
Mac).

## Talking to the local API

`App.tsx` points at `http://localhost:3001`. That works from the iOS
Simulator because it shares your Mac's network stack. It will **not** work
from a physical device — use your Mac's LAN IP instead:

```bash
ipconfig getifaddr en0   # or en1, depending on your network interface
```

Then update `API_URL` in `App.tsx` to `http://<that-ip>:3001`. Make sure
`apps/api` is running (`npm run dev:api` from the repo root) and that your
Mac's firewall isn't blocking incoming connections on port 3001.

## Project structure notes

- `metro.config.js` is configured to watch the whole monorepo and resolve
  `@exercise-tracker/shared-types` from `packages/`. If you add another
  shared package later, no config change needed — it already watches
  everything under the repo root.
- This is a standard Expo-managed app (not "bare") — you get the simulator
  workflow above without touching native iOS/Android project files. If you
  eventually need a native module Expo doesn't support, `npx expo prebuild`
  generates the native projects without switching frameworks.

## Adding Android later

No separate app needed — the same codebase runs on Android:

```bash
npm run android --workspace=apps/mobile   # requires Android Studio + an emulator, or a device
```
