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

## Configure Supabase (auth + profiles)

The app reads its Supabase connection from env vars at startup and throws if
they're missing. Copy `.env.example` to `.env` and set:

| Var | Value |
|---|---|
| `EXPO_PUBLIC_SUPABASE_URL` | project URL, or `http://127.0.0.1:54321` for the local stack |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | matching anon key |

For the local stack, run `supabase start` then `supabase db reset` (applies
`supabase/migrations/`) and use the URL + anon key it prints. Only
`EXPO_PUBLIC_`-prefixed vars reach the app, and Expo reads them at startup, so
restart the dev server after changes.

## Configure Google sign-in

"Continue with Google" uses the native `@react-native-google-signin` flow into
`supabase.auth.signInWithIdToken`. It needs two **public** OAuth client IDs from
Google Cloud Console — a Web client and an iOS client (the Web ID is what
Supabase validates the token against):

| Var (`.env`) | Value |
|---|---|
| `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` | the **Web application** client ID |
| `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID` | the **iOS** client ID |

Also set the google-signin plugin's `iosUrlScheme` in `app.json` to the iOS
client ID **reversed** (`com.googleusercontent.apps.<id>`), and in the Supabase
dashboard (Authentication → Providers → Google): enable it, put both client IDs
in **Authorized Client IDs** (web first), and turn on **Skip nonce check**.

Because it's a native module, Google sign-in only works in a **dev build**
(below), not Expo Go.

## Running it

Google sign-in is a native module, so this app runs as an Expo **dev build**,
not Expo Go. Install once from the repo root (`npm install`), then from
`apps/mobile`:

```bash
npx expo run:ios     # first run builds the native app (~minutes); later runs are fast
```

This builds the dev client into the iOS Simulator and starts Metro. Only rebuild
with `run:ios` when native config changes — JS edits hot-reload.

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
- Expo-managed with Continuous Native Generation: `npx expo prebuild` (run
  automatically by `expo run:ios`) generates the `ios/` and `android/` projects
  from `app.json` + config plugins, so they stay gitignored and are never
  hand-edited. Regenerate them any time with `npx expo prebuild --clean`.

## Adding Android later

No separate app needed — the same codebase runs on Android:

```bash
npm run android --workspace=apps/mobile   # requires Android Studio + an emulator, or a device
```
