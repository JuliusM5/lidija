@echo off
:: This script replaces all .php API endpoints with Node.js endpoints in JavaScript files
:: Run this from the root directory of your project

echo Updating JavaScript files to use Node.js endpoints...
echo.

:: Create backup directory
if not exist "backups" mkdir backups
if not exist "backups\js" mkdir backups\js

:: Backup and update main.js
echo Processing main.js...
copy /Y "public\js\main.js" "backups\js\main.js"
powershell -Command "(Get-Content 'public\js\main.js') -replace 'api/recipes\.php', 'api/recipes' -replace 'api/categories\.php', 'api/categories' -replace 'api/about\.php', 'api/about' -replace 'api/comments\.php', 'api/comments' -replace 'api/newsletter\.php', 'api/newsletter' -replace 'admin-connector\.php', 'admin-connector' | Set-Content 'public\js\main.js'"

:: Backup and update navigation.js
echo Processing navigation.js...
copy /Y "public\js\navigation.js" "backups\js\navigation.js"
powershell -Command "(Get-Content 'public\js\navigation.js') -replace 'api/recipes\.php', 'api/recipes' -replace 'api/categories\.php', 'api/categories' -replace 'api/about\.php', 'api/about' -replace 'api/comments\.php', 'api/comments' -replace 'api/newsletter\.php', 'api/newsletter' -replace 'admin-connector\.php', 'admin-connector' | Set-Content 'public\js\navigation.js'"

:: Backup and update forms.js
echo Processing forms.js...
copy /Y "public\js\forms.js" "backups\js\forms.js"
powershell -Command "(Get-Content 'public\js\forms.js') -replace 'api/recipes\.php', 'api/recipes' -replace 'api/categories\.php', 'api/categories' -replace 'api/about\.php', 'api/about' -replace 'api/comments\.php', 'api/comments' -replace 'api/newsletter\.php', 'api/newsletter' -replace 'admin-connector\.php', 'admin-connector' | Set-Content 'public\js\forms.js'"

:: Backup and update admin.js
echo Processing admin.js...
copy /Y "public\js\admin.js" "backups\js\admin.js"
powershell -Command "(Get-Content 'public\js\admin.js') -replace 'admin-connector\.php', 'admin-connector' -replace 'api/recipes\.php', 'api/recipes' -replace 'api/categories\.php', 'api/categories' -replace 'api/about\.php', 'api/about' -replace 'api/comments\.php', 'api/comments' -replace 'api/newsletter\.php', 'api/newsletter' | Set-Content 'public\js\admin.js'"

:: Also update any HTML files that might contain direct API calls
echo Processing HTML files...
if not exist "backups\html" mkdir backups\html

:: Backup and update index.html
copy /Y "public\index.html" "backups\html\index.html"
powershell -Command "(Get-Content 'public\index.html') -replace 'api/recipes\.php', 'api/recipes' -replace 'api/categories\.php', 'api/categories' -replace 'api/about\.php', 'api/about' -replace 'api/comments\.php', 'api/comments' -replace 'api/newsletter\.php', 'api/newsletter' -replace 'admin-connector\.php', 'admin-connector' | Set-Content 'public\index.html'"

:: Backup and update about.html
copy /Y "public\about.html" "backups\html\about.html"
powershell -Command "(Get-Content 'public\about.html') -replace 'api/recipes\.php', 'api/recipes' -replace 'api/categories\.php', 'api/categories' -replace 'api/about\.php', 'api/about' -replace 'api/comments\.php', 'api/comments' -replace 'api/newsletter\.php', 'api/newsletter' -replace 'admin-connector\.php', 'admin-connector' | Set-Content 'public\about.html'"

:: Backup and update admin.html
copy /Y "public\admin.html" "backups\html\admin.html"
powershell -Command "(Get-Content 'public\admin.html') -replace 'admin-connector\.php', 'admin-connector' -replace 'api/recipes\.php', 'api/recipes' -replace 'api/categories\.php', 'api/categories' -replace 'api/about\.php', 'api/about' -replace 'api/comments\.php', 'api/comments' -replace 'api/newsletter\.php', 'api/newsletter' | Set-Content 'public\admin.html'"

echo.
echo Update complete! Original files have been backed up to the 'backups' directory.
echo Please restart your application and try again.
echo.
pause