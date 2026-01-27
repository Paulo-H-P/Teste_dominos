@echo off
echo Iniciando servidor Allure...
cd /d "%~dp0"
call npm run allure:serve
pause
