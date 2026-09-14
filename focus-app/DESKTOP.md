# Focus — Horizon Desktop

The desktop edition reuses the same React/Vite application as Focus Horizon Web
and adds a native shell with Tauri 2 for macOS and Windows.

## Local development

Install the Tauri prerequisites for your operating system, then run:

```bash
npm install
npm run desktop:dev
```

The desktop icons are generated from `assets-source/focus-app-icon.png` before
each local development or packaging command.

## Local installer

```bash
npm run desktop:build
```

The installer is written below `src-tauri/target/release/bundle`.

## Environment

Desktop builds use the same public Supabase client variables as the web app:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

Never expose a Supabase secret or `service_role` key in a desktop build.

GitHub Actions uses the project's public Supabase URL and publishable client key
and produces separate artifacts for Apple Silicon macOS, Intel macOS, and
Windows. These values are safe to ship in a frontend client; never replace the
publishable key with a secret or `service_role` key.

For Google sign-in, add the following URL to the Supabase Auth redirect URL
allowlist:

```text
focus-horizon://login-callback
```
