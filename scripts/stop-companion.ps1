$ErrorActionPreference = "Stop"

$Ports = @(48322, 48321)
$ProcessNames = @("MemeBlip", "meme-blip-native", "node", "cargo")

foreach ($port in $Ports) {
  $connections = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
  foreach ($connection in $connections) {
    $processId = $connection.OwningProcess
    if (!$processId -or $processId -eq 0) { continue }
    try {
      $process = Get-Process -Id $processId -ErrorAction Stop
      Write-Host "Stopping process on port ${port}: $($process.ProcessName) [$processId]"
      Stop-Process -Id $processId -Force
    } catch {
      Write-Host "Could not stop process $processId on port ${port}: $($_.Exception.Message)" -ForegroundColor Yellow
    }
  }
}

foreach ($name in $ProcessNames) {
  Get-Process -Name $name -ErrorAction SilentlyContinue | ForEach-Object {
    if ($_.Path -and $_.Path -notmatch "meme-blip|MemeBlip|native|cargo|node") { return }
    Write-Host "Stopping leftover companion/dev process: $($_.ProcessName) [$($_.Id)]"
    Stop-Process -Id $_.Id -Force
  }
}

Write-Host "MemeBlip companion/dev ports cleared."
