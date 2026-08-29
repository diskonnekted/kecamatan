const fs = require('fs');
const https = require('https');
// Fetch ulang homepage HTTPS
https.get('https://prendengan-banjarmangu.sistemdata.id/', {
  headers: { 'User-Agent': 'Mozilla/5.0', 'Accept': 'text/html' }
}, (res) => {
  let data = '';
  res.on('data', c => data += c);
  res.on('end', () => {
    fs.writeFileSync('i:/kecamatan/portal-kecamatan/pren-https.html', data);
    // Cari semua link artikel
    const links = [...data.matchAll(/<a[^>]+href="(https?:\/\/[^"]*\/artikel\/[^"]+)"[^>]*>([^<]*)/g)];
    console.log('Total link artikel:', links.length);
    const uniq = new Map();
    links.forEach(m => {
      const url = m[1];
      const title = m[2].trim();
      if (!uniq.has(url)) uniq.set(url, title);
    });
    [...uniq.entries()].slice(0, 30).forEach(([url, title]) => {
      console.log(`  ${title.padEnd(50)} | ${url}`);
    });
  });
});
