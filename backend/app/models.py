from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text, Enum, JSON
from sqlalchemy.orm import relationship, declarative_base
from sqlalchemy.dialects.postgresql import JSONB
import enum

Base = declarative_base()

class SubscriptionPlanEnum(enum.Enum):
    Free = "Free"
    Premium = "Premium"

class RelationshipTierEnum(enum.Enum):
    Intimate = "Intimate"
    Best = "Best"
    Good = "Good"
    Tribe = "Tribe"

class MessageStatusEnum(enum.Enum):
    Sent = "Sent"
    Delivered = "Delivered"
    Read = "Read"

class RSVPStatusEnum(enum.Enum):
    Accepted = "Accepted"
    Declined = "Declined"
    Pending = "Pending"

class AIPromptTypeEnum(enum.Enum):
    Reminder = "Reminder"
    Conversation = "Conversation"

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    name = Column(String, nullable=False)
    profile_picture = Column(String, nullable=True)
    subscription_plan = Column(Enum(SubscriptionPlanEnum), default=SubscriptionPlanEnum.Free)
    created_at = Column(DateTime)
    contacts = relationship("Contact", back_populates="user")
    messages_sent = relationship("Message", back_populates="sender", foreign_keys='Message.sender_id')
    messages_received = relationship("Message", back_populates="receiver", foreign_keys='Message.receiver_id')
    events = relationship("CalendarEvent", back_populates="user")
    subscriptions = relationship("Subscription", back_populates="user")
    prompts = relationship("AIPrompt", back_populates="user")

class Contact(Base):
    __tablename__ = "contacts"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String, nullable=False)
    relationship_tier = Column(Enum(RelationshipTierEnum), nullable=False)
    photo = Column(String, nullable=True)
    last_interacted_at = Column(DateTime, nullable=True)
    important_dates = Column(JSONB, nullable=True)
    notes = Column(Text, nullable=True)
    user = relationship("User", back_populates="contacts")
    interactions = relationship("Interaction", back_populates="contact")
    prompts = relationship("AIPrompt", back_populates="contact")

class Message(Base):
    __tablename__ = "messages"
    id = Column(Integer, primary_key=True, index=True)
    sender_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    receiver_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    content = Column(Text, nullable=False)
    status = Column(Enum(MessageStatusEnum), default=MessageStatusEnum.Sent)
    created_at = Column(DateTime)
    sender = relationship("User", back_populates="messages_sent", foreign_keys=[sender_id])
    receiver = relationship("User", back_populates="messages_received", foreign_keys=[receiver_id])

class Interaction(Base):
    __tablename__ = "interactions"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    contact_id = Column(Integer, ForeignKey("contacts.id"), nullable=False)
    type = Column(String, nullable=False)  # Call or Meetup
    timestamp = Column(DateTime, nullable=False)
    notes = Column(Text, nullable=True)
    contact = relationship("Contact", back_populates="interactions")

class CalendarEvent(Base):
    __tablename__ = "events"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    start_time = Column(DateTime, nullable=False)
    end_time = Column(DateTime, nullable=False)
    location = Column(String, nullable=True)
    shareable_link = Column(String, nullable=True)
    description = Column(Text, nullable=True)
    user = relationship("User", back_populates="events")
    rsvps = relationship("RSVP", back_populates="event")

class RSVP(Base):
    __tablename__ = "rsvps"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    event_id = Column(Integer, ForeignKey("events.id"), nullable=False)
    status = Column(Enum(RSVPStatusEnum), default=RSVPStatusEnum.Pending)
    user = relationship("User")
    event = relationship("CalendarEvent", back_populates="rsvps")

class AIPrompt(Base):
    __tablename__ = "ai_prompts"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    contact_id = Column(Integer, ForeignKey("contacts.id"), nullable=True)
    type = Column(Enum(AIPromptTypeEnum), nullable=False)
    content = Column(Text, nullable=False)
    used = Column(Boolean, default=False)
    user = relationship("User", back_populates="prompts")
    contact = relationship("Contact", back_populates="prompts")

class Subscription(Base):
    __tablename__ = "subscriptions"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    plan = Column(Enum(SubscriptionPlanEnum), default=SubscriptionPlanEnum.Free)
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=True)
    user = relationship("User", back_populates="subscriptions")
