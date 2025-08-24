#!/bin/bash

# Leedz Development Startup Script
# This script starts both backend and frontend servers for development

echo "🚀 Starting Leedz Development Environment..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Please run this script from the project root directory"
    exit 1
fi

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check for required commands
if ! command_exists "npm"; then
    echo "❌ npm is not installed. Please install Node.js and npm first."
    exit 1
fi

# Check for database connection (optional)
echo "🗄️  Checking database connection..."
cd backend
if npm run test-db 2>/dev/null; then
    echo "✅ Database connection OK"
else
    echo "⚠️  Database connection failed - make sure PostgreSQL is running"
fi

# Start backend server
echo "🖥️  Starting backend server..."
cd ../backend
npm run dev &
BACKEND_PID=$!
echo "Backend server started (PID: $BACKEND_PID)"

# Wait a moment for backend to initialize
sleep 3

# Start frontend server
echo "🌐 Starting frontend server..."
cd ../frontend
npm start &
FRONTEND_PID=$!
echo "Frontend server started (PID: $FRONTEND_PID)"

echo ""
echo "🎉 Development environment ready!"
echo "📍 Frontend: http://localhost:3000"
echo "📍 Backend:  http://localhost:3001"
echo "📍 Health:   http://localhost:3001/health"
echo ""
echo "💡 Environment setup tips:"
echo "   • Add Stripe keys to backend/.env and frontend/.env"
echo "   • Run 'node backend/setup-stripe-products.js' to create products"
echo "   • Use ngrok for webhook testing: 'ngrok http 3001'"
echo ""
echo "Press Ctrl+C to stop both servers"

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping development servers..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    echo "✅ Cleanup complete"
    exit 0
}

# Set up trap to cleanup on script exit
trap cleanup SIGINT SIGTERM

# Wait for processes
wait 