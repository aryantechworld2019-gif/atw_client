# Windows Setup Guide

This guide helps you set up and run the application on Windows.

## Prerequisites

### 1. Install Docker Desktop

1. Download Docker Desktop for Windows:
   - https://www.docker.com/products/docker-desktop/

2. Install Docker Desktop:
   - Run the installer
   - Enable WSL 2 (recommended) or Hyper-V
   - Restart your computer if prompted

3. Configure Docker Desktop:
   - Open Docker Desktop
   - Go to Settings → Resources
   - Allocate at least:
     - **4 GB RAM** (8 GB recommended)
     - **2 CPUs** (4 recommended)
   - Click "Apply & Restart"

### 2. Verify Docker Installation

Open PowerShell or Command Prompt and run:

```bash
docker --version
docker-compose --version
docker ps
```

You should see version numbers and an empty container list.

---

## Common Windows Issues & Solutions

### Issue 1: "The system cannot find the file specified"

**Cause:** Docker Desktop is not running

**Solution:**
1. Launch Docker Desktop from Start menu
2. Wait for the Docker icon to appear in system tray
3. Ensure the icon shows "Docker Desktop is running"
4. Try your command again

### Issue 2: "Error during connect: This error may indicate that the docker daemon is not running"

**Solution:**
1. Right-click Docker Desktop icon in system tray
2. Click "Restart Docker Desktop"
3. Wait for it to fully start
4. Try again

### Issue 3: "Access Denied" or Permission Errors

**Solution:**
1. Run PowerShell or Command Prompt as **Administrator**
2. Or add your user to the "docker-users" group:
   - Open "Computer Management"
   - Go to Local Users and Groups → Groups
   - Double-click "docker-users"
   - Add your user account
   - Log out and log back in

### Issue 4: Port Already in Use

**Solution:**
```bash
# Check what's using port 5173 (or 8000, 27017, 6379)
netstat -ano | findstr :5173

# Kill the process using the port
taskkill /PID <process_id> /F
```

---

## Setup Instructions for Windows

### Option 1: Full Setup (All Services)

1. **Open PowerShell** in your project directory:
   ```bash
   cd D:\aryan-labs\Atw_Client\atw_client
   ```

2. **Start Docker Desktop** and wait for it to be ready

3. **Build and start all services:**
   ```bash
   docker-compose up -d --build
   ```

4. **Check status:**
   ```bash
   docker-compose ps
   ```

5. **View logs:**
   ```bash
   docker-compose logs -f
   ```

### Option 2: Simplified Setup (Without Celery)

If you have issues with the full setup, use the simplified version:

1. **Use the simplified docker-compose file:**
   ```bash
   docker-compose -f docker-compose.simple.yml up -d --build
   ```

2. **This starts only:**
   - MongoDB
   - Redis
   - Backend API
   - Frontend

---

## Accessing the Application

Once running:

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/api/docs
- **MongoDB**: localhost:27017
- **Redis**: localhost:6379

---

## Useful Docker Commands for Windows

### Start Services
```bash
# Start all services
docker-compose up -d

# Start specific service
docker-compose up -d backend
```

### Stop Services
```bash
# Stop all services
docker-compose down

# Stop and remove volumes (clean slate)
docker-compose down -v
```

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend

# Last 100 lines
docker-compose logs --tail=100
```

### Rebuild Services
```bash
# Rebuild all
docker-compose up -d --build

# Rebuild specific service
docker-compose up -d --build backend
```

### Access Container Shell
```bash
# Backend container
docker exec -it atw_backend bash

# MongoDB shell
docker exec -it atw_mongodb mongosh

# Redis CLI
docker exec -it atw_redis redis-cli
```

### Clean Up
```bash
# Remove all containers and networks
docker-compose down

# Remove everything including volumes
docker-compose down -v

# Remove all unused Docker data
docker system prune -a
```

---

## Alternative: Run Without Docker

If Docker continues to have issues, you can run services locally:

### 1. Install MongoDB

1. Download MongoDB Community Server:
   - https://www.mongodb.com/try/download/community

2. Install and start MongoDB:
   ```bash
   # Start MongoDB service
   net start MongoDB
   ```

### 2. Install Redis

1. Download Redis for Windows:
   - https://github.com/microsoftarchive/redis/releases

2. Install and start Redis:
   ```bash
   redis-server
   ```

### 3. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Update .env file with local MongoDB and Redis URLs
# MONGODB_URL=mongodb://localhost:27017
# REDIS_URL=redis://localhost:6379/0

# Run backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 4. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Run frontend
npm run dev
```

---

## Firewall Configuration

If you can't access the application:

1. **Allow Docker through Windows Firewall:**
   - Open Windows Defender Firewall
   - Click "Allow an app through firewall"
   - Find "Docker Desktop" and check both Private and Public
   - Click OK

2. **Or disable firewall temporarily for testing** (not recommended for production)

---

## Performance Tips for Windows

1. **Use WSL 2 backend** (faster than Hyper-V):
   - Docker Desktop → Settings → General
   - Enable "Use the WSL 2 based engine"

2. **Allocate more resources**:
   - Docker Desktop → Settings → Resources
   - Increase CPU and Memory

3. **Enable file sharing**:
   - Docker Desktop → Settings → Resources → File Sharing
   - Add your project directory

4. **Keep Docker Desktop updated**:
   - Regularly check for updates in Docker Desktop

---

## Troubleshooting Checklist

Before asking for help, verify:

- [ ] Docker Desktop is installed and running
- [ ] You can run `docker ps` without errors
- [ ] Docker Desktop shows no error icons
- [ ] Ports 5173, 8000, 27017, 6379 are not in use
- [ ] You ran commands from the correct directory
- [ ] You have enough disk space (at least 5 GB free)
- [ ] Windows Defender/Antivirus is not blocking Docker

---

## Getting Help

If you still have issues:

1. **Check Docker Desktop logs:**
   - Docker Desktop → Troubleshoot → View Logs

2. **Share error messages** including:
   - Full error output
   - Docker Desktop version
   - Windows version
   - Output of `docker-compose ps`

3. **Create an issue** with:
   - Error description
   - Steps to reproduce
   - Your environment details

---

## Quick Start Command (Copy-Paste)

```bash
# Navigate to project
cd D:\aryan-labs\Atw_Client\atw_client

# Ensure Docker Desktop is running
docker ps

# Start application
docker-compose up -d

# Wait 30 seconds for services to start, then open:
# http://localhost:5173
```

---

**Happy coding on Windows! 🪟🚀**
