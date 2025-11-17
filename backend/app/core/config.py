"""
Application configuration settings
"""
from pydantic_settings import BaseSettings
from pydantic import field_validator
from typing import List, Any
import os
import json


class Settings(BaseSettings):
    """Application settings"""

    # Application
    APP_NAME: str = "Aryan Tech World - Client Management System"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True
    ENVIRONMENT: str = "development"

    # Server
    HOST: str = "0.0.0.0"
    PORT: int = 8000

    # MongoDB
    MONGODB_URL: str = "mongodb://localhost:27017"
    MONGODB_DB_NAME: str = "aryan_tech_db"
    MONGODB_MIN_POOL_SIZE: int = 2
    MONGODB_MAX_POOL_SIZE: int = 10

    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"

    # JWT
    SECRET_KEY: str = "your-secret-key-change-this-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15  # Reduced from 30 for better security
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # CORS
    CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:5173"]

    @field_validator('CORS_ORIGINS', mode='before')
    @classmethod
    def parse_cors_origins(cls, v: Any) -> List[str]:
        """Parse CORS origins from string or list"""
        if isinstance(v, str):
            try:
                # Try parsing as JSON array
                return json.loads(v)
            except json.JSONDecodeError:
                # Fall back to comma-separated values
                return [origin.strip() for origin in v.split(',') if origin.strip()]
        return v

    @field_validator('SECRET_KEY')
    @classmethod
    def validate_secret_key(cls, v: str, info) -> str:
        """Validate SECRET_KEY is production-ready"""
        environment = info.data.get('ENVIRONMENT', 'development')

        if v == "your-secret-key-change-this-in-production":
            if environment == "production":
                raise ValueError(
                    "SECRET_KEY must be changed from default value in production. "
                    "Generate: python -c 'import secrets; print(secrets.token_hex(32))'"
                )

        if len(v) < 32:
            raise ValueError("SECRET_KEY must be at least 32 characters")

        return v

    @field_validator('DEBUG')
    @classmethod
    def validate_debug_mode(cls, v: bool, info) -> bool:
        """Ensure DEBUG is False in production"""
        environment = info.data.get('ENVIRONMENT', 'development')

        if environment == "production" and v:
            raise ValueError("DEBUG must be False in production environment")

        return v

    @field_validator('CORS_ORIGINS')
    @classmethod
    def validate_cors_production(cls, v: List[str], info) -> List[str]:
        """Validate CORS origins for production"""
        environment = info.data.get('ENVIRONMENT', 'development')

        if environment == "production":
            localhost_patterns = ["localhost", "127.0.0.1", "0.0.0.0"]
            for origin in v:
                if any(pattern in origin for pattern in localhost_patterns):
                    raise ValueError(
                        f"CORS origin '{origin}' contains localhost in production. "
                        "Use production domains only."
                    )

        return v

    # Email
    SENDGRID_API_KEY: str = ""
    FROM_EMAIL: str = "noreply@aryantechworld.com"

    # SMS
    TWILIO_ACCOUNT_SID: str = ""
    TWILIO_AUTH_TOKEN: str = ""
    TWILIO_PHONE_NUMBER: str = ""

    # File Upload
    UPLOAD_DIR: str = "./uploads"
    MAX_UPLOAD_SIZE: int = 10485760  # 10MB

    # AWS S3
    AWS_ACCESS_KEY_ID: str = ""
    AWS_SECRET_ACCESS_KEY: str = ""
    AWS_REGION: str = "ap-south-1"
    S3_BUCKET_NAME: str = ""

    # Payment
    RAZORPAY_KEY_ID: str = ""
    RAZORPAY_KEY_SECRET: str = ""

    # Monitoring
    SENTRY_DSN: str = ""

    # Celery
    CELERY_BROKER_URL: str = "redis://localhost:6379/0"
    CELERY_RESULT_BACKEND: str = "redis://localhost:6379/0"

    class Config:
        env_file = ".env"
        case_sensitive = True


# Global settings instance
settings = Settings()
