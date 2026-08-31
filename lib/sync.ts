import Parser from 'rss-parser';
import * as cheerio from 'cheerio';
import { db, type Desa, type Artikel } from './db';

const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
  '(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 ' +
  '(PortalKecamatanBanjarmangu/1.0)';

const FETCH_TIMEOUT = 60_000; // 60 detik (default)
const RSS_TIMEOUT = 120_000; // 120 detik
const MAX_RESPONSE_BYTES = 200 * 1024 * 1024; // 200MB hard cap

// Batas artikel terbaru yang diambil per desa per sync. Dipilih 20 berdasarkan
// uji streaming ke feed Sijenggung (~90MB): 20 item pertama hanya ±2 MB / ±2,5
// detik, sedangkan 50 item sudah ±86 MB (konten per-artikel sangat besar).
const MAX_ARTIKEL_PER_DESA = 20;
// Cap keras saat streaming feed RSS (jaga-jaga jika 20 item tidak kunjung
// tercapai karena feed berisi sedikit <item> tapi ukurannya raksasa).
const RSS_STREAM_MAX_BYTES = 150 * 1024 * 1024;

// Daftar User-Agent untuk rotasi (kadang Cloudflare membedakan tantangan berdasarkan UA)
const UAS = [
  USER_AGENT,
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
];

type SyncResult = {
  status: 'ok' | 'partial' | 'failed';
  message: string;
  newCount: number;
  updatedCount: number;
  durationMs: number;
  source: 'rss' | 'scrape' | 'opensid-api' | 'mixed';
};

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 200);
}

function absolutizeUrl(href: string, base: string): string {
  try {
    return new URL(href, base).toString();
  } catch {
    return href;
  }
}

function extractImage(content: string | undefined, base: string): string | null {
  if (!content) return null;
  const $ = cheerio.load(content);
  const img = $('img').first();
  const src = img.attr('src');
  return src ? absolutizeUrl(src, base) : null;
}

function stripHtml(html: string): string {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// URL yang menunjuk ke file media/upload — bukan halaman artikel.
// Contoh kasus: tema OpenSID Sijenggung membungkus gambar beranda dengan
// <a data-fancybox href=".../desa/upload/artikel/sedang_xxx.webp">, dan path
// "/desa/upload/artikel/" ikut cocok dengan selector a[href*="/artikel/"].
const MEDIA_URL_RE = /\.(webp|jpe?g|png|gif|svg|mp4|pdf)(\?.*)?$/i;

function isMediaUrl(href: string): boolean {
  return MEDIA_URL_RE.test(href) || /\/upload\//i.test(href);
}

async function fetchText(url: string, timeoutMs = FETCH_TIMEOUT): Promise<string> {
  const maxAttempts = 3;
  let lastErr: Error | null = null;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    const ua = UAS[(attempt - 1) % UAS.length];
    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent': ua,
          Accept: 'text/html,application/rss+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'id,en;q=0.9',
          'Accept-Encoding': 'gzip, deflate, br',
          // Beberapa tema OpenSID mengirim ETag/If-Modified-Since — kita tidak, biarkan 200
          'Cache-Control': 'no-cache',
        },
        signal: controller.signal,
      });
      if (!res.ok) {
        const text = await res.text().catch(() => '');
        const snippet = text.slice(0, 200).replace(/\s+/g, ' ');
        // Retry hanya untuk 403/408/429/503/504 (Cloudflare/challenge)
        if ([403, 408, 429, 502, 503, 504].includes(res.status) && attempt < maxAttempts) {
          // Jeda acak 2-5 detik untuk menghindari rate limit
          const delay = 2000 + Math.floor(Math.random() * 3000);
          await new Promise((r) => setTimeout(r, delay));
          continue;
        }
        throw new Error(`HTTP ${res.status} ${res.statusText}${snippet ? ` (${snippet})` : ''}`);
      }
      // Cap response size to prevent OOM
      const contentLength = Number(res.headers.get('content-length') ?? 0);
      if (contentLength > MAX_RESPONSE_BYTES) {
        throw new Error(`response too large (${(contentLength / 1024 / 1024).toFixed(1)} MB)`);
      }
      const text = await res.text();
      if (text.length > MAX_RESPONSE_BYTES) {
        throw new Error(`response too large (${(text.length / 1024 / 1024).toFixed(1)} MB)`);
      }
      return text;
    } catch (e) {
      lastErr = e as Error;
      // AbortError atau network error → retry kalau masih ada kesempatan
      if (attempt < maxAttempts && (e as Error).name !== 'AbortError') {
        const delay = 2000 + Math.floor(Math.random() * 3000);
        await new Promise((r) => setTimeout(r, delay));
        continue;
      }
      throw e;
    } finally {
      clearTimeout(timer);
    }
  }
  throw lastErr ?? new Error('fetch failed after retries');
}

/* ====================== RSS ====================== */

// Download feed RSS sebagai stream dan BERHENTI setelah MAX_ARTIKEL_PER_DESA
// item, lalu rekonstruksi XML valid (preamble + item-item + penutup) supaya
// tetap bisa diparse rss-parser seperti biasa. Ini menyelesaikan feed raksasa
// seperti Sijenggung (~90MB) yang sebelumnya selalu gagal diparse utuh
// ("Maximum call stack size exceeded") — kini cukup ±2 MB untuk 20 item.
// Potong XML feed tepat setelah </item> ke-N dan tutup manual, sehingga hasilnya
// tetap XML valid untuk rss-parser. Mengembalikan '' jika tidak ada item lengkap.
function cutRssXml(buf: string): string {
  const itemOpen = buf.search(/<item[\s>]/);
  if (itemOpen === -1) return '';
  let pos = -1;
  for (let i = 0; i < MAX_ARTIKEL_PER_DESA; i++) {
    const next = buf.indexOf('</item>', pos + 1);
    if (next === -1) break;
    pos = next;
  }
  if (pos === -1) return '';
  const preamble = buf.slice(0, itemOpen); // <?xml...><rss...><channel>...
  const itemsXml = buf.slice(itemOpen, pos + '</item>'.length);
  return preamble + itemsXml + '\n</channel></rss>';
}

async function fetchRssXml(url: string, timeoutMs: number): Promise<string> {
  const maxAttempts = 3;
  let lastErr: Error | null = null;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    const ua = UAS[(attempt - 1) % UAS.length];
    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent': ua,
          Accept: 'application/rss+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'id,en;q=0.9',
          'Accept-Encoding': 'gzip, deflate, br',
          'Cache-Control': 'no-cache',
        },
        signal: controller.signal,
      });
      if (!res.ok || !res.body) {
        // Retry hanya untuk 403/408/429/5xx (Cloudflare/challenge)
        if ([403, 408, 429, 502, 503, 504].includes(res.status) && attempt < maxAttempts) {
          await new Promise((r) => setTimeout(r, 2000 + Math.floor(Math.random() * 3000)));
          continue;
        }
        throw new Error(`HTTP ${res.status} ${res.statusText}`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buf = '';
      let bytes = 0;
      let streamErr: Error | null = null;
      try {
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          bytes += value.length;
          buf += decoder.decode(value, { stream: true });
          const itemCount = (buf.match(/<\/item>/g) ?? []).length;
          if (itemCount >= MAX_ARTIKEL_PER_DESA || bytes > RSS_STREAM_MAX_BYTES) break;
        }
      } catch (e) {
        // Stream putus/timeout di tengah (mis. server desa intermiten lambat) —
        // selamatkan item yang sudah terdownload lengkap daripada gagal total.
        streamErr = e as Error;
      }
      await reader.cancel().catch(() => {});

      // Feed kecil yang terdownload lengkap: parse apa adanya.
      if (!streamErr && buf.includes('</rss>')) return buf;
      const xml = cutRssXml(buf);
      if (xml) return xml;
      throw streamErr ?? new Error('feed tidak memuat item lengkap');
    } catch (e) {
      lastErr = e as Error;
      if (attempt < maxAttempts && (e as Error).name !== 'AbortError') {
        await new Promise((r) => setTimeout(r, 2000 + Math.floor(Math.random() * 3000)));
        continue;
      }
      throw e;
    } finally {
      clearTimeout(timer);
    }
  }
  throw lastErr ?? new Error('fetch rss failed after retries');
}

async function fetchRss(desa: Desa): Promise<Artikel[]> {
  if (!desa.feed_url) return [];
  const parser = new Parser({ timeout: RSS_TIMEOUT, customFields: {} });
  const xml = await fetchRssXml(desa.feed_url, RSS_TIMEOUT);
  const feed = await parser.parseString(xml);
  const items: Artikel[] = [];
  for (const it of feed.items ?? []) {
    const judul = (it.title || '').trim();
    const url = (it.link || '').trim();
    if (!judul || !url) continue;
    const slug = slugify(judul) || slugify(url);
    const ringkasan =
      it.contentSnippet?.trim() ||
      stripHtml(it.content || '').slice(0, 280) ||
      null;
    const gambar = extractImage(it.content, desa.website) || null;
    const publishedAt = it.isoDate || it.pubDate || null;
    items.push({
      id: 0,
      desa_id: desa.id,
      external_id: it.guid || url,
      judul,
      slug,
      url,
      ringkasan,
      konten: it.content || null,
      gambar,
      penulis: it.creator || it.author || null,
      kategori: it.categories?.[0] || null,
      published_at: publishedAt,
      view_count: 0,
      source: 'rss',
      fetched_at: new Date().toISOString(),
    });
  }
  return items;
}

/* ====================== HTML SCRAPER ====================== */

type ScrapeTarget = {
  // Selector untuk container tiap item artikel di beranda
  itemSelector: string;
  // Selector untuk judul di dalam container
  titleSelector: string;
  // Selector untuk link di dalam container
  linkSelector: string;
  // Selector untuk gambar di dalam container
  imageSelector: string;
  // Selector untuk elemen tanggal
  dateSelector: string;
  // Selector untuk penulis
  authorSelector: string;
  // Selector untuk ringkasan/excerpt
  excerptSelector: string;
};

// Selector untuk tema default OpenSID (bukan desa.id theme) — diverifikasi dari
// https://sijenggung-banjarnegara.desa.id/ yang merupakan OpenSID asli.
// Struktur: .articlerow-box > .artikelhome-image + .artikelhome-text > h3 (judul)
const OPENSID_DEFAULT_SCRAPE_TARGET: ScrapeTarget = {
  itemSelector: '.articlerow-box, .artikelhome, article, .artikel, .entry, .post',
  titleSelector: 'h3 a, h3, h2 a, h2, .entry-title a, .entry-title',
  linkSelector: 'h3 a, h2 a, a[href*="/artikel/"]',
  imageSelector: '.artikelhome-image img, .entry-thumbnail img, img',
  dateSelector: '.metadate, .metanext, time, .entry-date, .post-date, .tanggal, .date',
  authorSelector: '.fa-user, .artikelhome-info p, .entry-author, .post-author',
  excerptSelector: '.artikelhome-text p, .entry-summary, .post-excerpt',
};

// Selector untuk tema OpenDesa (sistemdata.id) — Tailwind-based, tanpa class OpenSID.
// Diverifikasi dari https://prendengan-banjarmangu.sistemdata.id/
// Struktur: .bg-white.shadow > figure (img) + .space-y-3 > a[href*="/artikel/"] (judul)
// + p.line-clamp-4 (excerpt) + ul > li dengan icon fa-calendar-alt (tanggal Indo)
// + li dengan icon fa-user (author)
const OPENDESA_TAILWIND_SCRAPE_TARGET: ScrapeTarget = {
  itemSelector: '.bg-white.shadow, [class*="shadow rounded"], article',
  titleSelector: 'a[href*="/artikel/"]',
  linkSelector: 'a[href*="/artikel/"]',
  imageSelector: 'figure img, img[src*="/artikel/"], img[src*="/desa/upload/"]',
  dateSelector: 'li:has(i.fa-calendar-alt), .date, time',
  authorSelector: 'li:has(i.fa-user), .author',
  excerptSelector: 'p.line-clamp-4, p',
};

// Daftar target scrape — dicoba satu per satu sampai dapat item
const SCRAPE_TARGETS: ScrapeTarget[] = [
  OPENSID_DEFAULT_SCRAPE_TARGET,
  OPENDESA_TAILWIND_SCRAPE_TARGET,
];

async function fetchScrape(desa: Desa): Promise<Artikel[]> {
  const html = await fetchText(desa.website);
  const $ = cheerio.load(html);
  const items: Artikel[] = [];
  // Coba setiap target scrape sampai ada yang mengembalikan ≥1 item.
  // Kita pilih target terbaik berdasarkan item count, lalu loop dengan target itu.
  let bestItems: Artikel[] = [];
  let bestTarget: ScrapeTarget | null = null;
  for (const target of SCRAPE_TARGETS) {
    const candidate: Artikel[] = [];
    $(target.itemSelector).each((_i, el) => {
    const $el = $(el);

    // Lewati container pembungkus yang di dalamnya masih ada item artikel
    // lain (mis. <div class="artikelhome"> membungkus banyak .articlerow-box
    // — judulnya cuma heading section seperti "Artikel").
    if ($el.find(target.itemSelector).length > 0) return;

    // Cari judul
    const $titleEl = $el.find(target.titleSelector).first();
    let judul = $titleEl.text().trim();
    // Untuk target Tailwind, judul di element <a> langsung
    if (!judul && $titleEl.is('a')) judul = $titleEl.attr('title') || '';
    if (!judul) return;

    // Cari link — kumpulkan semua kandidat, ambil yang pertama BUKAN file media.
    // (Tema OpenSID Sijenggung punya <a> fancybox ke file .webp sebelum link judul.)
    const linkCandidates: string[] = [];
    $el.find(target.linkSelector).each((_j, a) => {
      const h = $(a).attr('href');
      if (h) linkCandidates.push(h);
    });
    const tParent = $titleEl.parent('a').attr('href');
    if (tParent) linkCandidates.push(tParent);
    const tSelf = $titleEl.attr('href');
    if (tSelf) linkCandidates.push(tSelf);
    if ($el.is('a')) {
      const selfHref = $el.attr('href');
      if (selfHref) linkCandidates.push(selfHref);
    }
    const href =
      linkCandidates.find((h) => !isMediaUrl(h)) ??
      linkCandidates[0] ??
      '';
    if (!href) return;

    const absUrl = absolutizeUrl(href, desa.website);
    // Buang item yang link-nya tetap file media (bukan halaman artikel)
    if (isMediaUrl(absUrl)) return;

    // Gambar
    const $img = $el.find(target.imageSelector).first();
    let gambar: string | null = null;
    const imgSrc = $img.attr('src') || $img.attr('data-src') || $img.attr('data-lazy-src');
    if (imgSrc) gambar = absolutizeUrl(imgSrc, desa.website);

    // Tanggal: coba parse beberapa format
    let publishedAt: string | null = null;
    // Cek apakah ada struktur split .metadate (hari) + .metanext (bulan tahun) ala OpenSID
    const $metadate = $el.find('.metadate').first();
    const $metanext = $el.find('.metanext').first();
    let dateText: string | null = null;
    if ($metadate.length && $metanext.length) {
      dateText = `${$metadate.text().trim()} ${$metanext.text().trim()}`.replace(/\s+/g, ' ').trim();
    } else {
      const $dateEl = $el.find(target.dateSelector).first();
      dateText = $dateEl.attr('datetime') || $dateEl.text().trim();
    }
    if (dateText) {
      const cleaned = dateText.replace(/\s+/g, ' ').trim();
      const parsed = new Date(cleaned);
      if (!isNaN(parsed.getTime())) {
        publishedAt = parsed.toISOString();
      } else {
        // Coba parse "DD Month YYYY" / "DD Month YY" manual
        const months: Record<string, number> = {
          januari: 0, februari: 1, maret: 2, april: 3, mei: 4, juni: 5,
          juli: 6, agustus: 7, september: 8, oktober: 9, november: 10, desember: 11,
          jan: 0, feb: 1, mar: 2, apr: 3, jun: 5, jul: 6, agu: 7, sep: 8, okt: 9, nov: 10, des: 11,
        };
        const m = cleaned.match(/(\d{1,2})\s+([a-z]+)\s+(\d{2,4})/i);
        if (m) {
          const day = parseInt(m[1], 10);
          const mon = months[m[2].toLowerCase()];
          let year = parseInt(m[3], 10);
          if (year < 100) year += 2000;
          if (mon !== undefined) {
            const d = new Date(Date.UTC(year, mon, day));
            if (!isNaN(d.getTime())) publishedAt = d.toISOString();
          }
        }
      }
    }

    // Penulis
    const $authorEl = $el.find(target.authorSelector).first();
    let penulis: string | null = null;
    if ($authorEl.length) {
      const authorText = $authorEl.text().replace(/^.*?by\s*/i, '').trim();
      if (authorText) penulis = authorText;
    }

    // Ringkasan: ambil paragraf pertama yang bukan info meta
    // (tema Sijenggung tidak punya excerpt — <p> di dalamnya hanya berisi
    // "Admin : X", "157 Kali dibuka", "Buka Halaman").
    let ringkasan: string | null = null;
    $el.find(target.excerptSelector).each((_j, p) => {
      if (ringkasan) return;
      const $p = $(p);
      if ($p.closest('.artikelmeta, .artikelhome-info, .metadate, .metanext').length) return;
      const t = $p.text().replace(/\s+/g, ' ').trim();
      if (t.length < 40) return;
      ringkasan = t.slice(0, 320);
    });

    candidate.push({
      id: 0,
      desa_id: desa.id,
      external_id: null,
      judul,
      slug: slugify(judul) || slugify(absUrl),
      url: absUrl,
      ringkasan,
      konten: null,
      gambar,
      penulis,
      kategori: null,
      published_at: publishedAt,
      view_count: 0,
      source: 'scrape',
      fetched_at: new Date().toISOString(),
    });
  });
    // Simpan target dengan item count tertinggi
    if (candidate.length > bestItems.length) {
      bestItems = candidate;
      bestTarget = target;
    }
  }
  return bestItems;
}

/* ====================== OpenSID JSON API (internal_api) ====================== */
// Adapter untuk desa yang mengekspos endpoint `internal_api` ala OpenDK.
// Referensi struktur respons: openSID repo -> donjo-app/controllers/internal_api/Artikel.php
//   -> App\Repositories\ArtikelRepository + App\Http\Transformers\ArtikelTransformer
// Responsenya (Fractal JSON-API) berisi `data[].attributes` dengan field:
//   id, judul, slug, isi (HTML), gambar (filename), tgl_upload, tipe, id_kategori,
//   url_slug (accessor, path /artikel/YYYY/MM/DD/slug), hit, plus relasi
//   author.nama, category.kategori, comments[].id.
//
// Aktivasi: isi `opensid_api_url` (contoh: https://desa.id/api/v1/artikel)
// dan opsional `opensid_api_token` (Bearer) di admin per-desa.

type OpenSidApiItem = {
  type?: string;
  id?: string | number;
  attributes?: {
    id?: number;
    judul?: string;
    slug?: string;
    isi?: string;
    gambar?: string;
    tgl_upload?: string;
    tipe?: string;
    id_kategori?: number;
    id_user?: number;
    url_slug?: string;
    hit?: number;
    enabled?: number;
    [k: string]: unknown;
  };
  relationships?: {
    author?: { attributes?: { nama?: string } };
    category?: { attributes?: { kategori?: string; slug?: string } };
  };
};

type OpenSidApiResponse = {
  data?: OpenSidApiItem[];
  meta?: {
    pagination?: {
      total?: number;
      count?: number;
      per_page?: number;
      current_page?: number;
      total_pages?: number;
      links?: Record<string, string>;
    };
  };
  links?: Record<string, string>;
};

function buildOpenSidArticleUrl(
  attrs: OpenSidApiItem['attributes'],
  fallbackBase: string,
): string {
  if (attrs?.url_slug) {
    try {
      return new URL(attrs.url_slug, fallbackBase).toString();
    } catch {
      return attrs.url_slug;
    }
  }
  // Fallback: bentuk sendiri dari tgl_upload + slug
  if (attrs?.tgl_upload && attrs?.slug) {
    try {
      const d = new Date(attrs.tgl_upload);
      if (!isNaN(d.getTime())) {
        const yyyy = d.getUTCFullYear();
        const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
        const dd = String(d.getUTCDate()).padStart(2, '0');
        return absolutizeUrl(`/artikel/${yyyy}/${mm}/${dd}/${attrs.slug}`, fallbackBase);
      }
    } catch {
      // ignore
    }
  }
  return fallbackBase;
}

function buildOpenSidImageUrl(
  gambar: string | undefined,
  base: string,
): string | null {
  if (!gambar) return null;
  // OpenSID menyimpan gambar di /desa/upload/artikel/sedang_<file>
  return absolutizeUrl(`/desa/upload/artikel/sedang_${gambar}`, base);
}

async function fetchOpenSidApi(desa: Desa): Promise<Artikel[]> {
  if (!desa.opensid_api_url) return [];
  const url = desa.opensid_api_url.trim();
  const headers: Record<string, string> = {
    Accept: 'application/json',
    'User-Agent': USER_AGENT,
    'Accept-Language': 'id,en;q=0.9',
  };
  if (desa.opensid_api_token) {
    headers['Authorization'] = `Bearer ${desa.opensid_api_token}`;
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT);
  let res: Response;
  try {
    res = await fetch(url, { headers, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} ${res.statusText}`);
  }
  const json = (await res.json()) as OpenSidApiResponse;
  const items: Artikel[] = [];
  for (const node of json.data ?? []) {
    const a = node.attributes;
    if (!a) continue;
    if (a.enabled !== undefined && a.enabled !== 1) continue;
    if (a.tipe && ['statis', 'agenda', 'keuangan'].includes(a.tipe)) continue;

    const judul = (a.judul || '').trim();
    const slug = (a.slug || '').trim();
    if (!judul || !slug) continue;

    // Ringkasan: potong 260 char mengikuti logika feed.blade.php OpenSID
    let ringkasan: string | null = null;
    let konten: string | null = null;
    if (a.isi) {
      const text = stripHtml(a.isi);
      ringkasan = text.length > 260
        ? text.slice(0, text.slice(0, 260).lastIndexOf(' ') || 260) + ' [...]'
        : text;
      // Simpan konten lengkap (HTML) untuk ditampilkan di halaman detail
      konten = a.isi;
    }

    items.push({
      id: 0,
      desa_id: desa.id,
      external_id: a.id != null ? String(a.id) : slug,
      judul,
      slug,
      url: buildOpenSidArticleUrl(a, desa.website),
      ringkasan,
      konten,
      gambar: buildOpenSidImageUrl(a.gambar, desa.website),
      penulis: node.relationships?.author?.attributes?.nama ?? null,
      kategori: node.relationships?.category?.attributes?.kategori ?? null,
      published_at: a.tgl_upload || null,
      view_count: typeof a.hit === 'number' ? a.hit : 0,
      source: 'opensid-api',
      fetched_at: new Date().toISOString(),
    });
  }
  return items;
}

/* ====================== UPSERT ====================== */

function upsertArtikel(items: Artikel[], desaId: number): { newCount: number; updatedCount: number } {
  const upsert = db.prepare(`
    INSERT INTO artikel (
      desa_id, external_id, judul, slug, url, ringkasan, konten, gambar, penulis, kategori, published_at, source
    ) VALUES (
      @desa_id, @external_id, @judul, @slug, @url, @ringkasan, @konten, @gambar, @penulis, @kategori, @published_at, @source
    )
    ON CONFLICT(desa_id, slug) DO UPDATE SET
      judul = excluded.judul,
      url = excluded.url,
      -- Jangan timpa ringkasan/konten yang lebih lengkap (mis. hasil fetch halaman
      -- detail) dengan excerpt RSS/push yang lebih pendek.
      ringkasan = CASE
        WHEN length(COALESCE(excluded.ringkasan, '')) > length(COALESCE(artikel.ringkasan, ''))
        THEN excluded.ringkasan
        ELSE artikel.ringkasan
      END,
      konten = CASE
        WHEN length(COALESCE(excluded.konten, '')) > length(COALESCE(artikel.konten, ''))
        THEN excluded.konten
        ELSE artikel.konten
      END,
      gambar = excluded.gambar,
      penulis = excluded.penulis,
      kategori = excluded.kategori,
      published_at = excluded.published_at,
      source = excluded.source,
      fetched_at = datetime('now')
  `);
  let newCount = 0;
  let updatedCount = 0;
  const existStmt = db.prepare('SELECT 1 FROM artikel WHERE desa_id = ? AND slug = ?');
  const tx = db.transaction((rows: Artikel[]) => {
    for (const r of rows) {
      const existed = existStmt.get(r.desa_id, r.slug);
      upsert.run({ ...r, desa_id: desaId });
      if (existed) updatedCount++;
      else newCount++;
    }
  });
  tx(items);
  return { newCount, updatedCount };
}

/* ====================== PUSH INGEST ====================== */

// Bentuk payload artikel yang dikirim desa (kompatibel dengan format OpenSID)
export type PushArtikelItem = {
  judul: string;
  slug?: string;
  url: string;
  ringkasan?: string | null;
  gambar?: string | null;
  penulis?: string | null;
  kategori?: string | null;
  published_at?: string | null;
  external_id?: string | null;
};

export type PushPayload = {
  items: PushArtikelItem[];
  source?: string; // default 'push'
};

export type PushIngestResult = {
  newCount: number;
  updatedCount: number;
  totalReceived: number;
  invalid: number;
};

export function ingestPushPayload(desaId: number, payload: PushPayload): PushIngestResult {
  if (!Array.isArray(payload?.items)) {
    return { newCount: 0, updatedCount: 0, totalReceived: 0, invalid: 0 };
  }
  const items: Artikel[] = [];
  let invalid = 0;
  for (const it of payload.items) {
    if (!it || typeof it.judul !== 'string' || typeof it.url !== 'string' || !it.judul.trim() || !it.url.trim()) {
      invalid++;
      continue;
    }
    const judul = it.judul.trim();
    const url = it.url.trim();
    const slug = (it.slug && it.slug.trim()) || slugify(judul) || slugify(url);
    items.push({
      id: 0,
      desa_id: desaId,
      external_id: it.external_id || url,
      judul,
      slug,
      url,
      ringkasan: (it.ringkasan ?? null)?.toString().slice(0, 2000) || null,
      konten: null, // ringkasan saja, full content di situs desa
      gambar: it.gambar || null,
      penulis: it.penulis || null,
      kategori: it.kategori || null,
      published_at: it.published_at || null,
      view_count: 0,
      source: payload.source || 'push',
      fetched_at: new Date().toISOString(),
    });
  }
  if (items.length === 0) {
    return { newCount: 0, updatedCount: 0, totalReceived: payload.items.length, invalid };
  }
  const { newCount, updatedCount } = upsertArtikel(items, desaId);
  return { newCount, updatedCount, totalReceived: payload.items.length, invalid };
}

/* ====================== SYNC ENTRY ====================== */

export async function syncDesa(desa: Desa): Promise<SyncResult> {
  const start = Date.now();
  let items: Artikel[] = [];
  const usedSources: Array<'opensid-api' | 'rss' | 'scrape'> = [];
  const errors: string[] = [];

  // Strategi 0: OpenSID JSON API (paling reliable jika endpoint dikonfigurasi)
  try {
    if (desa.opensid_api_url) {
      const apiItems = await fetchOpenSidApi(desa);
      if (apiItems.length > 0) {
        items = apiItems;
        usedSources.push('opensid-api');
      }
    }
  } catch (e) {
    errors.push(`opensid-api: ${(e as Error).message}`);
  }

  // Strategi 1: RSS
  try {
    if (items.length === 0 && desa.feed_url) {
      const rssItems = await fetchRss(desa);
      if (rssItems.length > 0) {
        items = rssItems;
        usedSources.push('rss');
      }
    }
  } catch (e) {
    errors.push(`rss: ${(e as Error).message}`);
  }

  // Strategi 2 (fallback): HTML scrape — jika dua strategi di atas kosong/gagal
  if (items.length === 0 && desa.scraper_enabled) {
    try {
      const scraped = await fetchScrape(desa);
      if (scraped.length > 0) {
        items = scraped;
        usedSources.push('scrape');
      }
    } catch (e) {
      errors.push(`scrape: ${(e as Error).message}`);
    }
  }

  if (items.length === 0) {
    return {
      status: 'failed',
      message: errors.join(' | ') || 'tidak ada item yang berhasil diambil',
      newCount: 0,
      updatedCount: 0,
      durationMs: Date.now() - start,
      source: 'rss',
    };
  }

  // Batasi ke N artikel terbaru per desa — berlaku untuk semua sumber
  // (RSS sudah dipotong saat streaming; API/scrape dipotong di sini).
  // Item tanpa tanggal ditaruh di urutan akhir.
  items = items
    .slice()
    .sort((a, b) => (b.published_at ?? '').localeCompare(a.published_at ?? ''))
    .slice(0, MAX_ARTIKEL_PER_DESA);

  const { newCount, updatedCount } = upsertArtikel(items, desa.id);
  const source: SyncResult['source'] =
    usedSources.length > 1 ? 'mixed' : usedSources[0] ?? 'rss';
  return {
    status: 'ok',
    message: errors.length ? `partial (${errors.join('; ')})` : 'ok',
    newCount,
    updatedCount,
    durationMs: Date.now() - start,
    source,
  };
}

export async function syncAllDesa(): Promise<Array<{ desa: Desa; result: SyncResult }>> {
  const rows = db.prepare('SELECT * FROM desa WHERE is_active = 1').all() as Desa[];
  const logStmt = db.prepare(`
    INSERT INTO sync_log (desa_id, source, status, message, new_count, updated_count, duration_ms)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  const updateDesa = db.prepare(`
    UPDATE desa SET last_sync_at = datetime('now'), last_sync_status = ?, last_sync_message = ? WHERE id = ?
  `);

  const out: Array<{ desa: Desa; result: SyncResult }> = [];
  // Beri jeda antar desa agar tidak membebani server desa
  for (const desa of rows) {
    const result = await syncDesa(desa);
    logStmt.run(desa.id, result.source, result.status, result.message, result.newCount, result.updatedCount, result.durationMs);
    updateDesa.run(result.status, result.message, desa.id);
    out.push({ desa, result });
    await new Promise((r) => setTimeout(r, 1500));
  }
  return out;
}
