# Build deployment zip dengan struktur yang benar
$ErrorActionPreference = "Stop"
$parent = "i:\kecamatan"
$src = Join-Path $parent "portal-kecamatan"
$dst = Join-Path $parent "portal-kecamatan.zip"

# Bersihkan
Remove-Item $dst -ErrorAction SilentlyContinue

# Pola exclude (regex terhadap path relatif terhadap $src)
$excludePatterns = @(
  "^[\\\/]?node_modules[\\\/]",
  "^[\\\/]?\.next[\\\/]",
  "^[\\\/]?\.data[\\\/]",
  "^[\\\/]?\.git[\\\/]",
  "^[\\\/]?logs[\\\/]",
  "[\\\/]node_modules[\\\/]",
  "[\\\/]\.next[\\\/]",
  "[\\\/]\.data[\\\/]",
  "[\\\/]\.git[\\\/]",
  "[\\\/]logs[\\\/]",
  "^\.env\.local$",
  "^\.env$",
  "^\.env\.production$",
  "^\.next-env\.d\.ts$",
  ".*\.ps1$",
  ".*\.bak$",
  ".*debug-.*\.js$",
  ".*probe-.*\.js$",
  ".*test-.*\.js$",
  ".*check-.*\.js$",
  ".*dump-.*\.js$",
  ".*verify-.*\.js$",
  ".*fix-.*\.js$",
  ".*investigate\.js$",
  ".*match-zones\.js$",
  ".*list-banjarmangu-subdomains\.js$",
  ".*summary-all-desa\.js$",
  ".*-output\.txt$",
  ".*-results\.txt$",
  ".*-context\.txt$",
  ".*-body\.txt$",
  ".*\.html$",
  "^nav-output\.txt$",
  "^pren-https\.html$",
  "^tsconfig\.tsbuildinfo$",
  "^portal-kecamatan\.zip$",
  ".*\\\.env\.local\.example$"
)

function Should-Include($relPath) {
  # Normalize separator ke /
  $p = $relPath -replace "\\", "/"
  foreach ($ex in $excludePatterns) {
    if ($p -match $ex) { return $false }
  }
  return $true
}

# Bangun daftar file yang akan di-include dengan path RELATIF terhadap $parent
# (jadi file di "portal-kecamatan/app/admin/actions.ts" tersimpan sebagai "portal-kecamatan/app/admin/actions.ts" di zip)
$included = @()
Get-ChildItem -Path $src -Recurse -File | ForEach-Object {
  $rel = $_.FullName.Substring($parent.Length).TrimStart('\', '/')
  if (Should-Include $rel) {
    $included += $_.FullName
  }
}

Write-Host "Total file: $($included.Count)"
Write-Host "Sample entries (full paths):"
$included | Select-Object -First 5 | ForEach-Object { Write-Host "  $_" }
Write-Host "..."

# Buat zip
[System.IO.Compression.ZipFile]::CreateFromDirectory($src, $dst, [System.IO.Compression.CompressionLevel]::Optimal, $false, [System.Text.Encoding]::UTF8)

# Verifikasi
$info = Get-Item $dst
Write-Host "Berhasil: $dst ($([math]::Round($info.Length/1MB, 2)) MB)"

# Quick check: list 10 entry pertama
Add-Type -AssemblyName System.IO.Compression.FileSystem
$z = [System.IO.Compression.ZipFile]::OpenRead($dst)
Write-Host ""
Write-Host "Sample entries di dalam zip:"
$z.Entries | Where-Object { $_.FullName -like "app/*" -or $_.FullName -like "components/*" -or $_.FullName -eq "package.json" -or $_.FullName -eq "next.config.ts" } | Select-Object -First 10 | ForEach-Object { Write-Host "  $($_.FullName)" }
$z.Dispose()
