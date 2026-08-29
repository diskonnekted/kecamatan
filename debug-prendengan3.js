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
  const r = await fetchAll('https://prendengan-banjarmangu.sistemdata.id/');
  // Cari semua tag class unik di area list artikel
  const html = r.body;
  // Cari div/article/section dengan href ke /artikel/
  const articleAreas = [];
  const re = /<(div|article|section|li|a)[^>]*class="([^"]*)"[^>]*(?:href="[^"]*\/artikel\/[^"]*"|>\s*<a[^>]*href="[^"]*\/artikel\/)/gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    if (m[2]) articleAreas.push(m[2]);
  }
  console.log('Unique class names near article links:');
  const uniq = [...new Set(articleAreas)];
  uniq.forEach(c => console.log('  .' + c));
  // Cari dengan pendekatan "elemen yang membungkus banyak link artikel"
  const articleIdx = html.indexOf('/artikel/2021/3/25/sejarah-desa');
  if (articleIdx > 0) {
    console.log('\n--- Context (3000 chars around first article link) ---');
    console.log(html.substring(Math.max(0, articleIdx-1500), articleIdx+500));
  }
})();
