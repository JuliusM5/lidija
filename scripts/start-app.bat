@echo off
:: This batch file starts the Šaukštas Meilės food blog application using PM2
:: Place this file in your startup folder to run automatically on Windows startup
:: Startup folder location: %APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup

echo Starting Šaukštas Meilės food blog application...

:: Navigate to the application directory
cd /d C:\Users\juliu\Desktop\Lidija\lidija

:: Start the application with PM2
pm2 start server/index.js --name "saukstas-meiles"

echo Application started successfully!