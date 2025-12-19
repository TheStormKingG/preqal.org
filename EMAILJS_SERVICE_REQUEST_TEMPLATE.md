# EmailJS Service Request Template Guide

## Email Subject
Set the subject line in your EmailJS template to:
```
{{subject}}
```
Or hardcode it as:
```
Service Request
```

## Available Template Variables

All service booking form data is available in your EmailJS template. Use these variables:

### Service Information
- `{{subject}}` - Email subject ("Service Request")
- `{{service_name}}` - Name of the service (e.g., "Quality Risk Scan™", "IMS Design & Setup")
- `{{session_style}}` - Preferred session type ("Virtual" or "On-Site")

### Contact Information
- `{{name}}` - Full name
- `{{email}}` - Email address
- `{{phone}}` - Phone number (or "Not provided" for contact form)
- `{{business_type}}` - Company/industry type (or "Not specified")

### Message Details
- `{{message}}` - Message/concern from the form
- `{{submitted_at}}` - Formatted submission timestamp

### Pre-formatted Content
- `{{formatted_data}}` - Complete formatted text block with all information

## Recommended HTML Email Template

Here's a beautiful HTML template for service requests:

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Service Request</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f6f8fb;">
  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f6f8fb; padding: 20px;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #ea580c 0%, #f59e0b 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">Service Request</h1>
              <p style="margin: 8px 0 0 0; color: #ffffff; font-size: 14px; opacity: 0.9;">New Service Inquiry</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <!-- Service Information -->
              <div style="margin-bottom: 30px;">
                <h2 style="margin: 0 0 20px 0; color: #171717; font-size: 20px; font-weight: 600; border-bottom: 2px solid #ea580c; padding-bottom: 10px;">Service Details</h2>
                <table role="presentation" style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; color: #525252; font-size: 14px; width: 140px;"><strong>Service:</strong></td>
                    <td style="padding: 8px 0; color: #171717; font-size: 14px; font-weight: 600;">{{service_name}}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #525252; font-size: 14px;"><strong>Session Style:</strong></td>
                    <td style="padding: 8px 0; color: #171717; font-size: 14px;">{{session_style}}</td>
                  </tr>
                </table>
              </div>

              <!-- Contact Information -->
              <div style="margin-bottom: 30px;">
                <h2 style="margin: 0 0 20px 0; color: #171717; font-size: 20px; font-weight: 600; border-bottom: 2px solid #ea580c; padding-bottom: 10px;">Contact Information</h2>
                <table role="presentation" style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; color: #525252; font-size: 14px; width: 140px;"><strong>Name:</strong></td>
                    <td style="padding: 8px 0; color: #171717; font-size: 14px;">{{name}}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #525252; font-size: 14px;"><strong>Email:</strong></td>
                    <td style="padding: 8px 0; color: #171717; font-size: 14px;"><a href="mailto:{{email}}" style="color: #ea580c; text-decoration: none;">{{email}}</a></td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #525252; font-size: 14px;"><strong>Phone:</strong></td>
                    <td style="padding: 8px 0; color: #171717; font-size: 14px;">{{phone}}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #525252; font-size: 14px;"><strong>Company Type:</strong></td>
                    <td style="padding: 8px 0; color: #171717; font-size: 14px;">{{business_type}}</td>
                  </tr>
                </table>
              </div>
              
              <!-- Message -->
              <div style="margin-bottom: 30px;">
                <h2 style="margin: 0 0 20px 0; color: #171717; font-size: 20px; font-weight: 600; border-bottom: 2px solid #ea580c; padding-bottom: 10px;">Message</h2>
                <p style="margin: 0; color: #171717; font-size: 14px; line-height: 1.6; background-color: #f9fafb; padding: 15px; border-radius: 8px; border-left: 4px solid #ea580c; white-space: pre-wrap;">{{message}}</p>
              </div>
              
              <!-- Metadata -->
              <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                <table role="presentation" style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 4px 0; color: #6b7280; font-size: 12px;"><strong>Submitted:</strong> {{submitted_at}}</td>
                  </tr>
                </table>
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 20px 30px; border-radius: 0 0 12px 12px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; color: #6b7280; font-size: 12px;">This service request was submitted through the Preqal website.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

## Plain Text Alternative

If you prefer plain text, use:

```
Subject: Service Request

SERVICE REQUEST
===============

SERVICE DETAILS
---------------
Service: {{service_name}}
Session Style: {{session_style}}

CONTACT INFORMATION
-------------------
Name: {{name}}
Email: {{email}}
Phone: {{phone}}
Company Type: {{business_type}}

MESSAGE
-------
{{message}}

METADATA
--------
Submitted: {{submitted_at}}
```

## How to Update Your EmailJS Template

1. Go to [EmailJS Dashboard](https://dashboard.emailjs.com/)
2. Navigate to **Email Templates**
3. Select your template (`template_c3b29pd`)
4. Update the **Subject** field to: `{{subject}}` or `Service Request`
5. Paste the HTML template above into the **Content** field
6. Click **Save**

## Forms Using This Template

- **BookScan** (`/book`) - Service booking forms (Risk Scan, IMS Design, SOP Development, etc.)
- **ContactUs** (`/contact`) - General contact form

## Testing

After updating the template, test it by:
1. Submitting a service booking form (e.g., Book a Risk Scan)
2. Submitting the contact form
3. Verify the email includes all form data in a beautiful, formatted layout

