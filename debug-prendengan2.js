const https = require('https');
function fetchAll(url, timeoutMs = 25000) {
  return new Promise((resolve) => {
    const req = https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/rss+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      timeout: timeoutMs,
    }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve({ status: res.statusCode, length: data.length, body: data }));
    });
    req.on('error', (e) => resolve({ error: e.message }));
    req.on('timeout', () => { req.destroy(); resolve({ error: 'timeout' }); });
  });
}
(async () => {
  const r = await fetchAll('https://prendengan-banjarmangu.sistemdata.id/feed');
  console.log('Status:', r.status, 'Length:', r.length);
  console.log('---FULL---');
  console.log(r.body);
})();
