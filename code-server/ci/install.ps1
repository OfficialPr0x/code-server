# AI War Room Deployment Pipeline for Windows
# Save as deploy-warroom.ps1

# Phase 1: Environment Setup
$ErrorActionPreference = "Stop"

# 1. Install NVM and Node 20
if (-not (Test-Path "$env:ProgramFiles\nodejs")) {
    iwr -UseBasicParsing https://raw.githubusercontent.com/coreybutler/nvm-windows/master/install.ps1 | iex
    nvm install 20.11.1
    nvm use 20.11.1
}

# 2. Install Build Tools
choco install -y python --version=3.11.8
choco install -y visualstudio2022buildtools --package-parameters "--add Microsoft.VisualStudio.Workload.NativeDesktop --includeRecommended"
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

# 3. Install Global Dependencies
npm install -g node-addon-api@6.0.0 windows-build-tools@4.0.0 pm2@5.3.0

# Phase 2: Code-Server Installation
$installDir = "$env:APPDATA\code-server"
# Download and extract
New-Item -Path $installDir -ItemType Directory -Force
Invoke-WebRequest $binaryUrl -OutFile "$installDir\code-server.zip"
Expand-Archive -Path "$installDir\code-server.zip" -DestinationPath $installDir -Force

# Phase 3: Project Setup
Set-Location $installDir

# 1. Clone repository
git clone https://github.com/your-org/ai-warroom.git

# 2. Install dependencies with strict engine checks
$env:NODE_OPTIONS = "--openssl-legacy-provider"
npm install --engine-strict --ignore-scripts --prefix $installDir

# 3. Fix postinstall script for Windows
Copy-Item -Path "$installDir\ci\dev\postinstall.sh" -Destination "$installDir\ci\dev\postinstall.ps1" -Force
npm run postinstall --scripts-prepend-node-path

# Phase 4: Configuration
# 1. Create .env file
@"
OPENROUTER_API_KEY="your_api_key"
AGENT_CONFIG_DIR="$installDir\agent-config"
NODE_ENV="production"
PORT=1738
HTTPS_CERT="$installDir\ssl\cert.pem"
HTTPS_KEY="$installDir\ssl\key.pem"
WS_ENDPOINT="wss://localhost:1738/ws"
"@ | Out-File "$installDir\.env" -Encoding utf8

# 2. Initialize agent config
New-Item -Path "$installDir\agent-config" -ItemType Directory -Force
Copy-Item -Path "$installDir\node_modules\@ai-warroom\core\agents\default-config\*" -Destination "$installDir\agent-config" -Recurse

# Phase 5: Service Registration
# 1. Create PM2 ecosystem file
@"
module.exports = {
  apps: [{
    name: 'ai-warroom',
    script: '$installDir\\ai-warroom\\src\\node\\server.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '4G',
    env: {
      NODE_ENV: 'production'
    }
  }]
}
"@ | Out-File "$installDir\ecosystem.config.js" -Encoding utf8

# 2. Register service
pm2 start ecosystem.config.js
pm2 save
pm2 startup | Out-String -Stream | ForEach-Object { if ($_ -match 'sudo') { iex $_ } }

# Phase 6: Post-Deploy Validation
Start-Process "http://localhost:1738/ai-warroom"
