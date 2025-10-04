# Google Cloud Video Intelligence Setup

This document explains how to set up Google Cloud Video Intelligence API for the Vibe Coach app.

## Prerequisites

1. **Google Cloud Project**: Create a project in [Google Cloud Console](https://console.cloud.google.com/)
2. **Enable APIs**: Enable the following APIs:
   - Video Intelligence API
   - Cloud Storage API

## Setup Steps

### 1. Create Service Account

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **IAM & Admin** > **Service Accounts**
3. Click **Create Service Account**
4. Name: `vibe-coach-video-ai`
5. Grant roles:
   - **Video Intelligence API User**
   - **Storage Admin** (for video uploads)

### 2. Generate Service Account Key

1. Click on the created service account
2. Go to **Keys** tab
3. Click **Add Key** > **Create New Key**
4. Choose **JSON** format
5. Download the key file

### 3. Create Cloud Storage Bucket

1. Go to **Cloud Storage** > **Buckets**
2. Click **Create Bucket**
3. Name: `vibe-coach-videos` (or your preferred name)
4. Choose region close to your users
5. Set access control to **Uniform**

### 4. Environment Variables

Add these to your `.env.local` file:

```bash
# Google Cloud Configuration
GOOGLE_CLOUD_PROJECT_ID=your-project-id
GOOGLE_APPLICATION_CREDENTIALS=path/to/your/service-account-key.json

# Optional: Custom bucket name
GOOGLE_CLOUD_STORAGE_BUCKET=vibe-coach-videos
```

### 5. Security Setup

For production deployment:

1. **Never commit** the service account key to version control
2. Use **Google Cloud Secret Manager** for key storage
3. Set up **IAM roles** with minimal required permissions
4. Enable **audit logging** for Video Intelligence API

## API Usage Limits

- **Free Tier**: 1,000 minutes per month
- **Pricing**: $0.10 per minute after free tier
- **Rate Limits**: 20 requests per minute per project

## Fallback Strategy

The app includes a fallback system:

1. **Primary**: Google Cloud Video Intelligence API
2. **Fallback**: Local pose analysis with mock data
3. **Error Handling**: Graceful degradation with user feedback

## Testing

To test the setup:

1. Upload a short workout video (< 1 minute)
2. Check the **Cloud AI** mode in the app
3. Verify video upload and analysis results
4. Check Google Cloud Console for API usage

## Troubleshooting

### Common Issues

1. **Authentication Error**
   - Verify service account key path
   - Check key file permissions
   - Ensure project ID is correct

2. **API Not Enabled**
   - Enable Video Intelligence API in Cloud Console
   - Enable Cloud Storage API

3. **Quota Exceeded**
   - Check API quotas in Cloud Console
   - Upgrade billing account if needed

4. **Storage Permissions**
   - Verify service account has Storage Admin role
   - Check bucket permissions

### Debug Mode

Enable debug logging:

```bash
# Add to .env.local
DEBUG_GOOGLE_CLOUD=true
```

## Cost Optimization

1. **Video Compression**: Compress videos before upload
2. **Batch Processing**: Process multiple videos together
3. **Caching**: Cache analysis results in Supabase
4. **Regional Deployment**: Use same region for storage and processing

## Alternative Solutions

If Google Cloud is not available:

1. **MediaPipe**: Client-side pose detection
2. **OpenPose**: Self-hosted pose estimation
3. **Azure Video Indexer**: Microsoft alternative
4. **AWS Rekognition**: Amazon alternative
