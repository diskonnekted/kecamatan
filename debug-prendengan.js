const https = require('https');
const Database = require('better-sqlite3');
const db = new Database('.data/portal.db');
const d = db.prepare("SELECT website, feed_url FROM desa WHERE slug='prendengan'").get();
console.log('Prendengan:', JSON.stringify(d));

function fetchAll(url, timeoutMs = 25000) {
  return new Promise((resolve) => {
    const req = https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/rss+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      timeout: timeoutMs,
    }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, length: data.length, body: data }));
    });
    req.on('error', (e) => resolve({ error: e.message }));
    req.on('timeout', () => { req.destroy(); resolve({ error: 'timeout' }); });
  });
}

(async () => {
  const h = await fetchAll(d.website);
  console.log('Homepage status:', h.status, 'length:', h.length);
  if (h.body) {
    // Look for article links
    const links = (h.body.match(/href="[^"]*\/artikel\/[^"]+"/g) || []);
    console.log('Article links:', links.length);
    links.slice(0, 5).forEach(l => console.log('  ', l));
    // Look for class patterns
    const patterns = ['articlerow-box', 'artikelhome', 'metadate', 'metanext', 'class="post"', 'class="artikel"'];
    patterns.forEach(p => console.log(`Pattern "${p}": ${h.body.includes(p) ? 'YES' : 'no'}`));
  }
  const f = await fetchAll(d.feed_url);
  console.log('\nFeed status:', f.status, 'length:', f.length);
  if (f.body) {
    console.log('First 300 chars:', f.body.substring(0, 300));
  }
})();
