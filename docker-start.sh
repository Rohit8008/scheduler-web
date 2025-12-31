#!/bin/bash

# Scheduler Docker Startup Script
# This script helps you quickly set up and run the Scheduler application using Docker

set -e  # Exit on any error

echo "======================================="
echo "  Scheduler Docker Setup"
echo "======================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Error: Docker is not installed.${NC}"
    echo "Please install Docker from https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}Error: Docker Compose is not installed.${NC}"
    echo "Please install Docker Compose from https://docs.docker.com/compose/install/"
    exit 1
fi

echo -e "${GREEN}✓ Docker is installed${NC}"
echo -e "${GREEN}✓ Docker Compose is installed${NC}"
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠ .env file not found${NC}"
    if [ -f .env.docker.example ]; then
        echo "Creating .env from .env.docker.example..."
        cp .env.docker.example .env
        echo -e "${YELLOW}Please edit .env file with your Firebase credentials before continuing.${NC}"
        echo "Press Enter when you're ready to continue..."
        read
    else
        echo -e "${RED}Error: .env.docker.example not found${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✓ .env file exists${NC}"
fi

# Check if Firebase service account exists
if [ ! -f firebase-service-account.json ]; then
    echo -e "${RED}Error: firebase-service-account.json not found${NC}"
    echo "Please download your Firebase service account key and place it in the root directory."
    echo "File should be named: firebase-service-account.json"
    exit 1
else
    echo -e "${GREEN}✓ Firebase service account found${NC}"
fi

echo ""
echo "======================================="
echo "  Starting Services"
echo "======================================="
echo ""

# Check if services are already running
if docker-compose ps | grep -q "Up"; then
    echo -e "${YELLOW}⚠ Some services are already running${NC}"
    echo "Would you like to restart them? (y/n)"
    read -r response
    if [[ "$response" =~ ^[Yy]$ ]]; then
        echo "Stopping existing services..."
        docker-compose down
    else
        echo "Exiting..."
        exit 0
    fi
fi

# Build and start services
echo "Building and starting services..."
echo "This may take a few minutes on first run..."
echo ""

docker-compose up -d --build

echo ""
echo "Waiting for services to be healthy..."
sleep 10

# Check service status
echo ""
echo "======================================="
echo "  Service Status"
echo "======================================="
docker-compose ps

echo ""
echo "======================================="
echo "  Setup Complete!"
echo "======================================="
echo ""
echo -e "${GREEN}✓ All services are running${NC}"
echo ""
echo "Access the application:"
echo "  - Frontend:  http://localhost:3000"
echo "  - Backend:   http://localhost:8080"
echo "  - Database:  localhost:5432"
echo ""
echo "Useful commands:"
echo "  View logs:        docker-compose logs -f"
echo "  Stop services:    docker-compose down"
echo "  Restart:          docker-compose restart"
echo ""
echo "For more information, see DOCKER.md"
echo ""
