@echo off
echo ========================================================
echo   Launching CaSa Shopping (Customer App) via USB Debugging
echo ========================================================
cd client
copy capacitor.customer.json capacitor.config.json /y
npx cap run android
pause
