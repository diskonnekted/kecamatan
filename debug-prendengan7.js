const fs = require('fs');
const html = fs.readFileSync('i:/kecamatan/portal-kecamatan/prendengan-full.html', 'utf8');
// Cari di area 'data-desa' (artikel terakhir di list, paling baru)
const idx = html.indexOf('data-desa');
console.log('Local idx:', idx);
console.log('\nContext 3000 chars before & 500 after:');
const ctx = html.substring(Math.max(0, idx-3000), idx+500);
fs.writeFileSync('i:/kecamatan/portal-kecamatan/prendengan-body.txt', ctx);
console.log(ctx);
