# Scheduler Docker Startup Script for Windows
# This script helps you quickly set up and run the Scheduler application using Docker

$ErrorActionPreference = "Stop"

Write-Host "=======================================" -ForegroundColor Cyan
Write-Host "  Scheduler Docker Setup" -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host ""

# Check if Docker is installed
try {
    docker --version | Out-Null
    Write-Host "✓ Docker is installed" -ForegroundColor Green
} catch {
    Write-Host "Error: Docker is not installed." -ForegroundColor Red
    Write-Host "Please install Docker Desktop from https://docs.docker.com/desktop/install/windows-install/"
    exit 1
}

# Check if Docker Compose is installed
try {
    docker-compose --version | Out-Null
    Write-Host "✓ Docker Compose is installed" -ForegroundColor Green
} catch {
    Write-Host "Error: Docker Compose is not installed." -ForegroundColor Red
    Write-Host "Please install Docker Compose from https://docs.docker.com/compose/install/"
    exit 1
}

Write-Host ""

# Check if .env file exists
if (-Not (Test-Path ".env")) {
    Write-Host "⚠ .env file not found" -ForegroundColor Yellow
    if (Test-Path ".env.docker.example") {
        Write-Host "Creating .env from .env.docker.example..."
        Copy-Item ".env.docker.example" ".env"
        Write-Host "Please edit .env file with your Firebase credentials before continuing." -ForegroundColor Yellow
        Write-Host "Press Enter when you're ready to continue..."
        Read-Host
    } else {
        Write-Host "Error: .env.docker.example not found" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "✓ .env file exists" -ForegroundColor Green
}

# Check if Firebase service account exists
if (-Not (Test-Path "firebase-service-account.json")) {
    Write-Host "Error: firebase-service-account.json not found" -ForegroundColor Red
    Write-Host "Please download your Firebase service account key and place it in the root directory."
    Write-Host "File should be named: firebase-service-account.json"
    exit 1
} else {
    Write-Host "✓ Firebase service account found" -ForegroundColor Green
}

Write-Host ""
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host "  Starting Services" -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host ""

# Check if services are already running
$runningServices = docker-compose ps | Select-String "Up"
if ($runningServices) {
    Write-Host "⚠ Some services are already running" -ForegroundColor Yellow
    $response = Read-Host "Would you like to restart them? (y/n)"
    if ($response -eq "y" -or $response -eq "Y") {
        Write-Host "Stopping existing services..."
        docker-compose down
    } else {
        Write-Host "Exiting..."
        exit 0
    }
}

# Build and start services
Write-Host "Building and starting services..."
Write-Host "This may take a few minutes on first run..."
Write-Host ""

docker-compose up -d --build

Write-Host ""
Write-Host "Waiting for services to be healthy..."
Start-Sleep -Seconds 10

# Check service status
Write-Host ""
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host "  Service Status" -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan
docker-compose ps

Write-Host ""
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host "  Setup Complete!" -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "✓ All services are running" -ForegroundColor Green
Write-Host ""
Write-Host "Access the application:"
Write-Host "  - Frontend:  http://localhost:3000"
Write-Host "  - Backend:   http://localhost:8080"
Write-Host "  - Database:  localhost:5432"
Write-Host ""
Write-Host "Useful commands:"
Write-Host "  View logs:        docker-compose logs -f"
Write-Host "  Stop services:    docker-compose down"
Write-Host "  Restart:          docker-compose restart"
Write-Host ""
Write-Host "For more information, see DOCKER.md"
Write-Host ""
