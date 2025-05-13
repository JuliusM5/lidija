@echo off
:: This batch file finds and kills any process using port 3000
:: Usage: free-port.bat [port]
:: Example: free-port.bat 3000

setlocal enabledelayedexpansion

:: Get the port from arguments or use default 3000
set PORT=3000
if not "%~1"=="" set PORT=%~1

echo Finding process using port %PORT%...

:: Find the process using the port
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
        goto :done
    )
)

echo No process found using port %PORT%.

:done
echo.
echo You can now try running your application again.
pause