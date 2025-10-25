#!/usr/bin/env python3
"""
Start the DreamPool backend server
"""
import os
import sys
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Check if OpenAI API key is set
if not os.getenv("OPENAI_API_KEY"):
    print("❌ Error: OPENAI_API_KEY not found in environment variables")
    print("Please set your OpenAI API key in the .env file")
    print("Example: OPENAI_API_KEY=your_openai_api_key_here")
    sys.exit(1)

print("🚀 Starting DreamPool Backend Server...")
print("=" * 50)

try:
    import uvicorn
    from main import app
    
    print("✅ All dependencies loaded successfully")
    print("🌐 Server will be available at: http://localhost:8000")
    print("📚 API documentation at: http://localhost:8000/docs")
    print("\nPress Ctrl+C to stop the server")
    print("-" * 50)
    
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
    
except ImportError as e:
    print(f"❌ Missing dependency: {e}")
    print("Please install requirements: pip install -r requirements.txt")
    sys.exit(1)
except Exception as e:
    print(f"❌ Error starting server: {e}")
    sys.exit(1)
