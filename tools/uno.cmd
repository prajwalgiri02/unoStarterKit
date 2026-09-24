@echo off
setlocal

if "%~1"=="" (
    echo Usage: uno ^<project-name^>
    exit /b 1
)

if not defined UNO_REPO set "UNO_REPO=git@github.com:prajwalgiri02/unoStarterKit.git"

call composer create-project prajwalgiri02/unostarterkit "%~1" --no-install --no-scripts --remove-vcs --repository="{\"type\":\"vcs\",\"url\":\"%UNO_REPO%\",\"no-api\":true}"
if errorlevel 1 exit /b 1

cd /d "%~1"
php installer/setup.php
exit /b %errorlevel%
