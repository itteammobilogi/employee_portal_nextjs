# deploy.sh — Next.js auto-deploy for CentOS
# Place this file at: /var/www/html/employee_portal_nextjs/employee_portal_nextjs/deploy.sh
# Make it executable: chmod +x /var/www/html/employee_portal_nextjs/employee_portal_nextjs/deploy.sh

set -euo pipefail

# ====== CONFIG ======
APP_DIR="/var/www/html/employee_portal_nextjs/employee_portal_nextjs"
BRANCH="main"                           # change if you deploy another branch
PM2_ID="21"                             # your existing PM2 process ID
PM2_NAME="employee_portal_nextjs"       # used if process isn't running yet
NODE_ENV="production"                   # build env
LOG_FILE="${APP_DIR}/.deploy.log"       # optional: keeps a small deploy log
# ====================

exec > >(tee -a "$LOG_FILE") 2>&1
echo -e "\n=== [$(date '+%Y-%m-%d %H:%M:%S')] Starting deploy ==="
echo "[deploy] APP_DIR=$APP_DIR  BRANCH=$BRANCH  PM2_ID=$PM2_ID  PM2_NAME=$PM2_NAME"

cd "$APP_DIR"

# 1) Get latest code
echo "[deploy] Fetching latest code..."
git fetch --all --prune

# Ensure correct branch (no-op if already on it)
current_branch="$(git rev-parse --abbrev-ref HEAD || echo '')"
if [ "$current_branch" != "$BRANCH" ]; then
  echo "[deploy] Checking out branch $BRANCH (was $current_branch)"
  git checkout "$BRANCH"
fi

# Hard reset to remote branch
echo "[deploy] Resetting to origin/$BRANCH..."
git reset --hard "origin/${BRANCH}"

# 2) Install dependencies
echo "[deploy] Installing dependencies (npm ci)..."
if ! npm ci; then
  echo "[deploy] npm ci failed; trying npm install as fallback..."
  npm install
fi

# 3) Build Next.js
echo "[deploy] Building app..."
export NODE_ENV="$NODE_ENV"
npm run build

# 4) Restart app with PM2
echo "[deploy] Restarting with PM2..."
if pm2 describe "$PM2_ID" >/dev/null 2>&1; then
  pm2 restart "$PM2_ID"
else
  # If ID not found, try by name (reload if running; start if not)
  if pm2 describe "$PM2_NAME" >/dev/null 2>&1; then
    pm2 reload "$PM2_NAME"
  else
    pm2 start npm --name "$PM2_NAME" -- run start
  fi
fi

pm2 save || true
echo "=== [$(date '+%Y-%m-%d %H:%M:%S')] Deploy complete ==="