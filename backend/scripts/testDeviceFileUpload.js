const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_trading_key_2026_xyz';
const adminToken = jwt.sign({ id: 1, email: 'admin@tradingplatform.com' }, JWT_SECRET, { expiresIn: '1h' });

async function runUploadTest() {
  console.log('--- Testing Device File Upload API (Multipart) ---');

  const boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW';
  const fileName = 'test_sample_video.mp4';
  const fileContent = 'FAKE_VIDEO_BINARY_DATA_FOR_TESTING_PURPOSES';

  const payload = Buffer.concat([
    Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="${fileName}"\r\nContent-Type: video/mp4\r\n\r\n`),
    Buffer.from(fileContent),
    Buffer.from(`\r\n--${boundary}--\r\n`)
  ]);

  const http = require('http');

  const req = http.request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/admin/videos/upload-media',
    method: 'POST',
    headers: {
      'Content-Type': `multipart/form-data; boundary=${boundary}`,
      'Content-Length': payload.length,
      'Authorization': `Bearer ${adminToken}`
    }
  }, (res) => {
    let body = '';
    res.on('data', chunk => body += chunk);
    res.on('end', () => {
      console.log('Upload Response Status:', res.statusCode);
      console.log('Upload Response Data:', JSON.parse(body));
    });
  });

  req.on('error', (err) => {
    console.error('Upload Error:', err);
  });

  req.write(payload);
  req.end();
}


runUploadTest().catch(console.error);
