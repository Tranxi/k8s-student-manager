FROM mongo:4.4.6

# add script and log files
COPY backup-script.sh /usr/local/bin/backup-script.sh

RUN chmod +x /usr/local/bin/backup-script.sh

RUN touch /var/log/backup.log

# Perform backup immediately upon first startup, then execute it every hour.
CMD ["sh", "-c", "/usr/local/bin/backup-script.sh && while true; do sleep 3600; /usr/local/bin/backup-script.sh; done"]


