"""
Comment model - MongoDB document
"""
from beanie import Document
from pydantic import Field, BaseModel
from typing import Optional, List
from datetime import datetime
from bson import ObjectId
from app.core.types import PyObjectId


class Mention(BaseModel):
    """User mention in comment"""
    user_id: PyObjectId
    user_name: str


class CommentAttachment(BaseModel):
    """Comment attachment"""
    file_name: str
    file_url: str
    file_size: int
    uploaded_at: datetime = Field(default_factory=datetime.utcnow)


class Comment(Document):
    """Comment document model"""

    # References
    query_id: PyObjectId
    user_id: PyObjectId
    user_role: str
    user_name: str

    # Comment Content
    comment_text: str
    is_internal: bool = False  # True = visible to admin/developer only

    # Mentions
    mentions: List[Mention] = Field(default_factory=list)

    # Attachments
    attachments: List[CommentAttachment] = Field(default_factory=list)

    # Edited
    is_edited: bool = False
    edited_at: Optional[datetime] = None

    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "comments"
        indexes = [
            [("query_id", 1), ("created_at", -1)],
            "user_id",
        ]

    class Config:
        json_schema_extra = {
            "example": {
                "comment_text": "I've identified the root cause...",
                "is_internal": False
            }
        }

    def __repr__(self) -> str:
        return f"<Comment by {self.user_name}>"
