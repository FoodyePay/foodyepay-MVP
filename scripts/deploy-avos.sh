#!/bin/bash
# ============================================
# FoodyePay + AVOS Deployment Script
# Deploy to Google Cloud Run (foodyepay-prod)
# ============================================

set -e

PROJECT_ID="foodyepay-prod"
REGION="us-east1"
SERVICE_NAME="foodyepay"
IMAGE_NAME="gcr.io/${PROJECT_ID}/${SERVICE_NAME}"

echo "🚀 FoodyePay + AVOS Deployment"
echo "================================"
echo "Project:  ${PROJECT_ID}"
echo "Region:   ${REGION}"
echo "Service:  ${SERVICE_NAME}"
echo ""

# Step 1: Ensure gcloud is configured
echo "📋 Step 1: Verifying GCP configuration..."
gcloud config set project ${PROJECT_ID}
echo "✅ Project set to ${PROJECT_ID}"

# Step 2: Enable required APIs
echo ""
echo "📋 Step 2: Enabling required GCP APIs..."
gcloud services enable \
  run.googleapis.com \
  cloudbuild.googleapis.com \
  containerregistry.googleapis.com \
  speech.googleapis.com \
  texttospeech.googleapis.com \
  aiplatform.googleapis.com \
  dialogflow.googleapis.com \
  contactcenteraiplatform.googleapis.com \
  2>/dev/null || true
echo "✅ APIs enabled"

# Step 3: Build Docker image
echo ""
echo "📋 Step 3: Building Docker image..."
gcloud builds submit --tag ${IMAGE_NAME}:latest .
echo "✅ Image built and pushed to GCR"

# Step 4: Deploy to Cloud Run
echo ""
echo "📋 Step 4: Deploying to Cloud Run..."
gcloud run deploy ${SERVICE_NAME} \
  --image ${IMAGE_NAME}:latest \
  --region ${REGION} \
  --platform managed \
  --port 8080 \
  --memory 1Gi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 10 \
  --allow-unauthenticated \
  --set-env-vars "NODE_ENV=production"

echo ""
echo "✅ Deployment complete!"
echo ""

# Step 5: Get service URL
SERVICE_URL=$(gcloud run services describe ${SERVICE_NAME} --region ${REGION} --format 'value(status.url)')
echo "🌐 Service URL: ${SERVICE_URL}"
echo ""
echo "📌 Next Steps:"
echo "  1. Set secrets:  gcloud run services update ${SERVICE_NAME} --region ${REGION} --update-secrets=..."
echo "  2. Run SQL:       Execute scripts/avos-schema.sql in Supabase Dashboard"
echo "  3. Test AVOS:     curl -X POST ${SERVICE_URL}/api/avos/test-call"
echo "  4. Configure:     ${SERVICE_URL}/dashboard-restaurant → AVOS tab → Settings"
echo ""
echo "🎉 FoodyePay + AVOS is live!"
