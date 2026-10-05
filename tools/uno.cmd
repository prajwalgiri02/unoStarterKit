@echo off
setlocal

if "%~1"=="" (
    echo Usage: uno ^<project-name^>
    exit /b 1
)

call composer create-project unotechno/starterkit "%~1" --no-install --no-scripts --remove-vcs
if errorlevel 1 exit /b 1

cd /d "%~1"
php installer/setup.php
exit /b %errorlevel%
