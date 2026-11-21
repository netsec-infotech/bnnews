#!/bin/bash
# ==============================================================
# BN NEWS GUJARATI - AUTOMATED BACKUP SCRIPT
# ==============================================================
set -e

BACKUP_DIR="/var/backups/bn-news"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
DB_NAME="bn_news_gujarati"
DB_USER="postgres"

mkdir -p $BACKUP_DIR

echo "💾 Backing up PostgreSQL database..."
pg_dump -U $DB_USER -d $DB_NAME -F c -b -v -f "$BACKUP_DIR/db_$TIMESTAMP.dump"

echo "🖼️ Backing up uploaded media..."
tar -czf "$BACKUP_DIR/uploads_$TIMESTAMP.tar.gz" -C /var/www/bn-news/backend uploads

# Keep only the last 14 days of backups
find $BACKUP_DIR -type f -mtime +14 -name "*.dump" -delete
find $BACKUP_DIR -type f -mtime +14 -name "*.tar.gz" -delete

echo "✅ Backup completed: $TIMESTAMP"
