#!/bin/bash

# DreamPool Development Startup Script

echo "🚀 Starting DreamPool Development Environment..."

# Check if we're in the right directory
if [ ! -f "README.md" ]; then
    echo "❌ Please run this script from the DreamPool root directory"
    exit 1
fi

# Start backend
echo "📡 Starting backend server..."
cd backend
if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    python -m venv venv
fi

source venv/bin/activate
pip install -r requirements.txt > /dev/null 2>&1

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "⚠️  Backend .env file not found. Please create it from env.example"
    echo "   cp env.example .env"
    echo "   Then add your OpenAI API key"
fi

python main.py &
BACKEND_PID=$!

# Start frontend
echo "🎨 Starting frontend server..."
cd ../frontend

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies..."
    npm install
fi

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "⚠️  Frontend .env.local file not found. Please create it from .env.example"
    echo "   cp .env.example .env.local"
    echo "   Then add your Openfort API key"
fi

npm run dev &
FRONTEND_PID=$!

echo ""
echo "✅ DreamPool is starting up!"
echo "📡 Backend: http://localhost:8000"
echo "🎨 Frontend: http://localhost:5173"
echo ""
echo "Press Ctrl+C to stop both servers"

# Wait for user to stop
trap "echo '🛑 Stopping servers...'; kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait
