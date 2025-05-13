@echo off
:: Consolidated script to manage the Šaukštas Meilės application on Windows
:: This script handles port conflicts, stopping existing instances, and starting the app

setlocal enabledelayedexpansion

:: Change to the application directory
cd /d %~dp0

:: Default port
set PORT=3001

:menu
cls
echo ===================================================
echo         Šaukštas Meilės Application Manager
echo ===================================================
echo.
echo  1. Start application (direct)
echo  2. Start application with PM2
echo  3. Stop application (PM2)
echo  4. Check application status
echo  5. Free port
echo  6. View application logs
echo  7. Exit
echo.
set /p choice=Enter your choice (1-7): 

if "%choice%"=="1" goto start_direct
if "%choice%"=="2" goto start_pm2
if "%choice%"=="3" goto stop_pm2
if "%choice%"=="4" goto check_status
if "%choice%"=="5" goto free_port
if "%choice%"=="6" goto view_logs
if "%choice%"=="7" goto end

echo Invalid choice. Please try again.
timeout /t 2 >nul
goto menu

:start_direct
cls
echo Starting application directly...

:: Set environment variable
set NODE_ENV=production

:: Start the application
echo.
echo Application starting on http://localhost:%PORT%
echo.
echo Press Ctrl+C to stop the application.
echo.
node server/index.js

:: Return to menu when app stops
goto menu

:start_pm2
cls
echo Starting application with PM2...

:: Check if PM2 is installed
where pm2 >nul 2>&1
if %errorlevel% neq 0 (
    echo PM2 is not installed. Installing...
    npm install -g pm2
)

:: Check if the app is already running in PM2
pm2 list | findstr "saukstas-meiles" >nul
if %errorlevel% equ 0 (
    echo Application is already running in PM2.
    echo Restarting application...
    pm2 restart saukstas-meiles
) else (
    :: Start the app with PM2
    echo Starting new PM2 instance...
    pm2 start server/index.js --name "saukstas-meiles" -- --port %PORT%
)

echo.
echo Application started with PM2. It will run in the background.
echo Visit http://localhost:%PORT% to access the website.
echo.
pause
goto menu

:stop_pm2
cls
echo Stopping PM2 application...
pm2 stop saukstas-meiles
echo.
pause
goto menu

:check_status
cls
echo Checking application status...
echo.
:: Check PM2 status
echo PM2 Status:
pm2 list | findstr "saukstas-meiles"
echo.
:: Check if port is in use
netstat -ano | findstr ":%PORT%"
echo.
pause
goto menu

:free_port
cls
echo Finding and freeing port %PORT%...
echo.
:: Find process using the port
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":%PORT%"') do (
    set PID=%%a
    
    :: Skip if PID is not found or is empty
    if not "!PID!"=="" (
        echo Found process with PID: !PID!
        
        :: Get process name
        for /f "tokens=1" %%p in ('tasklist /fi "PID eq !PID!" ^| findstr "!PID!"') do (
            set PROCNAME=%%p
            echo Process name: !PROCNAME!
        )
        
        :: Ask for confirmation
        choice /c YN /m "Do you want to kill this process"
        if !errorlevel! equ 1 (
            echo Killing process with PID !PID!...
            taskkill /F /PID !PID!
            echo Process terminated.
        ) else (
            echo Process not terminated.
        )
        
        :: Break after the first matching process
        goto free_port_done
    )
)

echo No process found using port %PORT%.

:free_port_done
echo.
pause
goto menu

:view_logs
cls
echo Viewing application logs...
echo.
:: Check if running with PM2
pm2 list | findstr "saukstas-meiles" >nul
if %errorlevel% equ 0 (
    echo Showing PM2 logs. Press Ctrl+C to exit log view.
    echo.
    pm2 logs saukstas-meiles
) else (
    echo Application is not running with PM2. No logs available.
)
echo.
pause
goto menu

:end
echo Exiting application manager...
exit /b 0