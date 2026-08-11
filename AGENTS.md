# AGENTS.md

Guidance for coding agents working in this repo. See `CONTRIBUTING.md` for
full setup, conventions, and deployment details.

## Supabase config is code

`supabase/config.toml` is the source of truth for Supabase project settings
(auth, redirect URLs, SMTP, providers, rate limits). **Treat the Supabase
dashboard as read-only for anything this file covers** — change those settings
in `config.toml` via a PR, not in the console.

On merge to `main`, the `Supabase config push` GitHub Action
(`.github/workflows/supabase-config.yml`) runs `supabase config push` and
applies the file to the production project. The push is one-directional and
overwrites drift, so any dashboard edit will be silently reverted on the next
push. Secret *values* and provider app registration live outside the file
(Bitwarden / dashboard).
