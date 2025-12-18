"""
Video Generation Service using Google Veo 3.1 Fast
Handles AI-powered video ad creation from try-on images
"""

import os
import time
import uuid
from datetime import datetime
from pathlib import Path
from fastapi import HTTPException
import google.genai as genai
from google.genai import types
from google.oauth2 import service_account

from app.config import VERTEX_PROJECT_ID, VERTEX_LOCATION, RESULTS_DIR


async def generate_video_from_image(tryon_image_path: Path) -> str:
    """
    Video generation using Google Veo 3.1 Fast via Vertex AI SDK
    
    Creates a professional product ad video from the try-on image
    Model: veo-3.1-fast-generate-001 (Google Veo 3.1 Fast - Video Generation)
    
    Uses your exact working code pattern with proper authentication and polling.
    """
    
    print(f"🎥 Generating video ad with Veo 3.1 Fast...")
    
    try:
        # Production video prompt
        VIDEO_PROMPT = (
            "A cinematic medium shot of the fashion model from the reference image posing elegantly "
            "with the handbag, slow zoom in to highlight the bag's premium details. "
            "Professional studio lighting, soft bokeh background, 4k quality, luxury e-commerce advertisement."
        )
        
        # 1. Authenticate with service account
        print(f"   🔑 Authenticating with service account...")
        if not VERTEX_PROJECT_ID:
            raise Exception("Service account not configured. Please check .env file.")
        
        creds = service_account.Credentials.from_service_account_file(
            os.environ["GOOGLE_APPLICATION_CREDENTIALS"],
            scopes=['https://www.googleapis.com/auth/cloud-platform']
        )
        
        # 2. Create client
        client = genai.Client(
            vertexai=True,
            project=VERTEX_PROJECT_ID,
            location=VERTEX_LOCATION,
            credentials=creds
        )
        
        print(f"   ✅ Client initialized successfully")
        print(f"   📸 Reference image: {tryon_image_path}")
        print(f"   🎬 Calling Veo 3.1 Fast API...")
        print(f"   📝 Model: veo-3.1-fast-generate-001")
        
        print("Submitting request with reference image...")
        
        # 4. Generate Video
        operation = client.models.generate_videos(
            model="veo-3.1-fast-generate-001",
            prompt=VIDEO_PROMPT,
            image=types.Image.from_file(location=str(tryon_image_path)),
            config=types.GenerateVideosConfig(
                aspect_ratio="16:9",
                duration_seconds=4,
                number_of_videos=1,
                person_generation="allow_adult",
                resolution="720p",
                audio_config="NO_AUDIO"
            )
        )
        
        # 5. Polling
        print("Generating video...")
        while not operation.done:
            time.sleep(10)
            operation = client.operations.get(operation)
            print(".", end="", flush=True)
        
        print()  # New line after polling dots
        
        # 6. Save Result
        if operation.result and operation.result.generated_videos:
            video_obj = operation.result.generated_videos[0]
            
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            unique_id = str(uuid.uuid4())[:8]
            video_filename = f"video_{timestamp}_{unique_id}.mp4"
            video_path = RESULTS_DIR / video_filename
            
            video_obj.video.save(str(video_path))
            
            print(f"   ✅ Video ad generated: {video_filename}")
            print(f"   💾 Saved to: {video_path}")
            
            return f"/static/results/{video_filename}"
        else:
            print("\nGeneration failed.")
            raise Exception("Video generation failed - no video data in result")
        
    except Exception as e:
        print(f"   ❌ Error during video generation: {str(e)}")
        print(f"   📋 Error type: {type(e).__name__}")
        import traceback
        print(f"   📋 Full traceback:")
        traceback.print_exc()
        
        raise HTTPException(
            status_code=500,
            detail=f"Video generation failed: {str(e)}"
        )
