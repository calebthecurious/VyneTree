from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import update, delete
from typing import Optional
from datetime import datetime

from app.models import User
from app.schemas import UserCreate, UserUpdate
from app.utils.security import get_password_hash, verify_password

async def get_user_by_email(db: AsyncSession, email: str) -> Optional[User]:
    """Get a user by email"""
    result = await db.execute(select(User).where(User.email == email))
    return result.scalars().first()

async def get_user_by_username(db: AsyncSession, username: str) -> Optional[User]:
    """Get a user by username"""
    result = await db.execute(select(User).where(User.username == username))
    return result.scalars().first()

async def get_user_by_id(db: AsyncSession, user_id: int) -> Optional[User]:
    """Get a user by ID"""
    result = await db.execute(select(User).where(User.id == user_id))
    return result.scalars().first()

async def create_user(db: AsyncSession, user_in: UserCreate) -> User:
    """Create a new user"""
    hashed_password = get_password_hash(user_in.password)
    db_user = User(
        username=user_in.username,
        email=user_in.email,
        password_hash=hashed_password,
        name=user_in.name,
        profile_picture=user_in.profilePicture,
        subscription_plan=user_in.subscriptionPlan,
        created_at=datetime.utcnow()
    )
    db.add(db_user)
    await db.commit()
    await db.refresh(db_user)
    return db_user

async def update_user(db: AsyncSession, user_id: int, user_in: UserUpdate) -> Optional[User]:
    """Update a user's information"""
    user = await get_user_by_id(db, user_id)
    if not user:
        return None
    
    update_data = user_in.dict(exclude_unset=True)
    
    # Hash the password if it's being updated
    if "password" in update_data:
        update_data["password_hash"] = get_password_hash(update_data.pop("password"))
    
    # Convert camelCase to snake_case
    if "profilePicture" in update_data:
        update_data["profile_picture"] = update_data.pop("profilePicture")
    if "subscriptionPlan" in update_data:
        update_data["subscription_plan"] = update_data.pop("subscriptionPlan")
    
    stmt = update(User).where(User.id == user_id).values(**update_data)
    await db.execute(stmt)
    await db.commit()
    
    return await get_user_by_id(db, user_id)

async def authenticate_user(db: AsyncSession, email: str, password: str) -> Optional[User]:
    """Authenticate a user by email and password"""
    user = await get_user_by_email(db, email)
    if not user:
        return None
    if not verify_password(password, user.password_hash):
        return None
    return user
