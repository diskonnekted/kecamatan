"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import {
  createSession,
  destroySession,
  hashPassword,
  verifyPassword,
  SESSION_COOKIE,
  SESSION_TTL,
} from "@/lib/auth";
import { syncDesa, syncAllDesa } from "@/lib/sync";
import { scrapeAllStatistik } from "@/lib/statistik";
import type { Desa } from "@/lib/db";

export async function loginAction(formData: FormData) {
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!username || !password) {
    redirect(`/admin/login?error=${encodeURIComponent("Username dan password wajib diisi")}`);
  }
  const row = db
    .prepare("SELECT id, password_hash FROM admin_user WHERE username = ?")
    .get(username) as { id: number; password_hash: string } | undefined;
  if (!row || !verifyPassword(password, row.password_hash)) {
    redirect(`/admin/login?error=${encodeURIComponent("Username atau password salah")}`);
  }
  const token = createSession(row.id);
  const c = await cookies();
  c.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL,
  });
  redirect("/admin");
}

export async function logoutAction() {
  const c = await cookies();
  const token = c.get(SESSION_COOKIE)?.value;
  if (token) destroySession(token);
  c.delete(SESSION_COOKIE);
  redirect("/admin/login");
}

export async function triggerSyncAction(formData: FormData) {
  const slug = String(formData.get("slug") ?? "").trim() || null;
  try {
    if (slug) {
      const desa = db
        .prepare("SELECT * FROM desa WHERE slug = ?")
        .get(slug) as Desa | undefined;
      if (!desa) {
        redirect(`/admin?error=${encodeURIComponent("Desa tidak ditemukan")}`);
      }
      const result = await syncDesa(desa);
      revalidatePath("/");
      revalidatePath("/artikel");
      revalidatePath(`/desa/${slug}`);
      revalidatePath("/admin");
      const msg = `Sinkron ${desa.nama}: ${result.status}${result.newCount ? ` · +${result.newCount} baru` : ""}${result.updatedCount ? ` · ${result.updatedCount} update` : ""}`;
      redirect(`/admin?message=${encodeURIComponent(msg)}`);
    }
    const results = await syncAllDesa();
    const success = results.filter((r) => r.result.status === "ok").length;
    const total = results.reduce((s, r) => s + r.result.newCount, 0);
    revalidatePath("/");
    revalidatePath("/artikel");
    revalidatePath("/admin");
    redirect(
      `/admin?message=${encodeURIComponent(
        `Sync ${success}/${results.length} desa · +${total} artikel baru`,
      )}`,
    );
  } catch (e) {
    // Re-throw NEXT_REDIRECT
    if (e instanceof Error && e.message === "NEXT_REDIRECT") throw e;
    redirect(
      `/admin?error=${encodeURIComponent(
        e instanceof Error ? e.message : "Gagal sinkron",
      )}`,
    );
  }
}

export async function toggleActiveAction(formData: FormData) {
  const id = parseInt(String(formData.get("id") ?? "0"), 10);
  if (!id) {
    redirect(`/admin?error=${encodeURIComponent("ID tidak valid")}`);
  }
  db.prepare("UPDATE desa SET is_active = 1 - is_active WHERE id = ?").run(id);
  revalidatePath("/admin");
  revalidatePath("/");
  redirect("/admin?message=Status desa diperbarui");
}

export async function updateDesaAction(formData: FormData) {
  const id = parseInt(String(formData.get("id") ?? "0"), 10);
  if (!id) {
    redirect(`/admin?error=${encodeURIComponent("ID tidak valid")}`);
  }
  const feed_url = String(formData.get("feed_url") ?? "").trim() || null;
  const opensid_api_url = String(formData.get("opensid_api_url") ?? "").trim() || null;
  const opensid_api_token = String(formData.get("opensid_api_token") ?? "").trim() || null;
  const scraper_enabled = formData.get("scraper_enabled") ? 1 : 0;
  db.prepare(
    "UPDATE desa SET feed_url = ?, scraper_enabled = ?, opensid_api_url = ?, opensid_api_token = ? WHERE id = ?",
  ).run(feed_url, scraper_enabled, opensid_api_url, opensid_api_token, id);
  revalidatePath("/admin");
  redirect("/admin?message=Pengaturan desa disimpan");
}

export async function changePasswordAction(formData: FormData) {
  const oldPw = String(formData.get("old_password") ?? "");
  const newPw = String(formData.get("new_password") ?? "");
  if (newPw.length < 6) {
    redirect(`/admin?error=${encodeURIComponent("Password baru minimal 6 karakter")}`);
  }
  const c = await cookies();
  const token = c.get(SESSION_COOKIE)?.value;
  if (!token) {
    redirect(`/admin?error=${encodeURIComponent("Tidak terautentikasi")}`);
  }
  const session = db
    .prepare(
      `SELECT u.id, u.password_hash FROM admin_session s
       JOIN admin_user u ON u.id = s.user_id WHERE s.token = ?`,
    )
    .get(token) as { id: number; password_hash: string } | undefined;
  if (!session) {
    redirect(`/admin?error=${encodeURIComponent("Sesi tidak valid")}`);
  }
  if (!verifyPassword(oldPw, session.password_hash)) {
    redirect(`/admin?error=${encodeURIComponent("Password lama salah")}`);
  }
  db.prepare("UPDATE admin_user SET password_hash = ? WHERE id = ?").run(
    hashPassword(newPw),
    session.id,
  );
  redirect("/admin?message=Password berhasil diubah");
}

/* ====================== API KEY MANAGEMENT ====================== */

export async function generateApiKeyAction(formData: FormData) {
  const desaId = parseInt(String(formData.get("desa_id") ?? "0"), 10);
  if (!desaId) {
    redirect(`/admin?error=${encodeURIComponent("ID desa tidak valid")}`);
  }
  const { generateApiKey } = await import("@/lib/db");
  const apiKey = generateApiKey();

  // Upsert: kalau sudah ada, regenerate
  const existing = db
    .prepare("SELECT id FROM desa_api_key WHERE desa_id = ?")
    .get(desaId) as { id: number } | undefined;
  if (existing) {
    db.prepare(
      "UPDATE desa_api_key SET api_key = ?, is_active = 1, last_push_at = NULL, last_push_status = NULL, last_push_message = NULL WHERE desa_id = ?",
    ).run(apiKey, desaId);
  } else {
    db.prepare(
      "INSERT INTO desa_api_key (desa_id, api_key) VALUES (?, ?)",
    ).run(desaId, apiKey);
  }
  revalidatePath("/admin");
  // Kirim key di query string — hanya tersedia SEKALI (tidak disimpan permanen di UI)
  redirect(`/admin/desa/${desaId}?newkey=${encodeURIComponent(apiKey)}&message=${encodeURIComponent("API key baru dibuat. Salin sekarang — key hanya ditampilkan sekali!")}`);
}

export async function revokeApiKeyAction(formData: FormData) {
  const desaId = parseInt(String(formData.get("desa_id") ?? "0"), 10);
  if (!desaId) {
    redirect(`/admin?error=${encodeURIComponent("ID desa tidak valid")}`);
  }
  db.prepare("UPDATE desa_api_key SET is_active = 0 WHERE desa_id = ?").run(desaId);
  revalidatePath("/admin");
  redirect(`/admin/desa/${desaId}?message=${encodeURIComponent("API key dicabut. Desa tidak bisa push sampai key baru dibuat.")}`);
}

export async function reactivateApiKeyAction(formData: FormData) {
  const desaId = parseInt(String(formData.get("desa_id") ?? "0"), 10);
  if (!desaId) {
    redirect(`/admin?error=${encodeURIComponent("ID desa tidak valid")}`);
  }
  db.prepare("UPDATE desa_api_key SET is_active = 1 WHERE desa_id = ?").run(desaId);
  revalidatePath("/admin");
  redirect(`/admin/desa/${desaId}?message=${encodeURIComponent("API key diaktifkan kembali.")}`);
}

export async function deleteApiKeyAction(formData: FormData) {
  const desaId = parseInt(String(formData.get("desa_id") ?? "0"), 10);
  if (!desaId) {
    redirect(`/admin?error=${encodeURIComponent("ID desa tidak valid")}`);
  }
  db.prepare("DELETE FROM desa_api_key WHERE desa_id = ?").run(desaId);
  revalidatePath("/admin");
  redirect(`/admin/desa/${desaId}?message=${encodeURIComponent("API key dihapus. Desa harus generate ulang.")}`);
}

/* ====================== PROFIL KECAMATAN ====================== */

export async function saveProfilKecamatanAction(formData: FormData) {
  const nama_kecamatan = String(formData.get("nama_kecamatan") ?? "").trim();
  const kabupaten = String(formData.get("kabupaten") ?? "").trim();
  const provinsi = String(formData.get("provinsi") ?? "").trim();
  const kode_wilayah = String(formData.get("kode_wilayah") ?? "").trim() || null;
  const visi = String(formData.get("visi") ?? "").trim() || null;
  const misi = String(formData.get("misi") ?? "").trim() || null;
  const sejarah = String(formData.get("sejarah") ?? "").trim() || null;
  const letak_geografis = String(formData.get("letak_geografis") ?? "").trim() || null;
  const struktur_pemerintahan = String(formData.get("struktur_pemerintahan") ?? "").trim() || null;
  const alamat_kantor = String(formData.get("alamat_kantor") ?? "").trim() || null;
  const telepon_kantor = String(formData.get("telepon_kantor") ?? "").trim() || null;
  const email_kantor = String(formData.get("email_kantor") ?? "").trim() || null;
  const website_sumber = String(formData.get("website_sumber") ?? "").trim() || null;

  if (!nama_kecamatan) {
    redirect(`/admin/profil?error=${encodeURIComponent("Nama kecamatan wajib diisi")}`);
  }

  // Upsert: hanya ada 1 row
  const existing = db.prepare("SELECT id FROM profil_kecamatan").get() as { id: number } | undefined;
  if (existing) {
    db.prepare(`
      UPDATE profil_kecamatan SET
        nama_kecamatan = ?, kabupaten = ?, provinsi = ?, kode_wilayah = ?,
        visi = ?, misi = ?, sejarah = ?, letak_geografis = ?, struktur_pemerintahan = ?,
        alamat_kantor = ?, telepon_kantor = ?, email_kantor = ?, website_sumber = ?,
        updated_at = datetime('now')
      WHERE id = ?
    `).run(
      nama_kecamatan, kabupaten, provinsi, kode_wilayah,
      visi, misi, sejarah, letak_geografis, struktur_pemerintahan,
      alamat_kantor, telepon_kantor, email_kantor, website_sumber,
      existing.id,
    );
  } else {
    db.prepare(`
      INSERT INTO profil_kecamatan (
        nama_kecamatan, kabupaten, provinsi, kode_wilayah,
        visi, misi, sejarah, letak_geografis, struktur_pemerintahan,
        alamat_kantor, telepon_kantor, email_kantor, website_sumber
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      nama_kecamatan, kabupaten, provinsi, kode_wilayah,
      visi, misi, sejarah, letak_geografis, struktur_pemerintahan,
      alamat_kantor, telepon_kantor, email_kantor, website_sumber,
    );
  }
  revalidatePath("/");
  revalidatePath("/tentang");
  redirect("/admin/profil?message=Profil kecamatan berhasil disimpan");
}

export async function scrapeProfilAction(formData: FormData) {
  const url = String(formData.get("website_sumber") ?? "https://banjarmangu.banjarnegarakab.go.id/");
  try {
    const html = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 PortalKecamatan/1.0',
      },
      signal: AbortSignal.timeout(60000),
    }).then(r => {
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return r.text();
    });

    const $ = require('cheerio').load(html);
    let sejarah = '';
    let letakGeografis = '';
    let visi = '';
    let misi = '';

    // Coba ambil dari berbagai selector yang umum
    // Sejarah/Tentang
    $('h2:contains("Sejarah"), h3:contains("Sejarah"), h2:contains("Tentang"), .sejarah, #sejarah, .tentang').each((_i: number, el: any) => {
      const text = $(el).nextUntil('h2, h3, h4').addBack().text().trim();
      if (text && text.length > 50) sejarah = text;
    });

    // Letak Geografis
    $('h2:contains("Geografis"), h3:contains("Geografis"), .letak, #letak_geografis').each((_i: number, el: any) => {
      const text = $(el).nextUntil('h2, h3, h4').addBack().text().trim();
      if (text && text.length > 20) letakGeografis = text;
    });

    // Visi Misi
    $('h2:contains("Visi"), h3:contains("Visi"), .visi, #visi').each((_i: number, el: any) => {
      const text = $(el).nextUntil('h2, h3, h4').addBack().text().trim();
      if (text && text.length > 10) visi = text;
    });

    $('h2:contains("Misi"), h3:contains("Misi"), .misi, #misi').each((_i: number, el: any) => {
      const text = $(el).nextUntil('h2, h3, h4').addBack().text().trim();
      if (text && text.length > 10) misi = text;
    });

    // Jika tidak dapat dari selector spesifik, ambil semua konten dari section tentang
    if (!sejarah && !letakGeografis) {
      $('.tentang, #tentang, .profil, #profil, section:has(.sejarah), .content-sejarah').each((_i: number, el: any) => {
        const text = $(el).text().trim();
        if (text.length > 100) sejarah = text;
      });
    }

    revalidatePath("/");
    revalidatePath("/tentang");
    redirect(`/admin/profil?message=Scrape berhasil&sejarah=${encodeURIComponent(sejarah.slice(0, 100))}&letak=${encodeURIComponent(letakGeografis.slice(0, 100))}`);
  } catch (e) {
    redirect(`/admin/profil?error=${encodeURIComponent("Gagal scrape: " + (e instanceof Error ? e.message : String(e)))}`);
  }
}

/* ====================== STATISTIK SINKRONISASI ====================== */

export async function triggerSyncStatistikAction() {
  try {
    const result = await scrapeAllStatistik();
    revalidatePath("/statistik");
    revalidatePath("/admin");
    redirect(
      `/admin?message=${encodeURIComponent(
        `Sync statistik ${result.success}/${result.success + result.failed} desa berhasil`,
      )}`,
    );
  } catch (e) {
    redirect(
      `/admin?error=${encodeURIComponent(
        "Gagal sinkronisasi statistik: " + (e instanceof Error ? e.message : String(e)),
      )}`,
    );
  }
}

/* ====================== UNDUHAN (DOWNLOADS) ====================== */

function ensureUnduhanTable() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS unduhan (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      kategori TEXT NOT NULL,
      judul TEXT NOT NULL,
      deskripsi TEXT,
      file_url TEXT NOT NULL,
      file_size INTEGER,
      file_type TEXT,
      is_published INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);
}

export async function createUnduhanAction(formData: FormData) {
  ensureUnduhanTable();
  const kategori = String(formData.get("kategori") ?? "").trim();
  const judul = String(formData.get("judul") ?? "").trim();
  const deskripsi = String(formData.get("deskripsi") ?? "").trim() || null;
  const file_url = String(formData.get("file_url") ?? "").trim();
  const file_type = String(formData.get("file_type") ?? "").trim() || null;
  const file_size_raw = String(formData.get("file_size") ?? "").trim();
  const file_size = file_size_raw ? parseInt(file_size_raw, 10) : null;
  const is_published = formData.get("is_published") ? 1 : 0;

  if (!kategori || !judul || !file_url) {
    redirect(`/admin/unduhan?error=${encodeURIComponent("Kategori, judul, dan URL file wajib diisi")}`);
  }

  db.prepare(`
    INSERT INTO unduhan (kategori, judul, deskripsi, file_url, file_size, file_type, is_published)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(kategori, judul, deskripsi, file_url, file_size, file_type, is_published);

  revalidatePath("/unduhan");
  revalidatePath("/admin/unduhan");
  redirect(`/admin/unduhan?message=${encodeURIComponent(`Dokumen "${judul}" berhasil ditambahkan`)}`);
}

export async function updateUnduhanAction(formData: FormData) {
  const id = parseInt(String(formData.get("id") ?? "0"), 10);
  if (!id) {
    redirect(`/admin/unduhan?error=${encodeURIComponent("ID tidak valid")}`);
  }
  const kategori = String(formData.get("kategori") ?? "").trim();
  const judul = String(formData.get("judul") ?? "").trim();
  const deskripsi = String(formData.get("deskripsi") ?? "").trim() || null;
  const file_url = String(formData.get("file_url") ?? "").trim();
  const file_type = String(formData.get("file_type") ?? "").trim() || null;
  const file_size_raw = String(formData.get("file_size") ?? "").trim();
  const file_size = file_size_raw ? parseInt(file_size_raw, 10) : null;
  const is_published = formData.get("is_published") ? 1 : 0;

  if (!kategori || !judul || !file_url) {
    redirect(`/admin/unduhan?error=${encodeURIComponent("Kategori, judul, dan URL file wajib diisi")}`);
  }

  db.prepare(`
    UPDATE unduhan SET
      kategori = ?, judul = ?, deskripsi = ?, file_url = ?,
      file_size = ?, file_type = ?, is_published = ?,
      updated_at = datetime('now')
    WHERE id = ?
  `).run(kategori, judul, deskripsi, file_url, file_size, file_type, is_published, id);

  revalidatePath("/unduhan");
  revalidatePath("/admin/unduhan");
  redirect(`/admin/unduhan?message=${encodeURIComponent(`Dokumen "${judul}" berhasil diperbarui`)}`);
}

export async function deleteUnduhanAction(formData: FormData) {
  const id = parseInt(String(formData.get("id") ?? "0"), 10);
  if (!id) {
    redirect(`/admin/unduhan?error=${encodeURIComponent("ID tidak valid")}`);
  }
  const row = db.prepare("SELECT judul FROM unduhan WHERE id = ?").get(id) as { judul: string } | undefined;
  db.prepare("DELETE FROM unduhan WHERE id = ?").run(id);
  revalidatePath("/unduhan");
  revalidatePath("/admin/unduhan");
  redirect(`/admin/unduhan?message=${encodeURIComponent(`Dokumen "${row?.judul ?? ""}" berhasil dihapus`)}`);
}

export async function togglePublishUnduhanAction(formData: FormData) {
  const id = parseInt(String(formData.get("id") ?? "0"), 10);
  if (!id) {
    redirect(`/admin/unduhan?error=${encodeURIComponent("ID tidak valid")}`);
  }
  db.prepare("UPDATE unduhan SET is_published = 1 - is_published, updated_at = datetime('now') WHERE id = ?").run(id);
  revalidatePath("/unduhan");
  revalidatePath("/admin/unduhan");
  redirect(`/admin/unduhan?message=Status publikasi dokumen diperbarui`);
}
