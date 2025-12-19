# EmailJS Template Configuration Guide

## Email Subject
Set the subject line in your EmailJS template to:
```
{{subject}}
```
Or hardcode it as:
```
Preqal Lead
```

## Available Template Variables

All form data is available in your EmailJS template. Use these variables:

### Basic Information
- `{{first_name}}` - First name
- `{{last_name}}` - Last name
- `{{full_name}}` - Full name (first + last)
- `{{email}}` - Email address
- `{{company}}` - Company name
- `{{job_title}}` - Job title (or custom if "Other" selected)

### Contact Information
- `{{phone_number}}` - Full E.164 phone number
- `{{formatted_phone}}` - Phone with dial code (e.g., "+1 440-555-1234")
- `{{dial_code}}` - Dial code (e.g., "+1", "+44")
- `{{country_iso}}` - ISO country code (e.g., "US", "GB", "JM")

### Lead Details
- `{{most_pressing_quality_problem}}` - Selected or custom quality problem
- `{{source_page}}` - Source page (always "library_unlock")
- `{{submitted_at}}` - Formatted submission timestamp

### Pre-formatted Content
- `{{formatted_data}}` - Complete formatted text block with all information

## Recommended HTML Email Template

Here's a beautiful HTML template you can use in EmailJS:

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Preqal Lead</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f6f8fb;">
  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f6f8fb; padding: 20px;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #f59e0b 0%, #ea580c 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">Preqal Lead</h1>
              <p style="margin: 8px 0 0 0; color: #ffffff; font-size: 14px; opacity: 0.9;">New Lead Submission</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <!-- Contact Information -->
              <div style="margin-bottom: 30px;">
                <h2 style="margin: 0 0 20px 0; color: #171717; font-size: 20px; font-weight: 600; border-bottom: 2px solid #f59e0b; padding-bottom: 10px;">Contact Information</h2>
                <table role="presentation" style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; color: #525252; font-size: 14px; width: 140px;"><strong>Name:</strong></td>
                    <td style="padding: 8px 0; color: #171717; font-size: 14px;">{{full_name}}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #525252; font-size: 14px;"><strong>Email:</strong></td>
                    <td style="padding: 8px 0; color: #171717; font-size: 14px;"><a href="mailto:{{email}}" style="color: #f59e0b; text-decoration: none;">{{email}}</a></td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #525252; font-size: 14px;"><strong>Company:</strong></td>
                    <td style="padding: 8px 0; color: #171717; font-size: 14px;">{{company}}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #525252; font-size: 14px;"><strong>Job Title:</strong></td>
                    <td style="padding: 8px 0; color: #171717; font-size: 14px;">{{job_title}}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #525252; font-size: 14px;"><strong>Phone:</strong></td>
                    <td style="padding: 8px 0; color: #171717; font-size: 14px;">{{formatted_phone}} ({{country_iso}})</td>
                  </tr>
                </table>
              </div>
              
              <!-- Quality Problem -->
              <div style="margin-bottom: 30px;">
                <h2 style="margin: 0 0 20px 0; color: #171717; font-size: 20px; font-weight: 600; border-bottom: 2px solid #f59e0b; padding-bottom: 10px;">Most Pressing Quality Problem</h2>
                <p style="margin: 0; color: #171717; font-size: 14px; line-height: 1.6; background-color: #f9fafb; padding: 15px; border-radius: 8px; border-left: 4px solid #f59e0b;">{{most_pressing_quality_problem}}</p>
              </div>
              
              <!-- Metadata -->
              <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                <table role="presentation" style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 4px 0; color: #6b7280; font-size: 12px;"><strong>Source:</strong> {{source_page}}</td>
                  </tr>
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
              <p style="margin: 0; color: #6b7280; font-size: 12px;">This lead was submitted through the Preqal Library Unlock form.</p>
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
Subject: Preqal Lead

NEW LEAD SUBMISSION
===================

CONTACT INFORMATION
-------------------
Name: {{full_name}}
Email: {{email}}
Company: {{company}}
Job Title: {{job_title}}
Phone: {{formatted_phone}} ({{country_iso}})

MOST PRESSING QUALITY PROBLEM
------------------------------
{{most_pressing_quality_problem}}

METADATA
--------
Source: {{source_page}}
Submitted: {{submitted_at}}
```

## How to Update Your EmailJS Template

1. Go to [EmailJS Dashboard](https://dashboard.emailjs.com/)
2. Navigate to **Email Templates**
3. Select your template (`template_t9m3dai`)
4. Update the **Subject** field to: `{{subject}}` or `Preqal Lead`
5. Paste the HTML template above into the **Content** field
6. Click **Save**

## Testing

After updating the template, test it by submitting the form. The email should now display all form data in a beautiful, formatted layout.

