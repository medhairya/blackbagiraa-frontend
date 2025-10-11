# API Configuration Guide

## Environment Variables

This application uses environment variables to configure the API endpoint.

### Local Development
Create a `.env` file in the frontend directory:
```
VITE_BASE_URL=http://localhost:4000
VITE_ADMIN=/admin
```

### Production (Render Deployment)
Create a `.env.production` file or set environment variables in your hosting platform:
```
VITE_BASE_URL=https://your-backend-app.onrender.com
VITE_ADMIN=/admin
```

### How to Update API URL for Render

1. **Deploy your backend to Render** and get the URL (e.g., `https://your-app-name.onrender.com`)

2. **Update the frontend environment**:
   - For local testing: Update `.env` file with your Render URL
   - For production: Update `.env.production` file or set environment variables in your frontend hosting platform

3. **Restart your frontend** to pick up the new environment variables

### Example Render URLs
- Backend: `https://bagiraa-backend.onrender.com`
- Frontend should use: `VITE_BASE_URL=https://bagiraa-backend.onrender.com`

### Current Configuration
- ✅ API service uses `VITE_BASE_URL` environment variable
- ✅ Currently configured to use Render backend: `https://blackbagiraa-backend.onrender.com`
- ✅ Fallback to `http://localhost:4000` if environment variable is not set
- ✅ All API calls go through the configurable base URL

### Active Backend URL
Your frontend is now configured to use:
**`https://blackbagiraa-backend.onrender.com`**
