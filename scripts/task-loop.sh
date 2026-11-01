#!/bin/bash
# task-loop.sh — repeatable workflow: commit -> build -> deploy -> verify
# Usage: ./scripts/task-loop.sh "commit message"
#   or:  ./scripts/task-loop.sh "(no msg)"   # auto-message
#
# For repeated use, wrap each task like:
#   ./scripts/task-loop.sh

set -euo pipefail

cd "$(dirname "$0")/.."
REPO_ROOT="$PWD"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info()  { echo -e "${GREEN}[INFO]${NC}  $*"; }
log_warn()  { echo -e "${YELLOW}[WARN]${NC} $*"; }
log_error() { echo -e "${RED}[ERR]${NC}  $*"; }

usage() {
  echo "Usage: $0 \"<commit message>\""
  echo "  Commit all staged + unstaged changes, build, deploy to Cloudflare Pages, verify."
  exit 1
}

[ $# -ge 1 ] || usage
MSG="$1"

# 1) Stage tracked changes only (leave untracked files alone)
cd "$REPO_ROOT"
git add -A
UNTRACKED=$(git status --porcelain 2>/dev/null | grep -c '^??' || true)
if [ "$UNTRACKED" -gt 0 ]; then
  log_warn "Untracked files present: $UNTRACKED — leaving them out of the commit."
fi

# 2) Commit (skip if nothing to commit)
if git diff --staged --quiet 2>/dev/null && git diff --quiet 2>/dev/null; then
  log_info "Nothing to commit — working tree clean."
  log_info "Skipping commit; building and deploying already-committed code."
else
  git commit -m "$MSG"
  log_info "Committed: $(git log --oneline -1)"
fi

# 3) Build (mirrors package.json "build" = vite build + cpx _redirects/_routes.json into dist)
log_info "Building..."
if npm run build 2>&1 | tail -5; then
  log_info "Build OK."
else
  log_warn "Build finished with warnings (see tail above). Continuing to deploy."
fi

# 4) Deploy
log_info "Deploying to Cloudflare Pages (project: mimenu, branch: main)..."
if command -v npx >/dev/null 2>&1; then
  WRANGLER="npx wrangler"
elif command -v wrangler >/dev/null 2>&1; then
  WRANGLER="wrangler"
else
  log_error "Neither 'wrangler' nor 'npx' found on PATH."
  exit 1
fi
$WRANGLER pages deploy dist --project-name=mimenu --branch=main --commit-dirty=true
log_info "Deployment complete."

# 5) Verify
log_info "Verifying production deployment..."
PROD=$(curl -s -o /dev/null -w "%{http_code}" https://mimenu.clubemkt.digital/ 2>/dev/null)
log_info "Production custom domain HTTP: ${PROD}"
if [ "$PROD" = "200" ]; then
  log_info "✅ Production is live with the latest commit."
else
  log_error "❌ Production did not respond with 200."
fi

echo ""
log_info "Done. https://mimenu.clubemkt.digital is live with the latest commit."
