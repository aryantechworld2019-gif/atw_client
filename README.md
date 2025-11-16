# Aryan Tech World - Client Project & Maintenance Management System

A comprehensive full-stack application for managing client projects, maintenance packages, queries, and billing.

## Tech Stack

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Lucide React** - Icons
- **React Router** - Navigation
- **Zustand** - State management
- **TanStack Query** - Data fetching
- **Axios** - HTTP client

### Backend
- **Python 3.11+** - Programming language
- **FastAPI** - Web framework
- **Motor** - Async MongoDB driver
- **Beanie** - ODM (Object Document Mapper)
- **Pydantic** - Data validation
- **JWT** - Authentication
- **Celery** - Background tasks
- **Redis** - Caching & message broker

### Database
- **MongoDB 7.0** - NoSQL database
- **Redis 7** - Cache & queue

## Project Structure

```
atw_client/
├── frontend/                 # React frontend
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── pages/           # Page components
│   │   │   ├── auth/        # Login, Register
│   │   │   ├── dashboard/   # Dashboard
│   │   │   ├── clients/     # Client management
│   │   │   └── queries/     # Query management
│   │   ├── services/        # API services
│   │   ├── store/           # State management
│   │   ├── types/           # TypeScript types
│   │   ├── utils/           # Utility functions
│   │   ├── App.tsx          # Main app component
│   │   └── main.tsx         # Entry point
│   ├── public/              # Static assets
│   ├── index.html           # HTML template
│   ├── package.json         # Dependencies
│   ├── vite.config.ts       # Vite configuration
│   ├── tailwind.config.js   # Tailwind configuration
│   └── Dockerfile           # Docker configuration
│
├── backend/                 # Python backend
│   ├── app/
│   │   ├── api/
│   │   │   ├── endpoints/   # API routes
│   │   │   └── dependencies/# Dependency injection
│   │   ├── core/
│   │   │   ├── config.py    # Configuration
│   │   │   ├── database.py  # Database connection
│   │   │   └── security.py  # Security utilities
│   │   ├── models/          # MongoDB models
│   │   │   ├── user.py
│   │   │   ├── client.py
│   │   │   ├── query.py
│   │   │   ├── developer.py
│   │   │   ├── maintenance_package.py
│   │   │   ├── time_log.py
│   │   │   ├── payment.py
│   │   │   ├── invoice.py
│   │   │   ├── notification.py
│   │   │   ├── comment.py
│   │   │   └── audit_log.py
│   │   ├── schemas/         # Pydantic schemas
│   │   ├── services/        # Business logic
│   │   ├── utils/           # Utility functions
│   │   └── main.py          # FastAPI app
│   ├── tests/               # Unit tests
│   ├── requirements.txt     # Python dependencies
│   ├── .env.example         # Environment variables template
│   └── Dockerfile           # Docker configuration
│
├── docker-compose.yml       # Docker Compose configuration
└── README.md                # This file
```

## Features

### Core Features
- ✅ User authentication (JWT-based)
- ✅ Client management
- ✅ Query/ticket management
- ✅ Maintenance package management
- ✅ Time tracking & logging
- ✅ Payment & invoicing
- ✅ Real-time notifications
- ✅ Role-based access control (RBAC)
- ✅ Audit logging
- ✅ Background task processing

### User Roles
- **Super Admin** - Full system access
- **Admin** - Manage clients, developers, queries
- **Client Owner** - Manage company account
- **Client User** - Submit queries, view status
- **Developer** - Work on assigned queries

## Quick Start

### Prerequisites
- Docker & Docker Compose (recommended)
- OR
  - Node.js 18+
  - Python 3.11+
  - MongoDB 7.0+
  - Redis 7+

### Option 1: Docker (Recommended)

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd atw_client
   ```

2. **Create environment files**
   ```bash
   # Backend
   cp backend/.env.example backend/.env

   # Frontend
   cp frontend/.env.example frontend/.env
   ```

3. **Start all services**
   ```bash
   docker-compose up -d
   ```

4. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8000
   - API Docs: http://localhost:8000/api/docs

5. **View logs**
   ```bash
   docker-compose logs -f
   ```

### Option 2: Manual Setup

#### Backend Setup

1. **Create virtual environment**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start MongoDB and Redis**
   ```bash
   # Using Docker
   docker run -d -p 27017:27017 --name mongodb mongo:7.0
   docker run -d -p 6379:6379 --name redis redis:7-alpine
   ```

5. **Run the application**
   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

#### Frontend Setup

1. **Install dependencies**
   ```bash
   cd frontend
   npm install
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Run development server**
   ```bash
   npm run dev
   ```

## Environment Variables

### Backend (.env)
```env
# Application
APP_NAME=Aryan Tech World - Client Management System
DEBUG=True
ENVIRONMENT=development

# MongoDB
MONGODB_URL=mongodb://localhost:27017
MONGODB_DB_NAME=aryan_tech_db

# Redis
REDIS_URL=redis://localhost:6379/0

# JWT
SECRET_KEY=your-secret-key-change-in-production
ACCESS_TOKEN_EXPIRE_MINUTES=30

# CORS
CORS_ORIGINS=["http://localhost:5173"]
```

### Frontend (.env)
```env
VITE_API_BASE_URL=http://localhost:8000
```

## API Documentation

Once the backend is running, access the interactive API documentation:

- **Swagger UI**: http://localhost:8000/api/docs
- **ReDoc**: http://localhost:8000/api/redoc

### Key API Endpoints

#### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/refresh` - Refresh access token
- `GET /api/v1/auth/me` - Get current user

#### Clients
- `GET /api/v1/clients` - List all clients
- `POST /api/v1/clients` - Create client
- `GET /api/v1/clients/{id}` - Get client details
- `PUT /api/v1/clients/{id}` - Update client
- `DELETE /api/v1/clients/{id}` - Delete client

#### Queries
- `GET /api/v1/queries` - List queries
- `POST /api/v1/queries` - Create query
- `GET /api/v1/queries/{id}` - Get query details
- `PUT /api/v1/queries/{id}` - Update query
- `POST /api/v1/queries/{id}/comments` - Add comment

## Database Schema

### Collections

1. **users** - User accounts
2. **clients** - Client companies
3. **developers** - Developer profiles
4. **queries** - Support tickets/queries
5. **maintenance_packages** - Maintenance plans
6. **time_logs** - Time tracking
7. **payments** - Payment records
8. **invoices** - Generated invoices
9. **notifications** - User notifications
10. **comments** - Query comments
11. **audit_logs** - System audit trail

See detailed schema in the system diagrams provided.

## Development

### Backend Development

1. **Run tests**
   ```bash
   cd backend
   pytest
   ```

2. **Format code**
   ```bash
   black app/
   ```

3. **Lint code**
   ```bash
   flake8 app/
   mypy app/
   ```

### Frontend Development

1. **Build for production**
   ```bash
   cd frontend
   npm run build
   ```

2. **Lint code**
   ```bash
   npm run lint
   ```

## Docker Commands

### Build and start services
```bash
docker-compose up -d --build
```

### Stop services
```bash
docker-compose down
```

### View logs
```bash
docker-compose logs -f [service_name]
```

### Restart a service
```bash
docker-compose restart [service_name]
```

### Access MongoDB shell
```bash
docker exec -it atw_mongodb mongosh
```

### Access Redis CLI
```bash
docker exec -it atw_redis redis-cli
```

## Production Deployment

### 1. Build Docker images
```bash
docker-compose -f docker-compose.prod.yml build
```

### 2. Set production environment variables
- Update `.env` files with production values
- Set `DEBUG=False`
- Use strong `SECRET_KEY`
- Configure production database URLs

### 3. Deploy to cloud platform
- AWS ECS/EKS
- Google Cloud Run
- DigitalOcean App Platform
- Heroku

## Monitoring

### Health Checks
- Backend: http://localhost:8000/health
- Database: Automatic health checks in docker-compose

### Logging
- Application logs: `docker-compose logs`
- MongoDB logs: Available in MongoDB Atlas (if using)
- Redis logs: Available in container logs

## Troubleshooting

### Common Issues

1. **MongoDB connection failed**
   - Ensure MongoDB is running
   - Check MONGODB_URL in .env
   - Verify network connectivity

2. **Frontend can't connect to backend**
   - Verify VITE_API_BASE_URL is correct
   - Check CORS settings in backend
   - Ensure backend is running

3. **Docker container crashes**
   - Check logs: `docker-compose logs [service]`
   - Verify environment variables
   - Check resource limits

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Write/update tests
5. Submit a pull request

## License

Proprietary - Aryan Tech World

## Support

For issues or questions:
- Create an issue in the repository
- Contact: support@aryantechworld.com

## Roadmap

- [ ] Email notifications
- [ ] SMS notifications
- [ ] File upload for attachments
- [ ] Advanced reporting
- [ ] Mobile app
- [ ] Payment gateway integration (Razorpay/Stripe)
- [ ] Video call integration
- [ ] Knowledge base
- [ ] SLA monitoring & escalation
- [ ] Multi-language support

## Version History

### v1.0.0 (Current)
- Initial release
- Core features implemented
- Docker support
- MongoDB integration
- Authentication system
- Basic UI

---

**Built with ❤️ by Aryan Tech World**
