#!/bin/bash

echo "🧪 Testing Google Video Intelligence API with Real Credentials..."

# Check if credentials file exists
CREDS_FILE="/Users/heshi/Downloads/gen-lang-client-0604268080-0dd63fcfc0ab.json"
if [ ! -f "$CREDS_FILE" ]; then
    echo "❌ Credentials file not found at: $CREDS_FILE"
    exit 1
fi

echo "✅ Credentials file found"

# Create a small test video file (MP4 format)
echo "📹 Creating test video file..."
# Create a minimal MP4 file header (this won't be a real video but will pass file type checks)
printf '\x00\x00\x00\x20\x66\x74\x79\x70\x6d\x70\x34\x31' > /tmp/test-video.mp4
echo "fake video content for testing purposes" >> /tmp/test-video.mp4

# Test the API endpoint with curl
echo "📡 Testing API endpoint with Google Video Intelligence..."
echo "This will test the full pipeline: Upload -> Google Video Intelligence -> OpenAI Feedback"

curl -X POST \
  -F "video=@/tmp/test-video.mp4" \
  -F "userId=test-user-123" \
  -F "exerciseType=squat" \
  http://localhost:3000/api/video/analyze-gvi \
  -w "\n\nHTTP Status: %{http_code}\nTime: %{time_total}s\n" \
  | python3 -m json.tool 2>/dev/null || echo "Response received (not valid JSON or python not available)"

# Clean up
rm -f /tmp/test-video.mp4

echo "✅ Test completed!"
echo "💡 If you see analysis results with AI feedback, the integration is working!"
