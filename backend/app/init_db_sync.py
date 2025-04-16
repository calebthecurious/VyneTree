import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv
from models import Base

# Load environment variables
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '..', '.env'))

# Get Supabase connection string from environment
DB_URL = os.getenv("DATABASE_URL")
if DB_URL and DB_URL.startswith("postgresql+asyncpg://"):
    # Convert asyncpg URL to psycopg2 URL
    DB_URL = DB_URL.replace("postgresql+asyncpg://", "postgresql://")

print(f"Connecting to: {DB_URL}")

# Create engine and session
engine = create_engine(DB_URL)
SessionLocal = sessionmaker(bind=engine)

def init_db():
    try:
        # Create all tables
        Base.metadata.create_all(bind=engine)
        print("Database tables created successfully!")
    except Exception as e:
        print(f"Error creating tables: {e}")

if __name__ == "__main__":
    init_db()
