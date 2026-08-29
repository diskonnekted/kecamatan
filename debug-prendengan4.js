const https = require('https');
function fetchAll(url, timeoutMs = 25000) {
  return new Promise((resolve) => {
    const req = https.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      timeout: timeoutMs,
    }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve(data));
    });
    req.on('error', () => resolve(null));
    req.on('timeout', () => { req.destroy(); resolve(null); });
  });
}
(async () => {
  const html = await fetchAll('https://prendengan-banjarmangu.sistemdata.id/');
  if (!html) { console.log('Fetch failed'); return; }
  console.log('Length:', html.length);
  // Cari index sejarah-desa
  const idx = html.indexOf('sejarah-desa');
  console.log('Idx sejarah-desa:', idx);
  if (idx > 0) {
    const ctx = html.substring(Math.max(0, idx - 2000), idx + 500);
    // Save to file
    require('fs').writeFileSync('i:/kecamatan/portal-kecamatan/prendengan-context.txt', ctx);
    console.log('Saved to prendengan-context.txt, length:', ctx.length);
    console.log('---SNIPPET---');
    console.log(ctx.substring(0, 1500));
  }
})();
