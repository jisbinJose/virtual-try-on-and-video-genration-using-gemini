"""
API Routes for Virtual Try-On Application
Handles file uploads and generation endpoints
"""

import shutil
import uuid
from datetime import datetime
from pathlib import Path
from fastapi import APIRouter, File, UploadFile, HTTPException, Form, Request
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates

from app.config import RESULTS_DIR, TEMPLATES_DIR
from app.services.tryon_service import generate_tryon_image
from app.services.video_service import generate_video_from_image

# Initialize router and templates
router = APIRouter()
templates = Jinja2Templates(directory=str(TEMPLATES_DIR))


@router.get("/", response_class=HTMLResponse)
async def index(request: Request):
    """Serve the main HTML page"""
    return templates.TemplateResponse("index.html", {"request": request})


@router.post("/generate-tryon")
async def generate_tryon_endpoint(
    model_image: UploadFile = File(...),
    bag_image: UploadFile = File(...)
):
    """
    Generate a virtual try-on image from model and bag images
    
    This endpoint integrates with Google Imagen 3 (via Gemini API)
    for realistic virtual try-on generation.
    """
    try:
        # Generate unique filenames
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        unique_id = str(uuid.uuid4())[:8]
        
        # Save uploaded images
        model_filename = f"model_{timestamp}_{unique_id}{Path(model_image.filename).suffix}"
        bag_filename = f"bag_{timestamp}_{unique_id}{Path(bag_image.filename).suffix}"
        
        model_path = RESULTS_DIR / model_filename
        bag_path = RESULTS_DIR / bag_filename
        
        # Save files
        with open(model_path, "wb") as buffer:
            shutil.copyfileobj(model_image.file, buffer)
        
        with open(bag_path, "wb") as buffer:
            shutil.copyfileobj(bag_image.file, buffer)
        
        print(f"📁 Saved model image: {model_path}")
        print(f"📁 Saved bag image: {bag_path}")
        
        # Generate try-on image
        tryon_image_url = await generate_tryon_image(model_path, bag_path, unique_id)
        
        return {
            "success": True,
            "tryon_image_url": tryon_image_url,
            "model_image_url": f"/static/results/{model_filename}",
            "bag_image_url": f"/static/results/{bag_filename}"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating try-on: {str(e)}")


@router.post("/generate-video")
async def generate_video_endpoint(tryon_image_url: str = Form(...)):
    """
    Generate an ad-style video from the try-on image
    
    This endpoint integrates with Google Veo 3 (via Gemini API)
    for short-form video generation.
    """
    try:
        # Extract filename from URL
        tryon_filename = Path(tryon_image_url).name
        tryon_path = RESULTS_DIR / tryon_filename
        
        if not tryon_path.exists():
            raise HTTPException(status_code=404, detail="Try-on image not found")
        
        print(f"🎬 Generating video from: {tryon_path}")
        
        # Generate video
        video_url = await generate_video_from_image(tryon_path)
        
        return {
            "success": True,
            "video_url": video_url
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating video: {str(e)}")
