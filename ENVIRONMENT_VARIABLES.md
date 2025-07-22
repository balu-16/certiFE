# Environment Variables Guide

## Vite Environment Variables

This project uses Vite, which has specific requirements for environment variables:

### 🔧 **Environment Variable Naming**

- **Frontend (Vite)**: Use `VITE_` prefix for client-side variables
- **Backend (Node.js)**: Use standard naming without prefix

### 📝 **Current Environment Variables**

#### Frontend (.env)
```bash
# API Configuration
VITE_API_URL=https://interns-ochre.vercel.app
REACT_APP_API_URL=https://interns-ochre.vercel.app  # Backward compatibility
```

#### Backend (gps-backend/.env)
```bash
# Database
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_key

# Email Service
SMTP_HOST=your_smtp_host
SMTP_PORT=587
SMTP_USER=your_email
SMTP_PASS=your_password

# Other configurations
PORT=3001
LOG_LEVEL=INFO
```

### 🚨 **Common Issues & Solutions**

#### 1. **"process is not defined" Error**
- **Cause**: Using `process.env` in frontend code
- **Solution**: Use `import.meta.env` instead

```typescript
// ❌ Wrong (causes error in browser)
const apiUrl = process.env.REACT_APP_API_URL;

// ✅ Correct (works in Vite)
const apiUrl = import.meta.env.VITE_API_URL;
```

#### 2. **Environment Variables Not Loading**
- **Cause**: Missing `VITE_` prefix
- **Solution**: Rename variables with `VITE_` prefix

```bash
# ❌ Wrong (not accessible in frontend)
API_URL=http://localhost:3001

# ✅ Correct (accessible in frontend)
VITE_API_URL=http://localhost:3001
```

#### 3. **NODE_ENV Override Issues**
- **Cause**: Setting `NODE_ENV` in .env file
- **Solution**: Let Vite manage NODE_ENV automatically

```bash
# ❌ Wrong (causes Vite errors)
NODE_ENV=production

# ✅ Correct (let Vite handle it)
# NODE_ENV is automatically set by Vite
```

### 🛠️ **Safe Environment Variable Access**

Use the helper function from `app.config.ts`:

```typescript
// Helper function for safe access
const getEnvVar = (key: string, defaultValue: string = '') => {
  if (typeof window !== 'undefined') {
    return (import.meta.env as any)[key] || defaultValue;
  }
  return defaultValue;
};

// Usage
const apiUrl = getEnvVar('VITE_API_URL', 'http://localhost:3001');
```

### 📋 **TypeScript Support**

Environment variables are typed in `src/vite-env.d.ts`:

```typescript
interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly REACT_APP_API_URL: string
  readonly MODE: string
  readonly NODE_ENV: string
}
```

### 🚀 **Deployment**

#### Vercel Frontend
Add environment variables in Vercel dashboard:
- `VITE_API_URL=https://your-backend-url.vercel.app`

#### Vercel Backend
Add environment variables in Vercel dashboard:
- `SUPABASE_URL=your_supabase_url`
- `SUPABASE_ANON_KEY=your_supabase_key`
- `SMTP_HOST=your_smtp_host`
- etc.

### 🔍 **Debugging**

Use the DebugInfo component (development only) to check environment variables:
- Shows current environment mode
- Displays API URL configuration
- Lists available environment variables

The debug info appears in the bottom-right corner during development.