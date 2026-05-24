Security checklist — immediate actions

1) Rotate any leaked credentials
- If you used a Firebase service account private key or Resend API key in this repo, revoke and recreate them immediately.
- For Firebase client API keys (public) it's okay to keep them; they are intended to be public. Still rotate if you suspect misuse.

2) Ensure secrets are not committed
- The repository should never contain raw private keys or service account JSON. Search for these strings: "-----BEGIN PRIVATE KEY-----", "NUXT_FIREBASE_PRIVATE_KEY", and your project-specific API keys.
- Local .env files are ignored by git via .gitignore; keep secrets there locally and set Cloudflare Pages environment secrets for production.

3) Remove build artifacts from git
- If build outputs (.output, dist, .wrangler) were accidentally committed, remove them from the repo history (contact the team / use git-filter-repo) and force-push only after agreement. This repository's working tree currently contains local build files but .gitignore excludes them.

4) Verify Cloudflare Pages / CI settings
- Ensure Cloudflare Pages environment variables (NUXT_PUBLIC_* for client values and NUXT_FIREBASE_* for server-side service account values) are set using Pages Secrets, not checked into source.

5) Add scanning to CI / pre-commit
- Use scripts/scan-secrets.sh in CI or as a pre-commit hook to catch accidental leaks before pushing.

Quick remediation commands
- Find occurrences: `rg "-----BEGIN PRIVATE KEY-----|NUXT_FIREBASE_PRIVATE_KEY|AIza[0-9A-Za-z_-]{35}" || true`
- To remove a committed file: `git rm --cached path/to/file && git commit -m "chore: remove leaked artifact"` — do NOT rewrite history without team approval.

If you want, I can:
1) Add a pre-commit hook that runs the scanner locally.
2) Help rotate specific credentials (Firebase service account guidance).
3) Remove any tracked build artifacts found in the repo (I will show the diff first).

How to enable the pre-commit hook locally
- Copy .githooks/pre-commit to .git/hooks/pre-commit and make it executable:
  chmod +x .githooks/pre-commit && cp .githooks/pre-commit .git/hooks/pre-commit
  (Or set git config core.hooksPath .githooks to use the folder for hooks.)
