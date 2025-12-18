// Production-ready serverless function for sending premium templates via email
// Deploy to Vercel with Resend integration

import { Resend } from 'resend';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

// Rate limiting: simple in-memory store (for production, use Redis or Vercel KV)
const rateLimitStore = new Map();
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
const RATE_LIMIT_MAX_REQUESTS = 3; // Max 3 requests per window per IP/email

// Audit log (in production, use a proper logging service)
const auditLog = (email, ip, status, error = null) => {
  const hash = crypto.createHash('sha256').update(email.toLowerCase()).digest('hex').substring(0, 16);
  const logEntry = {
    timestamp: new Date().toISOString(),
    emailHash: hash,
    ip: ip?.substring(0, 20) || 'unknown',
    status,
    error: error?.message || null
  };
  console.log('[AUDIT]', JSON.stringify(logEntry));
};

// Rate limiting check
const checkRateLimit = (identifier, ip) => {
  const key = `${identifier}:${ip}`;
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW;
  
  // Clean old entries
  if (rateLimitStore.has(key)) {
    const requests = rateLimitStore.get(key).filter(time => time > windowStart);
    rateLimitStore.set(key, requests);
    
    if (requests.length >= RATE_LIMIT_MAX_REQUESTS) {
      return false; // Rate limited
    }
  } else {
    rateLimitStore.set(key, []);
  }
  
  // Add current request
  rateLimitStore.get(key).push(now);
  return true; // Allowed
};

// Validate email format
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
};

// Read zip file (try multiple locations)
const getZipFile = async () => {
  // Try local file first (if bundled with deployment)
  const localPaths = [
    path.join(process.cwd(), 'public', 'YOUR-Premium Templates.zip'),
    path.join(__dirname, '..', 'public', 'YOUR-Premium Templates.zip'),
    path.join(process.cwd(), 'YOUR-Premium Templates.zip'),
  ];

  for (const zipPath of localPaths) {
    try {
      if (fs.existsSync(zipPath)) {
        return fs.readFileSync(zipPath);
      }
    } catch (error) {
      // Continue to next path
    }
  }

  // If not found locally, try fetching from URL (if ZIP_FILE_URL is set)
  if (process.env.ZIP_FILE_URL) {
    try {
      const response = await fetch(process.env.ZIP_FILE_URL);
      if (response.ok) {
        return Buffer.from(await response.arrayBuffer());
      }
    } catch (error) {
      console.error('Failed to fetch zip from URL:', error);
    }
  }

  throw new Error('Zip file not found');
};

// Main handler
export default async function handler(req, res) {
  const origin = req.headers.origin;

  if (origin === "https://preqal.org" || origin === "https://www.preqal.org") {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
  }

  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Get client IP
  const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || 
             req.headers['x-real-ip'] || 
             req.connection?.remoteAddress || 
             'unknown';

  try {
    // Parse request body
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const { email, honeypot } = body;

    // Honeypot protection (hidden field that should be empty)
    if (honeypot && honeypot !== '') {
      auditLog(email || 'unknown', ip, 'blocked_honeypot');
      return res.status(200).json({ success: true, message: 'Email sent successfully' });
    }

    // Validate email
    if (!email || !isValidEmail(email)) {
      auditLog(email || 'unknown', ip, 'invalid_email');
      return res.status(400).json({ error: 'Valid email address required' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Rate limiting
    if (!checkRateLimit(normalizedEmail, ip)) {
      auditLog(normalizedEmail, ip, 'rate_limited');
      return res.status(429).json({ 
        error: 'Too many requests. Please try again later.' 
      });
    }

    // Check environment variables
    if (!process.env.RESEND_API_KEY) {
      console.error('RESEND_API_KEY not configured');
      auditLog(normalizedEmail, ip, 'error', new Error('RESEND_API_KEY missing'));
      return res.status(500).json({ error: 'Service configuration error' });
    }

    if (!process.env.FROM_EMAIL) {
      console.error('FROM_EMAIL not configured');
      auditLog(normalizedEmail, ip, 'error', new Error('FROM_EMAIL missing'));
      return res.status(500).json({ error: 'Service configuration error' });
    }

    // Get zip file
    let zipBuffer;
    try {
      zipBuffer = await getZipFile();
    } catch (error) {
      console.error('Failed to load zip file:', error);
      auditLog(normalizedEmail, ip, 'error', error);
      return res.status(500).json({ error: 'Service temporarily unavailable' });
    }

    // Convert to base64
    const zipBase64 = zipBuffer.toString('base64');

    // Send email via Resend
    const { data, error: resendError } = await resend.emails.send({
      from: process.env.FROM_EMAIL,
      to: normalizedEmail,
      subject: 'Your Premium Templates from Preqal',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #f59e0b; margin-bottom: 20px;">Thank you for your interest!</h2>
          <p style="color: #333; line-height: 1.6;">Please find attached your premium templates:</p>
          <ul style="color: #333; line-height: 1.8;">
            <li>Document Masterlist</li>
            <li>QHSE Policy</li>
            <li>Document Control Procedure</li>
            <li>Risk Register</li>
            <li>Training & Competency Register</li>
          </ul>
          <p style="color: #333; margin-top: 30px;">Best regards,<br><strong>The Preqal Team</strong></p>
        </div>
      `,
      text: `Thank you for your interest in Preqal!

Please find attached your premium templates:
- Document Masterlist
- QHSE Policy
- Document Control Procedure
- Risk Register
- Training & Competency Register

Best regards,
The Preqal Team`,
      attachments: [
        {
          filename: 'YOUR-Premium Templates.zip',
          content: zipBase64,
        }
      ]
    });

    if (resendError) {
      console.error('Resend error:', resendError);
      auditLog(normalizedEmail, ip, 'error', resendError);
      return res.status(500).json({ error: 'Failed to send email' });
    }

    // Success
    auditLog(normalizedEmail, ip, 'success');
    return res.status(200).json({ 
      success: true, 
      message: 'Email sent successfully' 
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    const email = req.body?.email || 'unknown';
    auditLog(email, ip, 'error', error);
    return res.status(500).json({ 
      error: 'An unexpected error occurred' 
    });
  }
}
