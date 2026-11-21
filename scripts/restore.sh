#!/bin/bash
# ==============================================================
# BN NEWS GUJARATI - RESTORE SCRIPT
# ==============================================================
set -e

if [ -z "$1" ]; then
    echo "Usage: ./restore.sh <path-to-db-dump> [path-to-uploads-tar]"
    exit 1
fi

DB_FILE=$1
UPLOADS_FILE=$2
DB_NAME="bn_news_gujarati"
DB_USER="postgres"

echo "⚠️ Restoring database from $DB_FILE..."
pg_restore -U $DB_USER -d $DB_NAME -v -c "$DB_FILE"

if [ -n "$UPLOADS_FILE" ] && [ -f "$UPLOADS_FILE" ]; then
    echo "🖼️ Restoring uploads from $UPLOADS_FILE..."
    tar -xzf "$UPLOADS_FILE" -C /var/www/bn-news/backend/
fi

echo "✅ Restoration completed successfully!"
