"""
Application Entry Point
Run this file to start the FastAPI server
"""

import uvicorn
from app.config import RESULTS_DIR

if __name__ == "__main__":
    print("🚀 Starting Bag Virtual Try-On Demo...")
    print(f"📂 Results directory: {RESULTS_DIR.absolute()}")
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
