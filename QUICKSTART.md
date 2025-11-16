# Quick Start Guide

Get up and running in 5 minutes!

## Prerequisites

- Docker and Docker Compose installed
- 8GB RAM minimum
- Ports 5173, 8000, 27017, and 6379 available

## Step 1: Clone & Setup

```bash
# Clone the repository
git clone <repository-url>
cd atw_client

# Run setup script
chmod +x setup.sh
./setup.sh
```

## Step 2: Start Services

```bash
# Start all services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f
```

## Step 3: Access Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/api/docs

## Step 4: Create First User

1. Open http://localhost:5173/register
2. Fill in the registration form:
   - Full Name: Your Name
   - Email: your@email.com
   - Password: (minimum 8 characters)
3. Click "Create Account"
4. You'll be redirected to the dashboard

## Default Credentials (for testing)

You can create a test user through the registration form or use the API:

```bash
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@test.com",
    "password": "admin123456",
    "full_name": "Test Admin",
    "role": "SUPER_ADMIN"
  }'
```

## Common Commands

### Stop Services
```bash
docker-compose down
```

### Restart Services
```bash
docker-compose restart
```

### View Specific Service Logs
```bash
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mongodb
```

### Access MongoDB Shell
```bash
docker exec -it atw_mongodb mongosh
```

### Access Backend Container
```bash
docker exec -it atw_backend bash
```

## Troubleshooting

### Frontend can't connect to backend
- Check if backend is running: `docker-compose ps`
- Check backend logs: `docker-compose logs backend`
- Verify VITE_API_BASE_URL in frontend/.env

### MongoDB connection error
- Ensure MongoDB container is running: `docker-compose ps mongodb`
- Check MongoDB logs: `docker-compose logs mongodb`
- Verify MONGODB_URL in backend/.env

### Port already in use
- Check what's using the port: `lsof -i :5173` (or 8000, 27017, 6379)
- Stop the conflicting service or change the port in docker-compose.yml

## Next Steps

1. Explore the API documentation at http://localhost:8000/api/docs
2. Create your first client
3. Submit a query
4. Explore the dashboard

## Support

For issues or questions:
- Check the main README.md
- Review the API documentation
- Create an issue in the repository

---

**Happy coding! 🚀**
