# Email Automation System - Node.js + Nodemailer

This project provides a complete email automation system using Node.js and Nodemailer with your company's SMTP settings.

## 📦 Installation

First, install the required packages:

```bash
npm install nodemailer dotenv
```

## 🔐 Environment Configuration

Create a `.env.email` file in your project root with the following configuration:

```env
EMAIL_USER=interns@nighatechglobal.com
EMAIL_PASS=okbalarakesh123
EMAIL_HOST=mail.nighatechglobal.com
EMAIL_PORT=465
EMAIL_SECURE=true
```

**⚠️ Security Note:** Never commit the `.env.email` file to version control. Add it to your `.gitignore` file.

## 🚀 Quick Start

### 1. Test the Email Service

Run the test script to verify your configuration:

```bash
node testEmail.js
```

This will:
- Verify SMTP connection
- Send a test email to `yourname@example.com`
- Send a custom email example

### 2. Use the Email Service in Your Code

```javascript
const EmailService = require('./emailService');

async function sendEmail() {
  const emailService = new EmailService();
  
  // Verify connection first
  const isConnected = await emailService.verifyConnection();
  if (!isConnected) return;
  
  // Send email
  const result = await emailService.sendEmail({
    to: 'recipient@example.com',
    subject: 'Hello from Nigha Tech Global',
    text: 'This is a test email.',
    html: '<h1>Hello!</h1><p>This is a test email.</p>'
  });
  
  console.log(result);
}

sendEmail();
```

## 📧 Features

### ✅ Basic Email Sending
- Send plain text and HTML emails
- Secure SSL/TLS encryption
- Automatic authentication
- Error handling and logging

### ✅ Test Email Function
- Pre-configured test email
- Connection verification
- Detailed logging

### ✅ Bulk Email Support
- Send emails to multiple recipients
- Template variable replacement
- Rate limiting protection

### ✅ Security Features
- Environment variable configuration
- SSL/TLS encryption
- No hardcoded credentials

## 🔧 API Reference

### EmailService Class

#### Constructor
```javascript
const emailService = new EmailService();
```

#### Methods

##### `verifyConnection()`
Verifies the SMTP connection.
```javascript
const isConnected = await emailService.verifyConnection();
```

##### `sendEmail(options)`
Sends a single email.
```javascript
const result = await emailService.sendEmail({
  to: 'recipient@example.com',
  subject: 'Subject',
  text: 'Plain text body',
  html: '<p>HTML body</p>',
  attachments: [] // optional
});
```

##### `sendTestEmail(recipientEmail)`
Sends a pre-configured test email.
```javascript
const result = await emailService.sendTestEmail('test@example.com');
```

##### `sendBulkEmails(recipients, subject, text, html)`
Sends emails to multiple recipients.
```javascript
const recipients = [
  { email: 'user1@example.com', name: 'John' },
  { email: 'user2@example.com', name: 'Jane' }
];

const results = await emailService.sendBulkEmails(
  recipients,
  'Hello {{name}}!',
  'Hi {{name}}, this is a bulk email.',
  '<h1>Hi {{name}}!</h1>'
);
```

## 📁 File Structure

```
project/
├── .env.email          # Environment variables (DO NOT COMMIT)
├── emailService.js     # Main email service class
├── testEmail.js        # Test script
└── README.md          # This file
```

## 🛡️ Security Best Practices

1. **Never hardcode credentials** - Always use environment variables
2. **Use SSL/TLS** - Port 465 with secure: true
3. **Add .env.email to .gitignore** - Prevent credential exposure
4. **Validate email addresses** - Before sending emails
5. **Rate limiting** - Avoid being flagged as spam

## 🔍 Troubleshooting

### Common Issues

1. **Authentication Failed**
   - Verify email and password in `.env.email`
   - Check if 2FA is enabled on the email account

2. **Connection Timeout**
   - Verify SMTP host and port
   - Check firewall settings

3. **SSL/TLS Errors**
   - Ensure `EMAIL_SECURE=true` for port 465
   - Try `rejectUnauthorized: false` for self-signed certificates

### Debug Mode

Enable detailed logging by adding this to your code:
```javascript
process.env.DEBUG = 'nodemailer:*';
```

## 📝 Example Use Cases

1. **Welcome Emails** - Send to new users
2. **Notifications** - System alerts and updates
3. **Marketing** - Newsletter and promotional emails
4. **Reports** - Automated daily/weekly reports
5. **Password Reset** - Security-related emails

## 🤝 Support

For issues or questions, contact the development team at Nigha Tech Global.

---

**Made with ❤️ by Nigha Tech Global**