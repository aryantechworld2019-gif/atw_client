"""
Main FastAPI application
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.core.config import settings
from app.core.database import connect_to_mongo, close_mongo_connection
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO if settings.DEBUG else logging.WARNING,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)

logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Client Project & Maintenance Management System",
    docs_url="/api/docs" if settings.DEBUG else None,
    redoc_url="/api/redoc" if settings.DEBUG else None,
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
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
    Health check endpoint
    """
    return {
        "status": "healthy",
        "version": settings.APP_VERSION,
        "environment": settings.ENVIRONMENT
    }


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
from app.api.endpoints import auth
app.include_router(auth.router, prefix="/api/v1/auth", tags=["Authentication"])
# TODO: Add more routers as they are created
# app.include_router(users.router, prefix="/api/v1/users", tags=["Users"])
# app.include_router(clients.router, prefix="/api/v1/clients", tags=["Clients"])
# app.include_router(queries.router, prefix="/api/v1/queries", tags=["Queries"])


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG
    )
