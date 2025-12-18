// Serverless function to send email with zip attachment
// This can be deployed to Vercel, Netlify, AWS Lambda, etc.
// You'll need to configure your email service (SendGrid, Mailgun, AWS SES, etc.)

const fs = require('fs');
const path = require('path');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email } = req.body;

  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'Valid email required' });
  }

  try {
    // Read the zip file
    const zipPath = path.join(process.cwd(), 'public', 'YOUR-Premium Templates.zip');
    const zipBuffer = fs.readFileSync(zipPath);
    const zipBase64 = zipBuffer.toString('base64');

    // Configure your email service here
    // Example using SendGrid (you'll need to install @sendgrid/mail)
    /*
    const sgMail = require('@sendgrid/mail');
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    
    const msg = {
      to: email,
      from: 'donotreply@preqal.com',
      subject: 'Your Premium Templates from Preqal',
      text: 'Thank you for your interest! Please find attached your premium templates.',
      html: `
        <h2>Thank you for your interest!</h2>
        <p>Please find attached your premium templates:</p>
        <ul>
          <li>Document Masterlist</li>
          <li>QHSE Policy</li>
          <li>Document Control Procedure</li>
          <li>Risk Register</li>
          <li>Training & Competency Register</li>
        </ul>
        <p>Best regards,<br>The Preqal Team</p>
      `,
      attachments: [
        {
          content: zipBase64,
          filename: 'YOUR-Premium Templates.zip',
          type: 'application/zip',
          disposition: 'attachment'
        }
      ]
    };

    await sgMail.send(msg);
    */

    // For now, return success (you'll need to implement the email sending)
    // TODO: Implement email sending with your preferred service
    console.log(`Email should be sent to: ${email}`);
    
    return res.status(200).json({ success: true, message: 'Email sent successfully' });
  } catch (error) {
    console.error('Error sending email:', error);
    return res.status(500).json({ error: 'Failed to send email' });
  }
}

