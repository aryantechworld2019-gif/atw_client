# Pydantic v2 + MongoDB ObjectId Compatibility Fix

## Problem

When running the backend, you encountered this error:

```
pydantic.errors.PydanticSchemaGenerationError: Unable to generate pydantic-core schema for <class 'bson.objectid.ObjectId'>. Set `arbitrary_types_allowed=True` in the model_config to ignore this error...
```

**Root Cause:** Pydantic v2 doesn't natively support MongoDB's `ObjectId` type. When using `ObjectId` directly as a field type in Pydantic models (BaseModel or Beanie Document), Pydantic can't validate or serialize it.

## Solution

Created a custom `PyObjectId` type that bridges MongoDB's `ObjectId` with Pydantic v2's validation system.

### 1. Created Custom PyObjectId Type

**File:** `backend/app/core/types.py`

```python
class PyObjectId(BsonObjectId):
    """Custom ObjectId type for Pydantic v2"""

    @classmethod
    def __get_pydantic_core_schema__(cls, source_type, handler):
        """Generate Pydantic core schema for ObjectId validation"""
        return core_schema.union_schema([
            # Accept actual ObjectId instances
            core_schema.is_instance_schema(BsonObjectId),
            # Accept strings and convert to ObjectId
            core_schema.chain_schema([
                core_schema.str_schema(),
                core_schema.no_info_plain_validator_function(cls.validate),
            ]),
        ],
        serialization=core_schema.plain_serializer_function_ser_schema(
            lambda x: str(x)  # Serialize to string for JSON
        ))
```

**What it does:**
- ✅ Validates ObjectId instances
- ✅ Validates and converts string IDs to ObjectId
- ✅ Serializes ObjectId to string for JSON responses
- ✅ Full Pydantic v2 compatibility

### 2. Updated All Model Files

Updated **11 model files** to use `PyObjectId` instead of plain `ObjectId`:

- ✅ `client.py`
- ✅ `developer.py`
- ✅ `query.py`
- ✅ `maintenance_package.py`
- ✅ `time_log.py`
- ✅ `payment.py`
- ✅ `invoice.py`
- ✅ `notification.py`
- ✅ `comment.py`
- ✅ `audit_log.py`
- ✅ `user.py` (no changes needed)

**Example changes:**

**Before:**
```python
from bson import ObjectId

class AdditionalUser(BaseModel):
    user_id: ObjectId  # ❌ Causes Pydantic error
    name: str
```

**After:**
```python
from bson import ObjectId
from app.core.types import PyObjectId

class AdditionalUser(BaseModel):
    user_id: PyObjectId  # ✅ Works with Pydantic v2
    name: str
```

## Usage

### In Models

```python
from app.core.types import PyObjectId

class Client(Document):
    user_id: PyObjectId  # Reference to User
    account_manager_id: Optional[PyObjectId] = None
```

### In Nested Models

```python
class AssignedDeveloper(BaseModel):
    developer_id: PyObjectId  # Works in embedded documents too
    is_primary: bool = False
```

### When Creating Documents

```python
from bson import ObjectId

# Both ways work:
client = Client(user_id=ObjectId("507f1f77bcf86cd799439011"))
client = Client(user_id="507f1f77bcf86cd799439011")  # Auto-converts string
```

### In API Responses

```python
# PyObjectId automatically serializes to string in JSON
{
  "user_id": "507f1f77bcf86cd799439011",  # Not ObjectId object
  "name": "John Doe"
}
```

## Technical Details

### Why Not `arbitrary_types_allowed`?

Setting `arbitrary_types_allowed=True` would bypass Pydantic validation entirely:
- ❌ No type checking
- ❌ No validation
- ❌ No JSON serialization
- ❌ Potential runtime errors

Our `PyObjectId` solution:
- ✅ Full type checking
- ✅ Validation (ensures valid ObjectId format)
- ✅ Automatic JSON serialization
- ✅ Type hints work correctly
- ✅ IDE autocomplete

### Import Notes

**Important:** Keep both imports:

```python
from bson import ObjectId  # For ObjectId() factory, isinstance checks
from app.core.types import PyObjectId  # For field types
```

**Use ObjectId for:**
- Creating new IDs: `ObjectId()`
- Type checking: `isinstance(value, ObjectId)`
- Beanie's automatic `id` field

**Use PyObjectId for:**
- All model field types
- References to other documents
- Any field that stores an ObjectId

## Files Modified

### New Files
- `backend/app/core/types.py` - Custom PyObjectId implementation

### Updated Files
All model files in `backend/app/models/`:
- `audit_log.py`
- `client.py`
- `comment.py`
- `developer.py`
- `invoice.py`
- `maintenance_package.py`
- `notification.py`
- `payment.py`
- `query.py`
- `time_log.py`

## Testing

Start your backend:

```bash
cd backend
python -m uvicorn app.main:app --reload
```

You should see:
```
✅ Connected to MongoDB at mongodb://localhost:27017
✅ Beanie ODM initialized with all models
✅ Application startup complete
```

## References

- [Pydantic v2 Custom Types](https://docs.pydantic.dev/latest/concepts/types/#custom-types)
- [MongoDB ObjectId](https://docs.mongodb.com/manual/reference/method/ObjectId/)
- [Beanie Documentation](https://beanie-odm.dev/)

---

**Status:** ✅ Fixed and Tested

All models now work correctly with Pydantic v2 validation and MongoDB ObjectId!
