#!/bin/bash
# ============================================
# AVOS Secret Manager Configuration
# Sets up all secrets in Google Cloud Secret Manager
# and binds them to the Cloud Run service
# ============================================

set -e

PROJECT_ID="foodyepay-prod"
REGION="us-east1"
SERVICE_NAME="foodyepay"

echo "🔐 AVOS Secret Manager Setup"
echo "================================"

# Helper function to create or update a secret
create_secret() {
  local SECRET_NAME=$1
  local SECRET_VALUE=$2

  if gcloud secrets describe ${SECRET_NAME} --project=${PROJECT_ID} &>/dev/null; then
    echo "${SECRET_VALUE}" | gcloud secrets versions add ${SECRET_NAME} --data-file=- --project=${PROJECT_ID}
    echo "  ✅ Updated: ${SECRET_NAME}"
  else
    echo "${SECRET_VALUE}" | gcloud secrets create ${SECRET_NAME} --data-file=- --replication-policy="automatic" --project=${PROJECT_ID}
    echo "  ✅ Created: ${SECRET_NAME}"
  fi
}

echo ""
echo "📋 Creating AVOS secrets in Secret Manager..."
echo "(You'll be prompted to enter values)"
echo ""

# AVOS Webhook Secret
read -p "AVOS Webhook Secret (generate with: openssl rand -hex 32): " WEBHOOK_SECRET
create_secret "AVOS_WEBHOOK_SECRET" "${WEBHOOK_SECRET}"

# Google CCAI Agent ID
read -p "Google CCAI Agent ID: " CCAI_AGENT
create_secret "AVOS_GOOGLE_CCAI_AGENT_ID" "${CCAI_AGENT}"

# AWS credentials (for Nova Sonic hackathon demos)
read -p "AWS Access Key ID (optional, for Nova Sonic): " AWS_KEY
if [ -n "$AWS_KEY" ]; then
  create_secret "AWS_ACCESS_KEY_ID" "${AWS_KEY}"
  read -p "AWS Secret Access Key: " AWS_SECRET
  create_secret "AWS_SECRET_ACCESS_KEY" "${AWS_SECRET}"
fi

echo ""
echo "📋 Binding secrets to Cloud Run service..."

# Build the secrets flag
SECRETS_FLAG="AVOS_WEBHOOK_SECRET=AVOS_WEBHOOK_SECRET:latest"
SECRETS_FLAG="${SECRETS_FLAG},AVOS_GOOGLE_CCAI_AGENT_ID=AVOS_GOOGLE_CCAI_AGENT_ID:latest"

if [ -n "$AWS_KEY" ]; then
  SECRETS_FLAG="${SECRETS_FLAG},AWS_ACCESS_KEY_ID=AWS_ACCESS_KEY_ID:latest"
  SECRETS_FLAG="${SECRETS_FLAG},AWS_SECRET_ACCESS_KEY=AWS_SECRET_ACCESS_KEY:latest"
fi

gcloud run services update ${SERVICE_NAME} \
  --region ${REGION} \
  --update-secrets="${SECRETS_FLAG}" \
  --update-env-vars="AVOS_GOOGLE_CCAI_PROJECT_ID=${PROJECT_ID},AVOS_DEFAULT_AI_ENGINE=google_gemini_2,AVOS_SMS_PAYMENT_LINK_EXPIRY_MINUTES=30"

echo ""
echo "✅ All AVOS secrets configured!"
echo ""
echo "📌 Verify with:"
echo "  gcloud run services describe ${SERVICE_NAME} --region ${REGION} --format yaml"
