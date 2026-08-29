const fs = require('fs');
const html = fs.readFileSync('i:/kecamatan/portal-kecamatan/prendengan-context.txt', 'utf8');
// Cari snippet di sekitar kata 'sejarah-desa' yang sebenarnya adalah link
const idx = html.indexOf('sejarah-desa');
console.log('Local idx:', idx);
console.log('Context 200 chars before & 100 after:');
console.log(html.substring(Math.max(0, idx-200), idx+100));
