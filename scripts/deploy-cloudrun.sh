#!/usr/bin/env bash
set -e

# Ensure gcloud uses Python 3.10+
if [ -f "/Users/joseluiszabala/.local/share/uv/python/cpython-3.10.17-macos-aarch64-none/bin/python3.10" ]; then
  export CLOUDSDK_PYTHON="/Users/joseluiszabala/.local/share/uv/python/cpython-3.10.17-macos-aarch64-none/bin/python3.10"
fi

# Deploy Next.js Standalone Container directly to Google Cloud Run
PROJECT_ID="med-peptides-app"
REGION="us-central1"
SERVICE_NAME="ssrmedpeptidesapp27a3a"
IMAGE_TAG="gcr.io/${PROJECT_ID}/${SERVICE_NAME}:latest"

echo "🚀 [Cloud Run Standalone] Building and deploying standalone container..."

# 1. Compile with Turbopack (fast Rust compilation)
npm run build

# 2. Stage ONLY minimal runtime artifacts (excludes heavy static media served by Firebase Hosting CDN)
STAGE_DIR=$(mktemp -d /tmp/cloudrun-ctx-XXXXXX)
cleanup() {
  rm -rf "${STAGE_DIR}"
}
trap cleanup EXIT

cp Dockerfile "${STAGE_DIR}/Dockerfile"
mkdir -p "${STAGE_DIR}/.next"
cp -R .next/standalone "${STAGE_DIR}/.next/standalone"
rm -rf "${STAGE_DIR}/.next/standalone/public"
cp -R .next/static "${STAGE_DIR}/.next/static"
mkdir -p "${STAGE_DIR}/public"
rsync -a \
  --exclude='videos/' \
  --exclude='reports/' \
  --exclude='images/' \
  --exclude='labels/' \
  --exclude='docs/' \
  --exclude='assets/' \
  --exclude='documents/' \
  --exclude='prescriptions/' \
  --exclude='eterna/' \
  --exclude='test-screenshots/' \
  public/ "${STAGE_DIR}/public/"

echo "📦 [Cloud Run Standalone] Staging context size: $(du -sh "${STAGE_DIR}" | cut -f1)"
echo "📦 [Cloud Run Standalone] Submitting slim build to Google Cloud Build..."
gcloud builds submit --quiet --project="${PROJECT_ID}" --tag="${IMAGE_TAG}" "${STAGE_DIR}"

# 3. Deploy new revision to Cloud Run
echo "⚡ [Cloud Run Standalone] Deploying revision to Cloud Run..."
gcloud run deploy "${SERVICE_NAME}" \
  --quiet \
  --project="${PROJECT_ID}" \
  --region="${REGION}" \
  --image="${IMAGE_TAG}" \
  --platform="managed" \
  --allow-unauthenticated

echo "✅ [Cloud Run Standalone] Deployment completed successfully!"
