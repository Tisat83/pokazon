Param(
  [string]$ProjectRoot = "."
)

$public = Join-Path $ProjectRoot "public"
$src = Join-Path $public "src"
$dist = Join-Path $public "dist"

New-Item -ItemType Directory -Force -Path $src | Out-Null
New-Item -ItemType Directory -Force -Path $dist | Out-Null

$files = @("sdk.js","oko-widget.js","oko-operator.js","oko-loader.js")

foreach ($f in $files) {
  $from = Join-Path $public $f
  if (Test-Path $from) {
    $to = Join-Path $src $f
    Copy-Item $from $to -Force
    Write-Host "[OK] Copied $from -> $to"
  } else {
    Write-Host "[skip] $from not found"
  }
}

Write-Host "Done. Now edit files in public/src/*.js and build to public/dist/"
