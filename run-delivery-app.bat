@echo off
echo ========================================================
echo   Launching CaSa Delivery (Fleet App) via USB Debugging
echo ========================================================
cd client
copy capacitor.delivery.json capacitor.config.json /y
npx cap run android
pause
