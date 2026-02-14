#!/bin/bash
# ============================================================
# FoodyePay + AVOS — One-Command Deploy to Cloud Run
#
# 使用方法: 在 Google Cloud Shell 中运行
#   cd ~/FoodyePay && bash scripts/deploy-now.sh
# ============================================================

set -e

PROJECT_ID="foodyepay-prod"
REGION="us-east1"
SERVICE_NAME="foodyepay"

echo ""
echo "  ╔══════════════════════════════════════════╗"
echo "  ║   🚀 FoodyePay + AVOS Deploy            ║"
echo "  ║   AI Voice Ordering System               ║"
echo "  ║   Patent Pending | Built on Base L2      ║"
echo "  ╚══════════════════════════════════════════╝"
echo ""

# ---- Step 1: Set project ----
echo "⚙️  Setting project to ${PROJECT_ID}..."
gcloud config set project ${PROJECT_ID} --quiet
echo "   ✅ Done"
echo ""

# ---- Step 2: Enable APIs (only needed first time, safe to re-run) ----
echo "⚙️  Enabling GCP APIs..."
gcloud services enable \
  run.googleapis.com \
  cloudbuild.googleapis.com \
  artifactregistry.googleapis.com \
  speech.googleapis.com \
  texttospeech.googleapis.com \
  aiplatform.googleapis.com \
  dialogflow.googleapis.com \
  secretmanager.googleapis.com \
  --quiet 2>/dev/null || true
echo "   ✅ APIs enabled"
echo ""

# ---- Step 3: Deploy to Cloud Run (source-based) ----
echo "🔨 Building & deploying to Cloud Run..."
echo "   (This takes 3-5 minutes...)"
echo ""

gcloud run deploy ${SERVICE_NAME} \
  --source . \
  --region ${REGION} \
  --port 8080 \
  --memory 1Gi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 10 \
  --allow-unauthenticated \
  --set-env-vars "NODE_ENV=production,AVOS_DEFAULT_AI_ENGINE=google_gemini_2,AVOS_GOOGLE_CCAI_PROJECT_ID=${PROJECT_ID},AVOS_SMS_PAYMENT_LINK_EXPIRY_MINUTES=30" \
  --quiet

echo ""

# ---- Step 4: Get URL ----
SERVICE_URL=$(gcloud run services describe ${SERVICE_NAME} --region ${REGION} --format 'value(status.url)' 2>/dev/null)
echo "  ╔══════════════════════════════════════════╗"
echo "  ║   ✅ DEPLOY SUCCESS!                     ║"
echo "  ╚══════════════════════════════════════════╝"
echo ""
echo "  🌐 Live URL: ${SERVICE_URL}"
echo "  📱 Dashboard: ${SERVICE_URL}/dashboard-restaurant"
echo "  🤖 AVOS Test: ${SERVICE_URL}/api/avos/test-call"
echo ""
echo "  ┌─────────────────────────────────────────┐"
echo "  │  📌 NEXT STEPS:                          │"
echo "  │                                          │"
echo "  │  1. Run avos-schema.sql in Supabase      │"
echo "  │  2. Set secrets (see below)              │"
echo "  │  3. Open Dashboard → AVOS tab            │"
echo "  └─────────────────────────────────────────┘"
echo ""
echo "  To set existing env secrets:"
echo "  gcloud run services update ${SERVICE_NAME} --region ${REGION} \\"
echo "    --update-env-vars \"NEXT_PUBLIC_SUPABASE_URL=your_url,NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key,...\""
echo ""
