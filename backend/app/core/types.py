"""
Custom types for Pydantic models
"""
from typing import Any
from bson import ObjectId as BsonObjectId
from pydantic import GetCoreSchemaHandler
from pydantic_core import core_schema


class PyObjectId(BsonObjectId):
    """
    Custom ObjectId type for Pydantic v2
    """

    @classmethod
    def __get_pydantic_core_schema__(
        cls, source_type: Any, handler: GetCoreSchemaHandler
    ) -> core_schema.CoreSchema:
        """
        Generate Pydantic core schema for ObjectId validation
        """
        return core_schema.union_schema(
            [
                # Check if it's an instance of ObjectId
                core_schema.is_instance_schema(BsonObjectId),
                # Validate string and convert to ObjectId
                core_schema.chain_schema(
                    [
                        core_schema.str_schema(),
                        core_schema.no_info_plain_validator_function(cls.validate),
                    ]
                ),
            ],
            serialization=core_schema.plain_serializer_function_ser_schema(
                lambda x: str(x)
            ),
        )

    @classmethod
    def validate(cls, v: Any) -> BsonObjectId:
        """
        Validate and convert to ObjectId
        """
        if isinstance(v, BsonObjectId):
            return v
        if isinstance(v, str):
            try:
                return BsonObjectId(v)
            except Exception as e:
                raise ValueError(f"Invalid ObjectId: {e}")
        raise ValueError(f"Invalid ObjectId type: {type(v)}")
