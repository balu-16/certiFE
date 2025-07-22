# Certificate Request and Approval System

This system implements a certificate request and approval workflow where students can request certificates and admins can approve or reject them.

## Features

### For Students:
- **Request Certificates**: Students can submit certificate requests through the "My Certificates" page
- **Download Approved Certificates**: Approved certificates can be downloaded from the "Downloads" page
- **Track Request Status**: Students can see the status of their certificate requests

### For Admins:
- **Review Requests**: Admins can view all pending certificate requests in the "Requests" page
- **Approve/Reject**: Admins can approve or reject certificate requests
- **Preview Certificates**: Admins can preview certificates before approval

## Database Schema Changes

The following columns have been added to the `students` table:

```sql
-- Certificate request status: 'none', 'pending', 'approved', 'rejected'
certificate_status TEXT DEFAULT 'none'

-- Whether the certificate has been approved by admin
certificate_approved BOOLEAN DEFAULT FALSE

-- Timestamp when the certificate was requested
certificate_requested_at TIMESTAMP
```

## Workflow

1. **Student Request**: Student fills out certificate form and clicks "Request Certificate"
2. **Admin Review**: Admin sees the request in the "Requests" page
3. **Admin Decision**: Admin can preview the certificate and approve/reject it
4. **Student Download**: If approved, student can download the certificate from "Downloads" page

## Navigation

### Student Navigation:
- Dashboard → Overview and quick actions
- My Certificates → Request new certificates
- Downloads → Download approved certificates
- Student Info → Personal information
- Company Info → Company details

### Admin Navigation:
- Dashboard → Admin overview and statistics
- Certificates → Manage certificate templates and settings
- Requests → Review and approve/reject certificate requests
- Courses → Manage available courses
- Company Info → Manage company information

## Technical Implementation

### Key Components:
- `CertificateGenerator.tsx` → Modified to submit requests instead of generating directly
- `Downloads.tsx` → New page for students to download approved certificates
- `Requests.tsx` → New page for admins to manage certificate requests
- `AppSidebar.tsx` → Updated with new navigation items

### API Integration:
- Uses Supabase for database operations
- Real-time updates for request status
- Secure file handling for certificate PDFs

## Setup Instructions

1. Run the database migration to add new columns:
   ```bash
   node run-migration.js
   ```

2. Ensure your Supabase environment variables are set:
   ```
   VITE_SUPABASE_URL=your-supabase-url
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

## Security Considerations

- Only authenticated users can access their respective pages
- Role-based access control (students vs admins)
- Certificate data is stored securely in Supabase
- Download tracking to prevent abuse