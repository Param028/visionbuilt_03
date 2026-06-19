$url1 = "https://api.fontshare.com/v2/css?f[]=clash-display@700,600,500,400" + "&display=swap"
$url2 = "https://api.fontshare.com/v2/css?f[]=satoshi@700,500,400,300" + "&display=swap"
$c1 = (Invoke-WebRequest -Uri $url1 -UseBasicParsing -TimeoutSec 20).Content
$c2 = (Invoke-WebRequest -Uri $url2 -UseBasicParsing -TimeoutSec 20).Content
Write-Host "=== CLASH DISPLAY ==="
Write-Host $c1
Write-Host "=== SATOSHI ==="
Write-Host $c2
