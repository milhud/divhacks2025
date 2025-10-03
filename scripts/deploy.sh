#!/bin/bash

# Vibe Coach Backend Deployment Script
# This script deploys the backend to Google Cloud Platform

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Starting Vibe Coach Backend Deployment${NC}"

# Check if required environment variables are set
if [ -z "$GOOGLE_CLOUD_PROJECT_ID" ]; then
    echo -e "${RED}❌ Error: GOOGLE_CLOUD_PROJECT_ID environment variable is not set${NC}"
    echo "Please set it with: export GOOGLE_CLOUD_PROJECT_ID=your-project-id"
    exit 1
fi

if [ -z "$GOOGLE_APPLICATION_CREDENTIALS" ]; then
    echo -e "${RED}❌ Error: GOOGLE_APPLICATION_CREDENTIALS environment variable is not set${NC}"
    echo "Please set it with: export GOOGLE_APPLICATION_CREDENTIALS=path/to/service-account-key.json"
    exit 1
fi

echo -e "${YELLOW}📋 Project ID: $GOOGLE_CLOUD_PROJECT_ID${NC}"

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo -e "${RED}❌ Error: gcloud CLI is not installed${NC}"
    echo "Please install it from: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Check if user is authenticated
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q .; then
    echo -e "${YELLOW}🔐 Authenticating with Google Cloud...${NC}"
    gcloud auth login
fi

# Set the project
echo -e "${YELLOW}🔧 Setting project to $GOOGLE_CLOUD_PROJECT_ID${NC}"
gcloud config set project $GOOGLE_CLOUD_PROJECT_ID

# Enable required APIs
echo -e "${YELLOW}🔌 Enabling required APIs...${NC}"
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com

# Build the application
echo -e "${YELLOW}🔨 Building the application...${NC}"
npm run build

# Build and push Docker image
echo -e "${YELLOW}🐳 Building and pushing Docker image...${NC}"
docker build -t gcr.io/$GOOGLE_CLOUD_PROJECT_ID/vibe-coach-backend:latest .
docker push gcr.io/$GOOGLE_CLOUD_PROJECT_ID/vibe-coach-backend:latest

# Deploy to Cloud Run
echo -e "${YELLOW}🚀 Deploying to Cloud Run...${NC}"
gcloud run deploy vibe-coach-backend \
  --image gcr.io/$GOOGLE_CLOUD_PROJECT_ID/vibe-coach-backend:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --memory 2Gi \
  --cpu 2 \
  --max-instances 10 \
  --set-env-vars NODE_ENV=production

# Get the service URL
SERVICE_URL=$(gcloud run services describe vibe-coach-backend --platform managed --region us-central1 --format 'value(status.url)')

echo -e "${GREEN}✅ Deployment completed successfully!${NC}"
echo -e "${GREEN}🌐 Service URL: $SERVICE_URL${NC}"
echo -e "${YELLOW}📝 Don't forget to set your environment variables in the Cloud Run console${NC}"
echo -e "${YELLOW}   Go to: https://console.cloud.google.com/run/detail/us-central1/vibe-coach-backend${NC}"

# Test the deployment
echo -e "${YELLOW}🧪 Testing the deployment...${NC}"
if curl -f -s "$SERVICE_URL/api/health" > /dev/null; then
    echo -e "${GREEN}✅ Health check passed!${NC}"
else
    echo -e "${YELLOW}⚠️  Health check failed, but deployment might still be starting up${NC}"
fi

echo -e "${GREEN}🎉 Deployment script completed!${NC}"
