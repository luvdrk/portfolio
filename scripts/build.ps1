$ErrorActionPreference = 'Stop'

$projectRoot = Split-Path -Parent $PSScriptRoot
$distDir = Join-Path $projectRoot 'dist'
$clientDir = Join-Path $distDir 'client'
$serverDir = Join-Path $distDir 'server'

if (Test-Path -LiteralPath $distDir) {
  Remove-Item -LiteralPath $distDir -Recurse -Force
}

New-Item -ItemType Directory -Path $clientDir -Force | Out-Null
New-Item -ItemType Directory -Path $serverDir -Force | Out-Null

$siteFiles = @(
  'index.html',
  'styles.css',
  'script.js',
  'me-formal.jpg',
  'me-pose.jpg',
  'og-cover.png',
  'design-cole-graphics.jpg',
  'design-cole-graphics-night.jpg'
)

foreach ($file in $siteFiles) {
  Copy-Item -LiteralPath (Join-Path $projectRoot $file) -Destination $clientDir
}

$shotsDir = Join-Path $projectRoot 'shots'
if (Test-Path -LiteralPath $shotsDir) {
  Copy-Item -LiteralPath $shotsDir -Destination $clientDir -Recurse
}

# The résumé is not published. It carries a phone number and a home region,
# and a file on a live URL is scraped indefinitely — it goes out by email, to
# whoever actually asked for it. Keep it out of this folder.

Copy-Item -LiteralPath (Join-Path $projectRoot 'worker/index.js') -Destination (Join-Path $serverDir 'index.js')

Write-Output 'Static portfolio build completed.'
