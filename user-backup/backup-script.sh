#!/bin/sh

# Set timestamp
TIMESTAMP=$(date +%F_%T)
BACKUP_DIR="/backup/$TIMESTAMP"


mkdir -p $BACKUP_DIR


mongodump --uri="mongodb://admin:password@mongo:27017/school?authSource=admin" --out $BACKUP_DIR

# Keep the latest 7 backups, delete old ones
find /backup -type d -mtime +7 -exec rm -rf {} \;

# log
echo "Backup completed: $BACKUP_DIR" >> /var/log/backup.log

