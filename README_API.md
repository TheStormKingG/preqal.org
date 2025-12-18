# Email API Setup Instructions

This project needs a backend API endpoint to send emails with the zip file attachment. Since GitHub Pages only hosts static files, you'll need to deploy a serverless function separately.

## Option 1: Vercel Serverless Function (Recommended)

1. Create a `vercel.json` file in your project root:
```json
{
  "functions": {
    "api/send-templates.js": {
      "runtime": "nodejs18.x"
    }
  }
}
```

2. Install dependencies:
```bash
npm install @sendgrid/mail
```

3. Update `api/send-templates.js` with your SendGrid API key:
```javascript
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
```

4. Set environment variable in Vercel dashboard:
- `SENDGRID_API_KEY` = your SendGrid API key

5. Deploy to Vercel and update `VITE_API_URL` in your `.env` file

## Option 2: Netlify Functions

1. Move `api/send-templates.js` to `netlify/functions/send-templates.js`

2. Install dependencies and configure similarly to Vercel

## Option 3: AWS Lambda

1. Create a Lambda function
2. Upload the handler code
3. Configure API Gateway
4. Update the API URL in your frontend

## Option 4: Use EmailJS (Simpler, but limited)

If you prefer a simpler solution without a backend, you can use EmailJS:

1. Sign up at https://www.emailjs.com/
2. Create an email template
3. Update the `handleSubscribe` function in `pages/Home.tsx` to use EmailJS

## Email Service Configuration

You'll need to configure your email service to send from `donotreply@preqal.com`. This typically requires:

1. Domain verification (SPF, DKIM records)
2. Email service account setup (SendGrid, Mailgun, AWS SES, etc.)
3. API key configuration

## Current Implementation

The current code expects an API endpoint at `/api/send-templates` that:
- Accepts POST requests with `{ email: string }`
- Sends an email to that address from `donotreply@preqal.com`
- Attaches `YOUR-Premium Templates.zip` from the `public` folder
- Returns `{ success: true }` on success

