#!/bin/bash

echo "Deploying tutoring application to Vercel..."

# Install Vercel CLI if not already installed
if ! command -v vercel &> /dev/null
then
    echo "Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Check if user is logged in to Vercel
vercel whoami &> /dev/null
if [ $? -ne 0 ]; then
    echo "You are not logged in to Vercel. Please log in:"
    vercel login
fi

# Make sure all changes are committed
git status
echo "Make sure all your changes are committed before deploying."
read -p "Continue with deployment? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]
then
    echo "Deployment cancelled."
    exit 1
fi

# Deploy to production
echo "Deploying to Vercel..."
vercel --prod

echo "Deployment complete! Your app should be available on Vercel." 