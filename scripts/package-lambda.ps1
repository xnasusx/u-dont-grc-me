$ErrorActionPreference = "Stop"

$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$packageRoot = Join-Path $repoRoot ".lambda-package"
$distRoot = Join-Path $repoRoot "dist\lambda"
$zipPath = Join-Path $distRoot "governance-api.zip"

function Assert-InRepo($PathToCheck) {
  $resolvedParent = Split-Path -Parent $PathToCheck
  if (-not (Test-Path $resolvedParent)) {
    New-Item -ItemType Directory -Path $resolvedParent | Out-Null
  }
  $resolved = (Resolve-Path $resolvedParent).Path
  if (-not $resolved.StartsWith($repoRoot, [System.StringComparison]::OrdinalIgnoreCase)) {
    throw "Refusing to operate outside repo: $PathToCheck"
  }
}

Push-Location $repoRoot
try {
  node scripts/export-governance-snapshot.js

  Assert-InRepo $packageRoot
  Assert-InRepo $distRoot
  if (Test-Path $packageRoot) {
    Remove-Item -LiteralPath $packageRoot -Recurse -Force
  }
  if (Test-Path $zipPath) {
    Remove-Item -LiteralPath $zipPath -Force
  }

  New-Item -ItemType Directory -Path (Join-Path $packageRoot "server") | Out-Null
  New-Item -ItemType Directory -Path $distRoot -Force | Out-Null

  Copy-Item -LiteralPath "server\lambda.js" -Destination (Join-Path $packageRoot "server\lambda.js")
  Copy-Item -LiteralPath "server\governance-seed-snapshot.json" -Destination (Join-Path $packageRoot "server\governance-seed-snapshot.json")

  @'
{
  "type": "module",
  "dependencies": {
    "@aws-sdk/client-dynamodb": "^3.1098.0",
    "@aws-sdk/lib-dynamodb": "^3.1098.0"
  }
}
'@ | Set-Content -LiteralPath (Join-Path $packageRoot "package.json") -Encoding ascii

  Push-Location $packageRoot
  try {
    npm install --omit=dev --no-package-lock --no-audit --fund=false
  } finally {
    Pop-Location
  }

  tar -a -cf $zipPath -C $packageRoot .
  Write-Output "Wrote $zipPath"
} finally {
  Pop-Location
}
