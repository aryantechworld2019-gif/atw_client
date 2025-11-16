"""
MongoDB database connection and initialization
"""
from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

# Global MongoDB client
mongodb_client: AsyncIOMotorClient = None


async def connect_to_mongo():
    """
    Connect to MongoDB on application startup
    """
    global mongodb_client

    try:
        logger.info("Connecting to MongoDB...")

        mongodb_client = AsyncIOMotorClient(
            settings.MONGODB_URL,
            maxPoolSize=settings.MONGODB_MAX_POOL_SIZE,
            minPoolSize=settings.MONGODB_MIN_POOL_SIZE,
            serverSelectionTimeoutMS=5000,
        )

        # Test connection
        await mongodb_client.admin.command('ping')

        logger.info(f"✅ Connected to MongoDB at {settings.MONGODB_URL}")

        # Initialize Beanie ODM
        # Import models here to avoid circular imports
        from app.models.user import User
        from app.models.client import Client
        from app.models.developer import Developer
        from app.models.query import Query
        from app.models.maintenance_package import MaintenancePackage
        from app.models.time_log import TimeLog
        from app.models.payment import Payment
        from app.models.invoice import Invoice
        from app.models.notification import Notification
        from app.models.comment import Comment
        from app.models.audit_log import AuditLog

        await init_beanie(
            database=mongodb_client[settings.MONGODB_DB_NAME],
            document_models=[
                User,
                Client,
                Developer,
                Query,
                MaintenancePackage,
                TimeLog,
                Payment,
                Invoice,
                Notification,
                Comment,
                AuditLog,
            ]
        )

        logger.info("✅ Beanie ODM initialized with all models")

    except Exception as e:
        logger.error(f"❌ Error connecting to MongoDB: {e}")
        raise


async def close_mongo_connection():
    """
    Close MongoDB connection on application shutdown
    """
    global mongodb_client

    if mongodb_client:
        mongodb_client.close()
        logger.info("❌ MongoDB connection closed")


def get_database():
    """
    Get MongoDB database instance
    """
    return mongodb_client[settings.MONGODB_DB_NAME]
