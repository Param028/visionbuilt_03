$fontsDir = 'd:\vision-built\public\fonts'
New-Item -Path $fontsDir -ItemType Directory -Force | Out-Null
$hdr = @{ 'Accept'='text/css,*/*'; 'User-Agent'='Mozilla/5.0' }

function Get-FontshareWoff2 {
    param([string]$Slug, [string]$Weights)
    $apiUrl = "https://api.fontshare.com/v2/css?f[]=$Slug@$Weights" + "&display=swap"
    $resp = (Invoke-WebRequest -Uri $apiUrl -Headers $hdr -UseBasicParsing -TimeoutSec 20).Content
    $pattern = "url\('(//cdn\.fontshare\.com/[^']+\.woff2)'\)"
    $found = [regex]::Matches($resp, $pattern) | ForEach-Object { "https:" + $_.Groups[1].Value } | Sort-Object -Unique
    return $found
}

Write-Host "Getting Clash Display woff2 URLs..."
$clashUrls = Get-FontshareWoff2 -Slug "clash-display" -Weights "700,600,500,400"
Write-Host "Found $($clashUrls.Count) URLs"
foreach ($u in $clashUrls) {
    $fn = [uri]::new($u).Segments[-1]
    Write-Host "Downloading $fn ..."
    Invoke-WebRequest -Uri $u -OutFile "$fontsDir\$fn" -UseBasicParsing -TimeoutSec 60
    Write-Host "  Done: $fn ($((Get-Item "$fontsDir\$fn").Length) bytes)"
}

Write-Host "Getting Satoshi woff2 URLs..."
$satUrls = Get-FontshareWoff2 -Slug "satoshi" -Weights "700,500,400,300"
Write-Host "Found $($satUrls.Count) URLs"
foreach ($u in $satUrls) {
    $fn = [uri]::new($u).Segments[-1]
    Write-Host "Downloading $fn ..."
    Invoke-WebRequest -Uri $u -OutFile "$fontsDir\$fn" -UseBasicParsing -TimeoutSec 60
    Write-Host "  Done: $fn ($((Get-Item "$fontsDir\$fn").Length) bytes)"
}

Write-Host "`n--- Downloaded files ---"
Get-ChildItem $fontsDir | ForEach-Object { Write-Host "  $($_.Name) ($($_.Length) bytes)" }
Write-Host "Font download complete."
