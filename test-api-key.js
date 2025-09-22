// test-api-key.js - Google Maps API Key 测试脚本
const https = require('https');

const API_KEY = process.env.GOOGLE_MAPS_API_KEY;
if (!API_KEY) {
  console.error('Missing GOOGLE_MAPS_API_KEY in environment. Set it before running this script.');
  process.exit(1);
}

// 测试 Places API
function testPlacesAPI() {
  const testUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=restaurant&key=${API_KEY}`;
  
  console.log('🔍 Testing Google Places API...');
  console.log('🔑 API Key:', API_KEY.substring(0, 10) + '...');
  console.log('🌐 Test URL:', testUrl);
  
  https.get(testUrl, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const response = JSON.parse(data);
        console.log('\n📊 API Response:');
        console.log('Status:', response.status);
        
        if (response.status === 'OK') {
          console.log('✅ Places API is working!');
          console.log('📍 Found', response.results?.length || 0, 'results');
        } else {
          console.log('❌ API Error:', response.status);
          if (response.error_message) {
            console.log('💬 Error Message:', response.error_message);
          }
        }
        
        // Show detailed response for debugging
        console.log('\n🛠️ Full Response:');
        console.log(JSON.stringify(response, null, 2));
        
      } catch (error) {
        console.error('❌ JSON Parse Error:', error);
        console.log('Raw response:', data);
      }
    });
  }).on('error', (error) => {
    console.error('❌ Request Error:', error);
  });
}

// 测试 Geocoding API (作为备选)
function testGeocodingAPI() {
  const testUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=New+York&key=${API_KEY}`;
  
  console.log('\n🗺️ Testing Google Geocoding API...');
  
  https.get(testUrl, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const response = JSON.parse(data);
        console.log('Geocoding Status:', response.status);
        
        if (response.status === 'OK') {
          console.log('✅ Geocoding API is working!');
        } else {
          console.log('❌ Geocoding Error:', response.status);
          if (response.error_message) {
            console.log('💬 Error Message:', response.error_message);
          }
        }
      } catch (error) {
        console.error('❌ JSON Parse Error:', error);
      }
    });
  }).on('error', (error) => {
    console.error('❌ Request Error:', error);
  });
}

console.log('🚀 Starting Google Maps API Tests...\n');
testPlacesAPI();

setTimeout(() => {
  testGeocodingAPI();
}, 2000);
