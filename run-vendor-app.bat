@echo off
echo ========================================================
echo   Launching CaSa Vendor (Merchant App) via USB Debugging
echo ========================================================
cd client
copy capacitor.vendor.json capacitor.config.json /y
npx cap run android
pause
