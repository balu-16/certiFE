# Deployment Instructions

## Backend Deployment (Fixed)

Your backend is now properly configured for Vercel deployment. The issue was that Vercel was treating your backend as a static site instead of a Node.js application.

### What was fixed:

1. **Added `vercel.json`** - This tells Vercel how to deploy your Node.js backend
2. **Added `.vercelignore`** - This excludes unnecessary files from deployment
3. **Updated frontend API calls** - Replaced hardcoded `localhost:3001` URLs with configurable `AppConfig.api.baseUrl`

### Backend Files Added:
- `gps-backend/vercel.json` - Vercel deployment configuration
- `gps-backend/.vercelignore` - Files to exclude from deployment

### Frontend Files Updated:
- `src/pages/Login.tsx` - Now uses `AppConfig.api.baseUrl`
- `src/pages/admin/Certificates.tsx` - Now uses `AppConfig.api.baseUrl`
- `src/pages/admin/Requests.tsx` - Now uses `AppConfig.api.baseUrl`

## Deployment Steps:

### 1. Redeploy Backend
1. Go to your Vercel dashboard
2. Redeploy the `gps-backend` folder
3. Your backend should now work properly at `https://interns-ochre.vercel.app`

### 2. Deploy Frontend
1. Deploy the main project folder (containing `src/`) to Vercel
2. In Vercel dashboard, add environment variable:
   - Key: `REACT_APP_API_URL`
   - Value: `https://interns-ochre.vercel.app`

### 3. Set Backend Environment Variables
Make sure your backend has these environment variables set in Vercel:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `JWT_SECRET`
- `EMAIL_USER`
- `EMAIL_PASS`
- `PORT` (optional, Vercel sets this automatically)

## Testing:
After deployment, your API endpoints should be accessible at:
- `https://interns-ochre.vercel.app/health`
- `https://interns-ochre.vercel.app/v1/auth/send-otp`
- `https://interns-ochre.vercel.app/v1/auth/verify-otp`
- etc.

## Local Development:
For local development, the frontend will still use `http://localhost:3001` as the default API URL when `REACT_APP_API_URL` is not set.