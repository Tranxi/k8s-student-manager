FROM mongo:4.4.6

# Add backup script & assign permissions
COPY backup.sh /usr/local/bin/backup.sh
RUN chmod +x /usr/local/bin/backup.sh

# default command
CMD ["/usr/local/bin/backup.sh"]

