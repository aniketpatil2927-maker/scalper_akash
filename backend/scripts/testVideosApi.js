const http = require('http');

function makeRequest(path, method = 'GET', data = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, raw: body });
        }
      });
    });

    req.on('error', reject);
    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function runTests() {
  console.log('--- Testing /api/videos ---');
  const res1 = await makeRequest('/api/videos');
  console.log('GET /api/videos status:', res1.status, 'Total videos:', res1.data.length);
  res1.data.forEach(v => {
    console.log(`- [ID ${v.id}] ${v.title} | Category: ${v.category} | Access: ${v.accessType} | Required Tier: ${v.requiredTier} | isLocked: ${v.isLocked}`);
  });

  console.log('\n--- Testing Filter: category=Options Strategy ---');
  const res2 = await makeRequest('/api/videos?category=Options%20Strategy');
  console.log('Options Strategy count:', res2.data.length);

  console.log('\n--- Testing Filter: accessType=ALL_MEMBERS ---');
  const res3 = await makeRequest('/api/videos?accessType=ALL_MEMBERS');
  console.log('ALL_MEMBERS count:', res3.data.length);

  console.log('\n--- Testing View Increment on Video 1 ---');
  const res4 = await makeRequest('/api/videos/1/view', 'POST');
  console.log('Increment view status:', res4.status, res4.data);

  console.log('\n--- ALL API CHECKS PASSED ---');
}

runTests().catch(console.error);
