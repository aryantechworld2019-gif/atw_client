"""
Main FastAPI application
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
from app.core.config import settings
from app.core.database import connect_to_mongo, close_mongo_connection
from app.middleware.security import SecurityHeadersMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from app.core.rate_limit import limiter
import logging
from pythonjsonlogger import jsonlogger

# Configure structured logging
logHandler = logging.StreamHandler()
if settings.ENVIRONMENT == "production":
    # Use JSON logging in production
    formatter = jsonlogger.JsonFormatter(
        '%(asctime)s %(name)s %(levelname)s %(message)s'
    )
else:
    # Use standard logging in development
    formatter = logging.Formatter(
        "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    )

logHandler.setFormatter(formatter)
logger = logging.getLogger()
logger.addHandler(logHandler)
logger.setLevel(logging.INFO if settings.DEBUG else logging.WARNING)

logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Client Project & Maintenance Management System",
    docs_url="/api/docs" if settings.DEBUG else None,
    redoc_url="/api/redoc" if settings.DEBUG else None,
)

# Add rate limiter
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Add security headers middleware
app.add_middleware(SecurityHeadersMiddleware)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["X-Total-Count", "X-Page", "X-Per-Page"],
)


@app.on_event("startup")
async def startup_event():
    """
    Execute on application startup
    """
    logger.info(f"🚀 Starting {settings.APP_NAME} v{settings.APP_VERSION}")
    logger.info(f"Environment: {settings.ENVIRONMENT}")

    # Connect to MongoDB
    await connect_to_mongo()

    logger.info("✅ Application startup complete")


@app.on_event("shutdown")
async def shutdown_event():
    """
    Execute on application shutdown
    """
    logger.info("Shutting down application...")

    # Close MongoDB connection
    await close_mongo_connection()

    logger.info("✅ Application shutdown complete")


@app.get("/")
async def root():
    """
    Root endpoint
    """
    return {
        "message": "Welcome to Aryan Tech World - Client Management System API",
        "version": settings.APP_VERSION,
        "docs": "/api/docs" if settings.DEBUG else "Documentation disabled in production"
    }


@app.get("/health")
async def health_check():
    """
    Basic health check endpoint - liveness probe
    """
    return {
        "status": "healthy",
        "version": settings.APP_VERSION,
        "environment": settings.ENVIRONMENT
    }


@app.get("/health/live")
async def liveness_check():
    """
    Kubernetes liveness probe
    """
    return {"status": "alive"}


@app.get("/health/ready")
async def readiness_check():
    """
    Kubernetes readiness probe - checks dependencies
    """
    from app.core.database import db

    try:
        # Check MongoDB connection
        await db.client.admin.command('ping')

        # TODO: Add Redis check when implemented
        # await redis.ping()

        return {
            "status": "ready",
            "mongodb": "connected",
            "version": settings.APP_VERSION
        }
    except Exception as e:
        logger.error(f"Readiness check failed: {e}")
        return JSONResponse(
            status_code=503,
            content={
                "status": "not_ready",
                "error": "Database connection failed" if not settings.DEBUG else str(e)
            }
        )


@app.get("/api/v1")
async def api_info():
    """
    API information
    """
    return {
        "message": "Aryan Tech World API v1",
        "endpoints": {
            "auth": "/api/v1/auth",
            "users": "/api/v1/users",
            "clients": "/api/v1/clients",
            "queries": "/api/v1/queries",
            "developers": "/api/v1/developers",
            "maintenance": "/api/v1/maintenance",
            "payments": "/api/v1/payments",
            "invoices": "/api/v1/invoices",
            "time-logs": "/api/v1/time-logs",
        }
    }


# Error handlers
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """
    Global exception handler
    """
    logger.error(f"Unhandled exception: {exc}", exc_info=True)

    return JSONResponse(
        status_code=500,
        content={
            "detail": "Internal server error" if not settings.DEBUG else str(exc)
        }
    )


# Import and include routers
from app.api.endpoints import auth, clients, queries, developers, maintenance, payments, invoices, time_logs, notifications, audit_logs, users
app.include_router(auth.router, prefix="/api/v1/auth", tags=["Authentication"])
app.include_router(users.router, prefix="/api/v1/users", tags=["Users"])
app.include_router(clients.router, prefix="/api/v1/clients", tags=["Clients"])
app.include_router(queries.router, prefix="/api/v1/queries", tags=["Queries"])
app.include_router(developers.router, prefix="/api/v1/developers", tags=["Developers"])
app.include_router(maintenance.router, prefix="/api/v1/maintenance", tags=["Maintenance Packages"])
app.include_router(payments.router, prefix="/api/v1/payments", tags=["Payments"])
app.include_router(invoices.router, prefix="/api/v1/invoices", tags=["Invoices"])
app.include_router(time_logs.router, prefix="/api/v1/time-logs", tags=["Time Logs"])
app.include_router(notifications.router, prefix="/api/v1/notifications", tags=["Notifications"])
app.include_router(audit_logs.router, prefix="/api/v1/audit-logs", tags=["Audit Logs"])


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG
    )
