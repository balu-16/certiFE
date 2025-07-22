# API Testing Guide

## 🚀 Testing Your Vercel-Deployed Backend API

Your backend is deployed at: `https://interns-ochre.vercel.app`

## Method 1: Interactive HTML Tester (Recommended)

I've created `api-tester.html` - a user-friendly web interface to test all your API endpoints.

**To use:**
1. Open `api-tester.html` in your browser
2. The base URL is pre-filled with your Vercel URL
3. Test each endpoint with the provided forms
4. View responses in real-time

## Method 2: Browser Testing (Quick Tests)

### Health Check
Open in browser: `https://interns-ochre.vercel.app/health`

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "database": "connected"
}
```

## Method 3: cURL Commands

### Health Check
```bash
curl https://interns-ochre.vercel.app/health
```

### Send OTP
```bash
curl -X POST https://interns-ochre.vercel.app/v1/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "1234567890",
    "role": "student"
  }'
```

### Verify OTP
```bash
curl -X POST https://interns-ochre.vercel.app/v1/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "1234567890",
    "otp": "123456",
    "role": "student"
  }'
```

### Update Student Eligibility
```bash
curl -X PUT https://interns-ochre.vercel.app/v1/students/1/eligibility \
  -H "Content-Type: application/json" \
  -d '{
    "eligible": true
  }'
```

### Send Certificate Approval Email
```bash
curl -X POST https://interns-ochre.vercel.app/v1/email/certificate-approval \
  -H "Content-Type: application/json" \
  -d '{
    "studentEmail": "test@example.com",
    "studentName": "Test Student",
    "studentId": "1",
    "courseName": "Web Development",
    "companyName": "Test Company"
  }'
```

## Method 4: Postman Collection

### Import these endpoints into Postman:

**Base URL:** `https://interns-ochre.vercel.app`

1. **GET** `/health`
2. **POST** `/v1/auth/send-otp`
   - Body: `{"phoneNumber": "1234567890", "role": "student"}`
3. **POST** `/v1/auth/verify-otp`
   - Body: `{"phoneNumber": "1234567890", "otp": "123456", "role": "student"}`
4. **PUT** `/v1/students/{id}/eligibility`
   - Body: `{"eligible": true}`
5. **POST** `/v1/email/certificate-approval`
   - Body: `{"studentEmail": "test@example.com", "studentName": "Test", "studentId": "1", "courseName": "Course", "companyName": "Company"}`

## Method 5: JavaScript Fetch (Browser Console)

Open browser console on any page and run:

```javascript
// Test health endpoint
fetch('https://interns-ochre.vercel.app/health')
  .then(response => response.json())
  .then(data => console.log('Health:', data))
  .catch(error => console.error('Error:', error));

// Test send OTP
fetch('https://interns-ochre.vercel.app/v1/auth/send-otp', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    phoneNumber: '1234567890',
    role: 'student'
  })
})
.then(response => response.json())
.then(data => console.log('OTP Response:', data))
.catch(error => console.error('Error:', error));
```

## Expected Responses

### ✅ Successful Health Check
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "database": "connected"
}
```

### ✅ Successful OTP Send
```json
{
  "success": true,
  "message": "OTP sent successfully",
  "otp": "123456"
}
```

### ❌ Common Error Responses
```json
{
  "success": false,
  "error": "Missing required fields"
}
```

## Troubleshooting

### If you get "Cannot GET /" error:
- Your backend is working! The root path isn't defined
- Try `/health` endpoint instead

### If you get CORS errors:
- Your backend has CORS enabled, but check browser console
- Try using the HTML tester instead of direct browser requests

### If you get 404 errors:
- Check the endpoint URL spelling
- Ensure you're using the correct HTTP method (GET, POST, PUT)

### If you get 500 errors:
- Check your environment variables in Vercel dashboard
- Verify Supabase connection settings

## Next Steps

1. **Use the HTML tester** for comprehensive testing
2. **Test the health endpoint first** to ensure basic connectivity
3. **Test OTP endpoints** to verify authentication flow
4. **Test email endpoints** to verify email service
5. **Monitor Vercel logs** for any server-side errors