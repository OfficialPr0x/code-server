# ai-warroom-install.ps1 - Revised
$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"

# Phase 1: Validate environment
if (-not ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
    Write-Host "Please run as Administrator" -ForegroundColor Red
    exit 1
}

# Phase 2: Core dependencies
$nodePath = "$env:ProgramFiles\nodejs"
if (-not (Test-Path $nodePath)) {
    Write-Host "Installing Node.js 20..."
    $nodeInstaller = "$env:TEMP\node-v20.11.1-x64.msi"
    try {
        Invoke-WebRequest "https://nodejs.org/dist/v20.11.1/node-v20.11.1-x64.msi" -OutFile $nodeInstaller
        Start-Process msiexec -ArgumentList "/i $nodeInstaller /quiet" -Wait
        $env:Path = "$nodePath;$env:Path"
    } finally {
        Remove-Item $nodeInstaller -ErrorAction SilentlyContinue
    }
}

# Phase 3: Build tools (modern approach)
if (-not (Test-Path "C:\Program Files (x86)\Microsoft Visual Studio\2022\BuildTools")) {
    Write-Host "Installing VS 2022 Build Tools..."
    choco install -y visualstudio2022-buildtools --package-parameters "--add Microsoft.VisualStudio.Workload.VCTools --includeRecommended"
}

# Phase 4: Python 3.11
if (-not (Test-Path "C:\Python311")) {
    Write-Host "Installing Python 3.11..."
    choco install -y python311 --version=3.11.8
    $env:Path = "C:\Python311;C:\Python311\Scripts;$env:Path"
}

# Phase 5: Project setup
$installDir = "$env:LOCALAPPDATA\ai-warroom"
New-Item -Path $installDir -ItemType Directory -Force | Out-Null
Set-Location $installDir

# Clone repository (replace with your actual repo URL)
$repoUrl = "https://github.com/your-actual-org/ai-warroom.git"
if (Test-Path "$installDir\.git") {
    git pull
} else {
    git clone $repoUrl .
}

# Phase 6: Install dependencies
npm install -g node-gyp@9.0.0 node-addon-api@6.0.0 --loglevel=error

# Configure environment
$env:NODE_OPTIONS = "--openssl-legacy-provider"
$env:GYP_MSVS_VERSION = "2022"

# Install project dependencies
npm install --engine-strict --ignore-scripts --loglevel=error

# Phase 7: Post-install setup
$postinstallDir = "$installDir\ci\dev"
New-Item -Path $postinstallDir -ItemType Directory -Force | Out-Null
@'
#!/usr/bin/env pwsh
Set-Location $PSScriptRoot\..\..
npm rebuild --update-binary --nodedir="$env:ProgramFiles\nodejs"
'@ | Out-File "$postinstallDir\postinstall.ps1" -Encoding utf8

& "$postinstallDir\postinstall.ps1"

Write-Host "Installation complete! Access at: http://localhost:1738/ai-warroom" -ForegroundColor Green
