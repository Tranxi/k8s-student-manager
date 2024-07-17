#!/bin/bash

# Env variables
MONGO_HOST=mongo-course
MONGO_PORT=27018
MONGO_DB=courseDB
MONGO_USER=admin
MONGO_PASS=password
AUTH_DB=admin  # Authentication database

BACKUP_DIR=/backup

DATE=$(date +"%Y%m%d%H%M")

# create back up file
mongodump --host $MONGO_HOST --port $MONGO_PORT --db $MONGO_DB --username $MONGO_USER --password $MONGO_PASS --authenticationDatabase $AUTH_DB --out $BACKUP_DIR/$MONGO_DB-$DATE

# log 
if [ $? -eq 0 ]; then
  echo "Backup successful!"
else
  echo "Backup failed!"
  exit 1
fi