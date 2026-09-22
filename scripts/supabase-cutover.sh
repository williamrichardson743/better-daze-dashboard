#!/usr/bin/env bash
# Supabase cutover — run from repo root. Stops on any failure.
set -euo pipefail
SCOPE=williamrichardson743-1110s-projects
PROD=origin/kimi-production
SUPA=origin/claude/vercel-supabase-backlog-jnvr9u

step(){ printf '\n\033[1m==> %s\033[0m\n' "$*"; }

step "1/6 Preflight — production must be healthy before we touch anything"
for u in https://ops.better-daze-sf.com https://www.better-daze-sf.com; do
  c=$(curl -s -o /dev/null -w '%{http_code}' -m 20 "$u"); echo "  $u -> $c"
  [ "$c" = 200 ] || { echo "ABORT: production already unhealthy"; exit 1; }
done

step "2/6 Confirm Preview and Production DATABASE_URL differ"
echo "  Preview and Production must point at DIFFERENT Supabase projects."
echo "  Verify in the Vercel dashboard, then press Enter (Ctrl-C to abort)."
read -r _

step "3/6 Migrate STAGING (Preview DB) — direct connection, port 5432"
echo "  Paste the STAGING direct URL when prompted (it is not echoed):"
read -rs STAGING_URL; echo
DATABASE_URL="$STAGING_URL" pnpm run db:migrate
DATABASE_URL="$STAGING_URL" pnpm run db:check
DATABASE_URL="$STAGING_URL" pnpm run db:verify
unset STAGING_URL

step "4/6 Deploy Supabase code to PREVIEW and smoke-test it"
git fetch origin --prune
git push origin "$SUPA:refs/heads/staging-supabase" --force
URL=$(npx --yes vercel@latest deploy --yes --archive=tgz --scope "$SCOPE" 2>&1 | grep -oE 'https://[a-z0-9-]+\.vercel\.app' | tail -1)
echo "  preview: $URL"
echo "  /api/health -> $(curl -s -o /dev/null -w '%{http_code}' -m 30 "$URL/api/health")"
echo "  Log in via GitHub on that URL, load a dashboard page, do one write."
echo "  Press Enter only if all of that worked (Ctrl-C to abort)."
read -r _

step "5/6 PRODUCTION cutover — point DATABASE_URL at prod Supabase, then ship code"
echo "  The app is dialect-specific: the env var and the code must move together."
echo "  There is a ~90s window where the site is down. Continue? (Enter / Ctrl-C)"
read -r _
npx --yes vercel@latest env rm DATABASE_URL production --yes --scope "$SCOPE" || true
echo "  Paste the PRODUCTION pooler URL (port 6543):"
npx --yes vercel@latest env add DATABASE_URL production --scope "$SCOPE"
git push origin "$SUPA:refs/heads/kimi-production"
echo "  waiting for production deploy..."; sleep 90

step "6/6 Verify — or roll back"
FAIL=0
for u in https://ops.better-daze-sf.com https://www.better-daze-sf.com; do
  c=$(curl -s -o /dev/null -w '%{http_code}' -m 25 "$u"); echo "  $u -> $c"; [ "$c" = 200 ] || FAIL=1
done
h=$(curl -s -o /dev/null -w '%{http_code}' -m 25 https://ops.better-daze-sf.com/api/health); echo "  /api/health -> $h"; [ "$h" = 200 ] || FAIL=1
if [ "$FAIL" = 1 ]; then
  echo; echo "  !! FAILED. ROLL BACK NOW:"
  echo "     1. vercel env rm DATABASE_URL production --yes --scope $SCOPE"
  echo "     2. vercel env add DATABASE_URL production --scope $SCOPE   # the OLD MySQL url"
  echo "     3. vercel rollback --scope $SCOPE                          # last MySQL deployment"
  exit 1
fi
echo; echo "  Production is live on Supabase. Keep the MySQL database untouched for 14 days."
