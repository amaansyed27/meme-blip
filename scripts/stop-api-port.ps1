$ErrorActionPreference = "Stop"

$port = 48322
$connections = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue

if (!$connections) {
  Write-Host "MemeBlip API port $port is free."
  exit 0
}

foreach ($connection in $connections) {
  $processId = $connection.OwningProcess
  if (!$processId -or $processId -eq 0) { continue }
  try {
    $process = Get-Process -Id $processId -ErrorAction Stop
    Write-Host "Stopping existing MemeBlip API process on port $port: $($process.ProcessName) [$processId]"
    Stop-Process -Id $processId -Force
  } catch {
    Write-Host "Could not stop process $processId on port $port: $($_.Exception.Message)" -ForegroundColor Yellow
  }
}

Start-Sleep -Milliseconds 400
Write-Host "MemeBlip API port $port cleared."
