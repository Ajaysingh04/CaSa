# Sync all 3 CaSa native Android mobile applications
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "   CASA MOBILE TRIPLE APP SYNC (Customer, Vendor, Delivery)" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan

Set-Location -Path "$PSScriptRoot\..\client"

Write-Host "`n1. Building client web bundle..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "Build failed! Please fix web bundle errors first." -ForegroundColor Red
    exit 1
}

Write-Host "`n2. Syncing CaSa Customer App (com.casa.customer)..." -ForegroundColor Green
Copy-Item -Path "capacitor.customer.json" -Destination "capacitor.config.json" -Force
npx cap sync android

Write-Host "`n3. Syncing CaSa Vendor App (com.casa.vendor)..." -ForegroundColor Magenta
Copy-Item -Path "capacitor.vendor.json" -Destination "capacitor.config.json" -Force
npx cap sync android

Write-Host "`n4. Syncing CaSa Delivery App (com.casa.delivery)..." -ForegroundColor Blue
Copy-Item -Path "capacitor.delivery.json" -Destination "capacitor.config.json" -Force
npx cap sync android

# Restore customer config as default
Copy-Item -Path "capacitor.customer.json" -Destination "capacitor.config.json" -Force

Write-Host "`n✅ All 3 CaSa Mobile Apps synced successfully!" -ForegroundColor Green
Write-Host "Connect your Android device via USB and run:" -ForegroundColor Cyan
Write-Host "  - CaSa Customer:  npm run mobile:customer:run" -ForegroundColor White
Write-Host "  - CaSa Vendor:    npm run mobile:vendor:run" -ForegroundColor White
Write-Host "  - CaSa Delivery:  npm run mobile:delivery:run" -ForegroundColor White
