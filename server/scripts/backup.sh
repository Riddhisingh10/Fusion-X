#!/bin/bash
# =========================================================================
# CONNECT & PREP - AUTOMATED POSTGRES BACKUP & ENCRYPTION SCRIPT
# =========================================================================
set -e

# Load environment variables if .env exists
if [ -f "../../.env" ]; then
    export $(grep -v '^#' ../../.env | xargs)
elif [ -f "../.env" ]; then
    export $(grep -v '^#' ../.env | xargs)
fi

# Assert critical configurations are present
if [ -z "$DATABASE_URL" ]; then
    echo "[Error] DATABASE_URL is not set."
    exit 1
fi
if [ -z "$BACKUP_PASSPHRASE" ]; then
    echo "[Error] BACKUP_PASSPHRASE is not set. Symmetric encryption passphrase required."
    exit 1
fi
if [ -z "$BACKUP_BUCKET_NAME" ]; then
    echo "[Error] BACKUP_BUCKET_NAME is not set."
    exit 1
fi

BACKUP_DIR="./backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
RAW_SQL_FILE="${BACKUP_DIR}/db_backup_${TIMESTAMP}.sql"
ENCRYPTED_TAR="${BACKUP_DIR}/db_backup_${TIMESTAMP}.tar.gz.enc"

# Ensure local backup directory exists
mkdir -p "${BACKUP_DIR}"

echo "[1/4] Initiating database dump from Supabase..."
# Perform pg_dump using the secure connection string
pg_dump "${DATABASE_URL}" -F p -f "${RAW_SQL_FILE}"

echo "[2/4] Compressing and encrypting backup via AES-256-CBC (salted)..."
# Compress the raw SQL file and pipe it directly to OpenSSL for strong encryption
tar -czf - -C "${BACKUP_DIR}" "db_backup_${TIMESTAMP}.sql" | \
openssl enc -aes-256-cbc -salt -pbkdf2 -out "${ENCRYPTED_TAR}" -k "${BACKUP_PASSPHRASE}"

# Securely clear the unencrypted SQL file from local disk
rm -f "${RAW_SQL_FILE}"

echo "[3/4] Uploading encrypted backup archive to cloud storage bucket..."
# Upload to R2 / AWS S3 using aws-cli
aws s3 cp "${ENCRYPTED_TAR}" "s3://${BACKUP_BUCKET_NAME}/db_backup_${TIMESTAMP}.tar.gz.enc" --region "${AWS_REGION:-us-east-1}"

# Cleanup the local encrypted archive
rm -f "${ENCRYPTED_TAR}"

echo "[4/4] Automated database backup completed successfully."
