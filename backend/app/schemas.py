from pydantic import BaseModel, EmailStr, HttpUrl, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum

class SubscriptionPlanEnum(str, Enum):
    Free = "Free"
    Premium = "Premium"

class RelationshipTierEnum(str, Enum):
    Intimate = "Intimate"
    Best = "Best"
    Good = "Good"
    Tribe = "Tribe"

class MessageStatusEnum(str, Enum):
    Sent = "Sent"
    Delivered = "Delivered"
    Read = "Read"

class RSVPStatusEnum(str, Enum):
    Accepted = "Accepted"
    Declined = "Declined"
    Pending = "Pending"

class AIPromptTypeEnum(str, Enum):
    Reminder = "Reminder"
    Conversation = "Conversation"

class UserBase(BaseModel):
    username: str
    email: EmailStr
    name: str
    profilePicture: Optional[HttpUrl] = None
    subscriptionPlan: Optional[SubscriptionPlanEnum] = SubscriptionPlanEnum.Free

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    username: Optional[str]
    email: Optional[EmailStr]
    name: Optional[str]
    profilePicture: Optional[HttpUrl]
    subscriptionPlan: Optional[SubscriptionPlanEnum]
    password: Optional[str]

class UserOut(UserBase):
    id: int
    created_at: Optional[datetime]

    class Config:
        orm_mode = True

class ContactBase(BaseModel):
    name: str
    relationshipTier: RelationshipTierEnum
    photo: Optional[HttpUrl] = None
    lastInteractedAt: Optional[datetime] = None
    importantDates: Optional[Dict[str, Any]] = None
    notes: Optional[str] = None

class ContactCreate(ContactBase):
    userId: int

class ContactUpdate(BaseModel):
    name: Optional[str]
    relationshipTier: Optional[RelationshipTierEnum]
    photo: Optional[HttpUrl]
    lastInteractedAt: Optional[datetime]
    importantDates: Optional[Dict[str, Any]]
    notes: Optional[str]

class ContactOut(ContactBase):
    id: int
    userId: int
    class Config:
        orm_mode = True

class MessageBase(BaseModel):
    content: str
    status: Optional[MessageStatusEnum] = MessageStatusEnum.Sent

class MessageCreate(MessageBase):
    senderId: int
    receiverId: int

class MessageUpdate(BaseModel):
    status: MessageStatusEnum

class MessageOut(MessageBase):
    id: int
    senderId: int
    receiverId: int
    created_at: Optional[datetime]
    class Config:
        orm_mode = True

class InteractionBase(BaseModel):
    userId: int
    contactId: int
    type: str  # Call or Meetup
    timestamp: datetime
    notes: Optional[str] = None

class InteractionCreate(InteractionBase):
    pass

class InteractionOut(InteractionBase):
    id: int
    class Config:
        orm_mode = True

class CalendarEventBase(BaseModel):
    userId: int
    title: str
    startTime: datetime
    endTime: datetime
    location: Optional[str] = None
    shareableLink: Optional[HttpUrl] = None
    description: Optional[str] = None

class CalendarEventCreate(CalendarEventBase):
    pass

class CalendarEventUpdate(BaseModel):
    title: Optional[str]
    startTime: Optional[datetime]
    endTime: Optional[datetime]
    location: Optional[str]
    shareableLink: Optional[HttpUrl]
    description: Optional[str]

class CalendarEventOut(CalendarEventBase):
    id: int
    class Config:
        orm_mode = True

class RSVPBase(BaseModel):
    userId: int
    eventId: int
    status: RSVPStatusEnum = RSVPStatusEnum.Pending

class RSVPCreate(RSVPBase):
    pass

class RSVPUpdate(BaseModel):
    status: RSVPStatusEnum

class RSVPOut(RSVPBase):
    id: int
    class Config:
        orm_mode = True

class AIPromptBase(BaseModel):
    userId: int
    contactId: Optional[int] = None
    type: AIPromptTypeEnum
    content: str
    used: Optional[bool] = False

class AIPromptCreate(AIPromptBase):
    pass

class AIPromptUpdate(BaseModel):
    used: Optional[bool]

class AIPromptOut(AIPromptBase):
    id: int
    class Config:
        orm_mode = True

class SubscriptionBase(BaseModel):
    userId: int
    plan: SubscriptionPlanEnum = SubscriptionPlanEnum.Free
    startDate: datetime
    endDate: Optional[datetime] = None

class SubscriptionCreate(SubscriptionBase):
    pass

class SubscriptionUpdate(BaseModel):
    plan: Optional[SubscriptionPlanEnum]
    startDate: Optional[datetime]
    endDate: Optional[datetime]

class SubscriptionOut(SubscriptionBase):
    id: int
    class Config:
        orm_mode = True
