from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
import os
from dotenv import load_dotenv

from app.database import get_db

# Load environment variables
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '..', '.env'))

# Create FastAPI app
app = FastAPI(
    title="VyneTree API",
    description="Backend API for VyneTree social relationship management application",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# OAuth2 scheme for token-based authentication
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login")

# Root endpoint
@app.get("/")
def root():
    return {"message": "VyneTree API is running"}

# Health check endpoint
@app.get("/api/health")
async def health_check(db: AsyncSession = Depends(get_db)):
    try:
        # Test database connection
        await db.execute("SELECT 1")
        return {"status": "healthy", "database": "connected"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Database connection failed: {str(e)}"
        )

# Import and include routers
# Note: We'll create these router files next
from app.api import auth

@app.on_event("startup")
async def startup_db_client():
    # You can add any startup tasks here
    print("API startup: Database connection initialized")

@app.on_event("shutdown")
async def shutdown_db_client():
    # You can add any cleanup tasks here
    print("API shutdown: Closing database connections")

# Include API routes
# These will be implemented in separate files
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
# app.include_router(users.router, prefix="/api/users", tags=["Users"])
# app.include_router(contacts.router, prefix="/api/contacts", tags=["Contacts"])
# app.include_router(messages.router, prefix="/api/messages", tags=["Messages"])
# app.include_router(interactions.router, prefix="/api/interactions", tags=["Interactions"])
# app.include_router(events.router, prefix="/api/events", tags=["Events"])
# app.include_router(rsvps.router, prefix="/api/rsvps", tags=["RSVPs"])
# app.include_router(prompts.router, prefix="/api/prompts", tags=["AI Prompts"])
# app.include_router(subscriptions.router, prefix="/api/subscriptions", tags=["Subscriptions"])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
