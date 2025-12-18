"""
Main FastAPI Application
Initializes the FastAPI app with all routes and middleware
"""

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

from app.config import STATIC_DIR
from app.routes import router


# Initialize FastAPI app
app = FastAPI(title="Bag Virtual Try-On Demo")

# Mount static files
app.mount("/static", StaticFiles(directory=str(STATIC_DIR)), name="static")

# Include routes
app.include_router(router)


@app.on_event("startup")
async def startup_event():
    """Initialize the application"""
    print("✅ Application started successfully")
