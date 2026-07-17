@echo off
chcp 65001 > nul
echo ========================================
echo   Shelf Wiki 服务器启动
echo ========================================
echo.
echo 正在启动服务器...
echo.

cd /d "%~dp0"
node server.js

pause