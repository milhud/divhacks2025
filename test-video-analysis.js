// Simple test script to verify the video analysis API
const FormData = require('form-data');
const fs = require('fs');
const { default: fetch } = require('node-fetch');

async function testVideoAnalysis() {
  try {
    console.log('🧪 Testing Google Video Intelligence API endpoint...');
    
    // Test GET endpoint first
    const getResponse = await fetch('http://localhost:3000/api/video/analyze-gvi');
    const getResult = await getResponse.json();
    console.log('✅ GET endpoint working:', getResult);
    
    // Create a small test file (since we don't have a real video)
    const testContent = Buffer.from('fake video content for testing');
    fs.writeFileSync('/tmp/test-video.mp4', testContent);
    
    // Test POST endpoint with mock data
    const form = new FormData();
    form.append('video', fs.createReadStream('/tmp/test-video.mp4'), {
      filename: 'test-video.mp4',
      contentType: 'video/mp4'
    });
    form.append('userId', 'test-user-123');
    form.append('exerciseType', 'squat');
    
    console.log('🚀 Testing POST endpoint with mock video...');
    
    const postResponse = await fetch('http://localhost:3000/api/video/analyze-gvi', {
      method: 'POST',
      body: form,
      headers: form.getHeaders()
    });
    
    const postResult = await postResponse.json();
    
    if (postResponse.ok) {
      console.log('✅ POST endpoint working!');
      console.log('📊 Analysis result:', {
        exercise_type: postResult.analysis?.exercise_type,
        rep_count: postResult.analysis?.rep_count,
        form_score: postResult.analysis?.form_score,
        confidence: postResult.analysis?.confidence,
        has_feedback: !!postResult.analysis?.feedback
      });
    } else {
      console.log('⚠️  POST endpoint returned error (expected without Google Cloud setup):', postResult);
    }
    
    // Clean up
    fs.unlinkSync('/tmp/test-video.mp4');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testVideoAnalysis();
