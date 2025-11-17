"""
Environment and input validation utilities
"""
from pydantic import validator, field_validator
from typing import Any
import re
import os


def validate_secret_key(v: str) -> str:
    """Validate SECRET_KEY is production-ready"""
    if v == "your-secret-key-change-this-in-production":
        if os.getenv("ENVIRONMENT", "development") == "production":
            raise ValueError(
                "SECRET_KEY must be changed from default value in production. "
                "Generate a secure key using: python -c 'import secrets; print(secrets.token_hex(32))'"
            )
    if len(v) < 32:
        raise ValueError("SECRET_KEY must be at least 32 characters for security")
    return v


def validate_debug_mode(debug: bool, environment: str) -> bool:
    """Ensure DEBUG is False in production"""
    if environment == "production" and debug:
        raise ValueError("DEBUG must be False in production environment")
    return debug


def validate_cors_origins(origins: list) -> list:
    """Validate CORS origins don't include localhost in production"""
    if os.getenv("ENVIRONMENT", "development") == "production":
        localhost_patterns = ["localhost", "127.0.0.1", "0.0.0.0"]
        for origin in origins:
            if any(pattern in origin for pattern in localhost_patterns):
                raise ValueError(
                    f"CORS origin '{origin}' contains localhost in production. "
                    "Use production domains only."
                )
    return origins


def validate_password_strength(password: str) -> bool:
    """
    Validate password meets security requirements

    Requirements:
    - At least 8 characters
    - At least one uppercase letter
    - At least one lowercase letter
    - At least one digit
    - At least one special character
    """
    errors = []

    if len(password) < 8:
        errors.append("Password must be at least 8 characters long")

    if not re.search(r"[A-Z]", password):
        errors.append("Password must contain at least one uppercase letter")

    if not re.search(r"[a-z]", password):
        errors.append("Password must contain at least one lowercase letter")

    if not re.search(r"\d", password):
        errors.append("Password must contain at least one number")

    if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", password):
        errors.append("Password must contain at least one special character (!@#$%^&*(),.?\":{}|<>)")

    if errors:
        raise ValueError(". ".join(errors))

    return True


def sanitize_mongodb_query(query: dict) -> dict:
    """
    Sanitize MongoDB query to prevent NoSQL injection

    Removes any keys starting with $ to prevent operator injection
    """
    return {
        k: sanitize_mongodb_query(v) if isinstance(v, dict) else v
        for k, v in query.items()
        if not k.startswith('$')
    }


def validate_file_upload(filename: str, content: bytes, allowed_extensions: set, max_size: int) -> None:
    """
    Validate file upload

    Args:
        filename: Name of the uploaded file
        content: File content as bytes
        allowed_extensions: Set of allowed file extensions (e.g., {'.jpg', '.pdf'})
        max_size: Maximum file size in bytes

    Raises:
        ValueError: If validation fails
    """
    import os

    # Check extension
    ext = os.path.splitext(filename)[1].lower()
    if ext not in allowed_extensions:
        raise ValueError(
            f"File type '{ext}' not allowed. Allowed types: {', '.join(allowed_extensions)}"
        )

    # Check size
    if len(content) > max_size:
        max_size_mb = max_size / (1024 * 1024)
        raise ValueError(f"File size exceeds maximum allowed size of {max_size_mb:.1f}MB")

    # Check for null bytes (potential attack)
    if b'\x00' in content[:1024]:  # Check first KB
        raise ValueError("File contains invalid content")


def validate_email(email: str) -> bool:
    """Validate email format"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    if not re.match(pattern, email):
        raise ValueError("Invalid email format")
    return True


def validate_phone(phone: str) -> bool:
    """Validate phone number format"""
    # Remove common separators
    cleaned = re.sub(r'[\s\-\(\)]', '', phone)

    # Check if it's a valid phone number (basic validation)
    if not re.match(r'^\+?[1-9]\d{1,14}$', cleaned):
        raise ValueError("Invalid phone number format")

    return True


def sanitize_string_input(value: str, max_length: int = 1000) -> str:
    """
    Sanitize string input to prevent injection attacks

    Args:
        value: Input string to sanitize
        max_length: Maximum allowed length

    Returns:
        Sanitized string
    """
    if len(value) > max_length:
        raise ValueError(f"Input exceeds maximum length of {max_length} characters")

    # Remove null bytes
    value = value.replace('\x00', '')

    # Remove control characters except newline, carriage return, and tab
    value = ''.join(char for char in value if char == '\n' or char == '\r' or char == '\t' or not (0 <= ord(char) < 32))

    return value.strip()
