@echo off
chcp 65001 > nul
echo ========================================
echo   停止 Shelf Wiki 服务器
echo ========================================
echo.
echo 正在查找并停止运行中的服务器进程...
echo.

for /f "tokens=5" %%i in ('netstat -ano ^| findstr :3000 ^| findstr LISTENING') do (
    echo 正在终止进程 %%i...
    taskkill /PID %%i /F >nul 2>&1
)

echo.
echo 服务器已停止
pause