import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'SIDATEKA BANJARMANGU',
    short_name: 'SIDATEKA',
    description:
      'Sistim Informasi Desa Terintegrasi Kecamatan Banjarmangu — portal berita, statistik, dan informasi 17 desa.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#EFF6FF',
    theme_color: '#1E40AF',
    lang: 'id',
    categories: ['news', 'government'],
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
