# Bag Virtual Try-On Demo

A minimal single-page demo app for virtual bag try-on and video ad generation using FastAPI and vanilla HTML/JavaScript.

## Features

- 📸 Upload model and bag images
- ✨ Generate virtual try-on images (placeholder for Google Imagen 3)
- 🎬 Generate video ads (placeholder for Google Veo 3)
- 🔐 Secure API key management via .env file
- 🚀 Simple and fast deployment

## Tech Stack

- **Backend**: FastAPI (Python)
- **Frontend**: Single HTML page with vanilla JavaScript
- **Styling**: Inline CSS
- **Storage**: Local filesystem
- **Config**: Environment variables via .env

## Project Structure

```
bag video creation demo/
├── main.py                 # FastAPI backend
├── templates/
│   └── index.html         # Frontend UI
├── static/
│   └── results/           # Generated images/videos
├── requirements.txt       # Python dependencies
├── .env.example          # Environment template
└── .env                  # Your API keys (create this)
```

## Setup Instructions

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

### 2. Configure Google Cloud Credentials

Copy the example environment file:

```bash
cp .env.example .env
```

**Option A: Service Account (Recommended for production)**

1. Create a service account in Google Cloud Console:
   - Go to: https://console.cloud.google.com/iam-admin/serviceaccounts
   - Create a new service account with appropriate permissions
   - Download the JSON key file
   
2. Edit `.env` and add the path to your service account file:
```
GOOGLE_SERVICE_ACCOUNT_FILE=path/to/your-service-account.json
```

**Option B: API Key (Quick testing)**

1. Get your API key from: https://ai.google.dev/
2. Edit `.env` and add:
```
GEMINI_API_KEY=your_actual_api_key_here
```

### 3. Run the Application

```bash
python main.py
```

Or using uvicorn directly:
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 4. Open in Browser

Navigate to: http://localhost:8000

## Usage

1. **Upload Images**
   - Click "Choose Model Image" to upload a photo of a person
   - Click "Choose Bag Image" to upload a photo of a bag

2. **Generate Try-On**
   - Click "Generate Virtual Try-On" button
   - Wait for the AI to process (currently placeholder)
   - View the generated try-on image

3. **Generate Video**
   - After try-on generation, click "Generate Video Ad"
   - Wait for video processing (currently placeholder)
   - Watch the generated video ad

## API Endpoints

### `GET /`
Serves the main HTML interface

### `POST /generate-tryon`
Generates virtual try-on image
- **Input**: `model_image` (file), `bag_image` (file)
- **Output**: `{ "success": true, "tryon_image_url": "..." }`

### `POST /generate-video`
Generates video ad from try-on image
- **Input**: `tryon_image_url` (form data)
- **Output**: `{ "success": true, "video_url": "..." }`

### `GET /health`
Health check endpoint
- **Output**: 
```json
{
  "status": "healthy",
  "google_service_account_configured": true,
  "gemini_api_key_configured": false,
  "authentication_method": "service_account"
}
```

## AI Integration (TODO)

### Google Imagen 3 Integration
Currently using placeholder images. To integrate:

1. Install Google AI SDK:
   ```bash
   pip install google-generativeai
   ```

2. Update `generate_tryon_image()` function in `main.py`
3. Use Imagen 3 API with your GEMINI_API_KEY
4. Reference: https://ai.google.dev/gemini-api/docs/imagen

### Google Veo 3 Integration
Currently using placeholder videos. To integrate:

1. Use the same Google AI SDK
2. Update `generate_video_from_image()` function in `main.py`
3. Use Veo 3 API for video generation
4. Reference: https://ai.google.dev/gemini-api/docs/veo

## Security Notes

- ✅ Supports Google Service Account authentication (recommended)
- ✅ API keys stored in .env file (not committed to git)
- ✅ Service account JSON files excluded from git
- ✅ Environment variables loaded securely
- ✅ Uses GOOGLE_APPLICATION_CREDENTIALS standard
- ⚠️ No user authentication (demo only)
- ⚠️ Files stored locally (use cloud storage for production)

## Development

To run in development mode with auto-reload:

```bash
uvicorn main:app --reload
```

## Production Considerations

For production deployment:
- Add authentication/authorization
- Use cloud storage (S3, GCS) for generated files
- Add rate limiting
- Implement proper error handling
- Add logging and monitoring
- Use HTTPS
- Add CORS configuration
- Scale with multiple workers

## License

MIT License - Demo purposes only
