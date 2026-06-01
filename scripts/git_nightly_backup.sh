#!/bin/bash
# scripts/git_nightly_backup.sh
# Automated script to commit and push changes. Designed to be run via macOS crontab.

# Navigate to the project root directory
cd "$(dirname "$0")/.." || exit

# Get the current timestamp
TIMESTAMP=$(date +"%Y-%m-%d %H:%M:%S")

MANUAL_MODE=0
if [ "$1" == "--manual" ]; then
  MANUAL_MODE=1
fi

echo "[$TIMESTAMP] Starting Code Backup Process..."

# Update Gadget Catalog
echo "[$TIMESTAMP] Generating latest Gadget Catalog..."
node scripts/generate_gadget_catalog.js

# Check if there are any changes to commit
if [[ -z $(git status -s) ]]; then
  echo "[$TIMESTAMP] No changes to commit in Git."
  if [ "$MANUAL_MODE" -eq 1 ]; then
    echo "[$TIMESTAMP] Manual Code Backup completed (ZIP only)."
  fi
  exit 0
fi

# Add all changes
git add .

# Commit with a timestamped message
git commit -m "chore(backup): nightly automated backup $TIMESTAMP"

# Push to the remote repository
git push origin main

echo "[$TIMESTAMP] Nightly backup completed successfully."
