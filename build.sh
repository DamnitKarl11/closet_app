#!/bin/bash

# Build the frontend
echo "Building frontend..."
cd frontend
npm run build
cd ..

# Collect static files
echo "Collecting static files..."
python manage.py collectstatic --noinput

echo "Build complete!" 