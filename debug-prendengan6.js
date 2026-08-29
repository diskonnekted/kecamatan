const https = require('https');
const fs = require('fs');
function fetchAll(url, timeoutMs = 25000) {
  return new Promise((resolve) => {
    const req = https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' }, timeout: timeoutMs }, (res) => {
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
  fs.writeFileSync('i:/kecamatan/portal-kecamatan/prendengan-full.html', html);
  // Cari semua link artikel dengan struktur lengkap
  const links = [...html.matchAll(/<a[^>]+href="(https?:\/\/prendengan[^"]*\/artikel\/[^"]+)"[^>]*>([^<]+)</g)];
  console.log('Total links:', links.length);
  // Tampilkan 10 unique dengan title
  const uniq = new Map();
  links.forEach(m => {
    if (!uniq.has(m[1])) uniq.set(m[1], m[2].trim());
  });
  [...uniq.entries()].slice(0, 20).forEach(([url, title]) => console.log('  ', title.padEnd(50), '|', url));
  // Cari juga 'artikel/' tanpa https prefix
  const links2 = [...html.matchAll(/href="\/artikel\/[^"]+"/g)];
  console.log('\n/article/ relative:', links2.length);
  links2.slice(0, 20).forEach(m => console.log('  ', m[0]));
})();
