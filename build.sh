#!/usr/bin/env bash
# build.sh - Render build script

set -o errexit  # exit on error

# Install Node.js dependencies and build React app
echo "Building React frontend..."
cd frontend
npm ci
npm run build
cd ..

# Move React build to Django static directory
echo "Moving React build to Django..."
rm -rf backend/staticfiles/react
mkdir -p backend/staticfiles/react
cp -r frontend/build/* backend/staticfiles/react/

# Install Python dependencies
echo "Installing Python dependencies..."
cd backend
pip install -r requirements.txt

# Collect static files
echo "Collecting static files..."
python manage.py collectstatic --no-input

# Run migrations
echo "Running database migrations..."
python manage.py migrate
