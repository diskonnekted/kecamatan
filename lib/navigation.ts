export interface NavItem {
  href: string;
  label: string;
  children?: NavItem[];
  target?: "_self" | "_blank";
}

/**
 * Navigation menu structure matching OpenDK OpendK
 * Source: https://kecamatan-banjarmangu.smartdesa.net/api/frontend/v1/website (navigations)
 */
export const NAV_LINKS: NavItem[] = [
  { href: "/", label: "Beranda" },
  {
    href: "/artikel",
    label: "Berita",
    children: [
      { href: "/artikel", label: "Berita Desa" },
      { href: "/berita", label: "Berita Kecamatan" },
    ],
  },
  {
    href: "/profil",
    label: "Profil",
    children: [
      { href: "/profil", label: "Sejarah" },
      { href: "/profil/letak-geografis", label: "Letak Geografis" },
      { href: "/profil/struktur-pemerintahan", label: "Struktur Pemerintahan" },
      { href: "/profil/visi-misi", label: "Visi & Misi" },
      { href: "/profil/tupoksi", label: "Tupoksi" },
      { href: "/desa", label: "Desa" },
    ],
  },
  {
    href: "/ppid",
    label: "PPID",
    children: [
      { href: "/ppid", label: "Profil PPID" },
      { href: "/ppid/informasi-berkala", label: "Informasi Berkala" },
      { href: "/ppid/informasi-setiap-saat", label: "Informasi Setiap Saat" },
      { href: "/ppid/surat-keputusan", label: "Surat Keputusan" },
    ],
  },
  {
    href: "/statistik",
    label: "Statistik",
    children: [
      { href: "/statistik", label: "Kependudukan" },
      { href: "/statistik/pendidikan", label: "Pendidikan" },
      { href: "/statistik/kesehatan", label: "Kesehatan" },
      { href: "/statistik/program-dan-bantuan", label: "Program dan Bantuan" },
      { href: "/statistik/anggaran-dan-realisasi", label: "Anggaran dan Realisasi" },
    ],
  },
  {
    href: "/pelayanan-publik",
    label: "Pelayanan Publik",
    children: [
      { href: "/pelayanan-publik", label: "Standar Pelayanan" },
      { href: "/pelayanan-publik/maklumat-pelayanan", label: "Maklumat Pelayanan" },
      { href: "/pelayanan-publik/sop", label: "SOP" },
      { href: "/pelayanan-publik/sk-standar-pelayanan", label: "SK Standar Pelayanan" },
      { href: "/pelayanan-publik/sk-jam-pelayanan", label: "SK Jam Pelayanan" },
      { href: "/pelayanan-publik/sk-maklumat-pelayanan", label: "SK Maklumat Pelayanan" },
      { href: "/pelayanan-publik/hasil-survei", label: "Hasil Survei SKM" },
    ],
  },
  {
    href: "/unduhan",
    label: "Unduhan",
    children: [
      { href: "/unduhan/prosedur", label: "Prosedur" },
      { href: "/unduhan/regulasi", label: "Regulasi" },
      { href: "/unduhan/form-dokumen", label: "Dokumen" },
    ],
  },
  { href: "/faq", label: "FAQ", target: "_blank" },
];
