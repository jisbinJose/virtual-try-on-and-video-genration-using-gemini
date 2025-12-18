"""
Configuration and Environment Setup
Handles Google Cloud credentials, project settings, and directory structure
"""

import os
import json
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Directory Setup
STATIC_DIR = Path("static")
RESULTS_DIR = STATIC_DIR / "results"
TEMPLATES_DIR = Path("templates")

# Create directories if they don't exist
RESULTS_DIR.mkdir(parents=True, exist_ok=True)

# Google Cloud Configuration
GOOGLE_SERVICE_ACCOUNT_FILE = os.getenv("GOOGLE_SERVICE_ACCOUNT_FILE")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

# Global variables for GCP configuration
VERTEX_PROJECT_ID = None
VERTEX_LOCATION = "us-central1"  # Default location for Vertex AI


def initialize_google_credentials():
    """
    Initialize and validate Google Cloud credentials
    Sets up either service account or API key authentication
    """
    global VERTEX_PROJECT_ID
    
    # Check which authentication method is configured
    if GOOGLE_SERVICE_ACCOUNT_FILE:
        service_account_path = Path(GOOGLE_SERVICE_ACCOUNT_FILE)
        if service_account_path.exists():
            print(f"✅ Google Service Account configured: {service_account_path.name}")
            # Set environment variable for Google libraries to use
            os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = str(service_account_path.absolute())
            
            # Extract project_id from service account JSON
            try:
                with open(service_account_path, 'r') as f:
                    service_account_data = json.load(f)
                    VERTEX_PROJECT_ID = service_account_data.get('project_id')
                    print(f"✅ Project ID: {VERTEX_PROJECT_ID}")
                    print(f"✅ Location: {VERTEX_LOCATION}")
            except Exception as e:
                print(f"⚠️  Warning: Could not read project_id from service account: {e}")
        else:
            print(f"⚠️  Warning: Service account file not found at: {GOOGLE_SERVICE_ACCOUNT_FILE}")
    elif GEMINI_API_KEY and GEMINI_API_KEY != "your_gemini_api_key_here":
        print(f"✅ GEMINI_API_KEY loaded: {GEMINI_API_KEY[:10]}...")
        os.environ["GOOGLE_GENAI_API_KEY"] = GEMINI_API_KEY
    else:
        print("⚠️  Warning: No Google credentials found in .env file")
        print("   Please set either GOOGLE_SERVICE_ACCOUNT_FILE or GEMINI_API_KEY")


# Initialize credentials on module import
initialize_google_credentials()
