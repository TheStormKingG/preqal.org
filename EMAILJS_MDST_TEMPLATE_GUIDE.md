# EmailJS MD-ST Assessment Template Guide

## Overview
This guide provides EmailJS template configuration for the MD-ST (Medical Director Scope Tool) assessment. There are two email types:
1. **Lead Notification** - Sent to Preqal when an assessment is completed
2. **User Report Email** - Sent to the user with their assessment results

## EmailJS Service ID
The service ID used is: `service_qziw5dg` (or from `VITE_EMAILJS_SERVICE_ID` env variable)

---

## Template 1: Lead Notification to Preqal

### Email Subject
```
{{subject}}
```
Or hardcode as:
```
Preqal Lead - MD-ST Assessment
```

### Available Template Variables

#### Contact Information
- `{{first_name}}` - User's first name
- `{{last_name}}` - User's last name
- `{{full_name}}` - Full name (first + last)
- `{{email}}` - Email address
- `{{company}}` - Company name
- `{{job_title}}` - Job title (always "Medical Director (Assessment)")

#### Assessment Results
- `{{assessment_band}}` - The calculated salary band (e.g., "A", "B", "C")
- `{{assessment_range}}` - The approximate salary range (e.g., "GYD 1.5M – 1.8M")
- `{{assessment_title}}` - The role title for the band (e.g., "Advisory Medical Director")
- `{{message}}` - Assessment summary (e.g., "MD-ST Assessment completed. Band: C, Range: GYD 2.2M – 2.5M")
- `{{source_page}}` - Source identifier ("mdst_assessment")

#### PDF Attachment
- `{{pdf_data_url}}` - Base64-encoded PDF data URL (for email template use)

**Note:** EmailJS browser SDK doesn't support file attachments directly. The PDF is provided as a data URL that can be included in the email template as a downloadable link. However, many email clients block data URLs for security reasons. Users will also receive the PDF via browser download when they complete the assessment.

#### Metadata
- `{{submitted_at}}` - Formatted submission timestamp
- `{{formatted_data}}` - Complete formatted text block with all information

### Recommended HTML Email Template

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>MD-ST Assessment Lead</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f6f8fb;">
  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f6f8fb; padding: 20px;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #2563eb 0%, #3b82f6 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">MD-ST Assessment Lead</h1>
              <p style="margin: 8px 0 0 0; color: #ffffff; font-size: 14px; opacity: 0.9;">New Assessment Completed</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <!-- Contact Information -->
              <div style="margin-bottom: 30px;">
                <h2 style="margin: 0 0 20px 0; color: #171717; font-size: 20px; font-weight: 600; border-bottom: 2px solid #2563eb; padding-bottom: 10px;">Contact Information</h2>
                <table role="presentation" style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; color: #525252; font-size: 14px; width: 140px;"><strong>Name:</strong></td>
                    <td style="padding: 8px 0; color: #171717; font-size: 14px; font-weight: 600;">{{full_name}}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #525252; font-size: 14px;"><strong>Email:</strong></td>
                    <td style="padding: 8px 0; color: #171717; font-size: 14px;"><a href="mailto:{{email}}" style="color: #2563eb; text-decoration: none;">{{email}}</a></td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #525252; font-size: 14px;"><strong>Company:</strong></td>
                    <td style="padding: 8px 0; color: #171717; font-size: 14px;">{{company}}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #525252; font-size: 14px;"><strong>Job Title:</strong></td>
                    <td style="padding: 8px 0; color: #171717; font-size: 14px;">{{job_title}}</td>
                  </tr>
                </table>
              </div>

              <!-- Assessment Results -->
              <div style="margin-bottom: 30px;">
                <h2 style="margin: 0 0 20px 0; color: #171717; font-size: 20px; font-weight: 600; border-bottom: 2px solid #2563eb; padding-bottom: 10px;">Assessment Results</h2>
                <div style="background-color: #f6f8fb; padding: 20px; border-radius: 8px; border-left: 4px solid #2563eb;">
                  <p style="margin: 0; color: #171717; font-size: 14px; line-height: 1.6;">{{message}}</p>
                </div>
              </div>

              <!-- PDF Download -->
              <div style="margin-bottom: 30px; background-color: #eff6ff; padding: 20px; border-radius: 8px; border-left: 4px solid #2563eb; text-align: center;">
                <h3 style="margin: 0 0 15px 0; color: #171717; font-size: 18px; font-weight: 600;">Assessment PDF Report</h3>
                <p style="margin: 0 0 20px 0; color: #525252; font-size: 14px; line-height: 1.6;">
                  Download the complete assessment report with detailed analysis and recommendations.
                </p>
                <a href="{{pdf_data_url}}" download="MD-ST_Assessment_Report.pdf" style="display: inline-block; background-color: #2563eb; color: #ffffff; padding: 12px 30px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">
                  Download PDF Report
                </a>
              </div>

              <!-- Metadata -->
              <div style="margin-bottom: 20px;">
                <p style="margin: 0; color: #525252; font-size: 12px;">
                  <strong>Source:</strong> {{source_page}}<br>
                  <strong>Submitted:</strong> {{submitted_at}}
                </p>
              </div>

              <!-- Formatted Data (Alternative simple format) -->
              <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin-top: 20px;">
                <h3 style="margin: 0 0 15px 0; color: #171717; font-size: 16px; font-weight: 600;">Complete Details</h3>
                <pre style="margin: 0; color: #525252; font-size: 12px; font-family: 'Courier New', monospace; white-space: pre-wrap;">{{formatted_data}}</pre>
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 20px 30px; border-radius: 0 0 12px 12px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; color: #6b7280; font-size: 12px;">Preqal | Quality, Safety & ESG Management Systems</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

---

## Template 2: User Report Email

### Email Subject
```
{{subject}}
```
Or use dynamic subject:
```
Your MD-ST Assessment Report - Band {{assessment_band}}
```

### Available Template Variables

#### Contact Information
- `{{first_name}}` - User's first name
- `{{last_name}}` - User's last name
- `{{full_name}}` - Full name (first + last)
- `{{email}}` - Email address (recipient)
- `{{company}}` - Company name

#### Assessment Results
- `{{assessment_band}}` - Assessment band (A, B, or C)
- `{{assessment_range}}` - Salary range (e.g., "GYD 2.2M – 2.5M")
- `{{assessment_title}}` - Role title (e.g., "Executive Medical Director")
- `{{assessment_description}}` - Role description
- `{{assessment_responsibilities}}` - Formatted list of key responsibilities

#### PDF Attachment
- `{{pdf_data_url}}` - Base64-encoded PDF data URL (for email template use)

**Note:** EmailJS browser SDK doesn't support file attachments directly. The PDF is provided as a data URL that can be included in the email template as a downloadable link. However, many email clients block data URLs for security reasons. Users will also receive the PDF via browser download when they complete the assessment.

#### Metadata
- `{{submitted_at}}` - Formatted submission timestamp

### Recommended HTML Email Template

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your MD-ST Assessment Report</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f6f8fb;">
  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f6f8fb; padding: 20px;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #2563eb 0%, #3b82f6 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">MD-ST Assessment Report</h1>
              <p style="margin: 8px 0 0 0; color: #ffffff; font-size: 14px; opacity: 0.9;">Your Personalized Results</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <!-- Greeting -->
              <p style="margin: 0 0 30px 0; color: #171717; font-size: 16px; line-height: 1.6;">
                Dear {{first_name}},
              </p>
              
              <p style="margin: 0 0 30px 0; color: #171717; font-size: 16px; line-height: 1.6;">
                Thank you for completing the MD-ST (Medical Director Scope Tool) assessment. Your personalized report has been generated and is ready for download.
              </p>

              <!-- Assessment Results -->
              <div style="margin-bottom: 30px; background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%); padding: 30px; border-radius: 12px; border: 2px solid #2563eb;">
                <h2 style="margin: 0 0 20px 0; color: #171717; font-size: 24px; font-weight: bold; text-align: center;">Your Assessment Result</h2>
                
                <div style="text-align: center; margin-bottom: 20px;">
                  <div style="display: inline-block; background-color: #2563eb; color: #ffffff; padding: 12px 24px; border-radius: 8px; font-size: 32px; font-weight: bold; margin-bottom: 10px;">
                    Band {{assessment_band}}
                  </div>
                  <p style="margin: 10px 0 0 0; color: #171717; font-size: 20px; font-weight: 600;">{{assessment_range}}</p>
                  <p style="margin: 5px 0 0 0; color: #525252; font-size: 16px;">{{assessment_title}}</p>
                </div>

                <div style="background-color: #ffffff; padding: 20px; border-radius: 8px; margin-top: 20px;">
                  <p style="margin: 0; color: #171717; font-size: 14px; line-height: 1.6;">{{assessment_description}}</p>
                </div>
              </div>

              <!-- Assessment Summary -->
              <div style="margin-bottom: 30px;">
                <h3 style="margin: 0 0 15px 0; color: #171717; font-size: 18px; font-weight: 600;">Key Responsibilities</h3>
                <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; border-left: 4px solid #2563eb;">
                  <pre style="margin: 0; color: #525252; font-size: 14px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; white-space: pre-wrap; line-height: 1.6;">{{assessment_responsibilities}}</pre>
                </div>
              </div>

              <!-- PDF Download -->
              <div style="margin-bottom: 30px; background-color: #eff6ff; padding: 30px; border-radius: 12px; border: 2px solid #2563eb; text-align: center;">
                <h3 style="margin: 0 0 15px 0; color: #171717; font-size: 20px; font-weight: 600;">Download Your Complete Report</h3>
                <p style="margin: 0 0 25px 0; color: #525252; font-size: 14px; line-height: 1.6;">
                  Your detailed PDF report includes the complete assessment analysis, all question responses, and detailed recommendations.
                </p>
                <a href="{{pdf_data_url}}" download="MD-ST_Assessment_Report.pdf" style="display: inline-block; background-color: #2563eb; color: #ffffff; padding: 14px 35px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(37, 99, 235, 0.3);">
                  Download PDF Report
                </a>
              </div>

              <!-- Contact Information -->
              <div style="margin-bottom: 20px; padding: 20px; background-color: #f9fafb; border-radius: 8px;">
                <p style="margin: 0 0 10px 0; color: #525252; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Assessment Details</p>
                <table role="presentation" style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 4px 0; color: #525252; font-size: 13px;"><strong>Name:</strong></td>
                    <td style="padding: 4px 0; color: #171717; font-size: 13px;">{{full_name}}</td>
                  </tr>
                  <tr>
                    <td style="padding: 4px 0; color: #525252; font-size: 13px;"><strong>Company:</strong></td>
                    <td style="padding: 4px 0; color: #171717; font-size: 13px;">{{company}}</td>
                  </tr>
                  <tr>
                    <td style="padding: 4px 0; color: #525252; font-size: 13px;"><strong>Completed:</strong></td>
                    <td style="padding: 4px 0; color: #171717; font-size: 13px;">{{submitted_at}}</td>
                  </tr>
                </table>
              </div>

              <!-- Call to Action -->
              <div style="text-align: center; margin-top: 30px;">
                <p style="margin: 0 0 20px 0; color: #171717; font-size: 14px; line-height: 1.6;">
                  If you have any questions about your assessment results or would like to discuss how Preqal can help with your quality management needs, please don't hesitate to contact us.
                </p>
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 20px 30px; border-radius: 0 0 12px 12px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 12px;">Preqal | Quality, Safety & ESG Management Systems</p>
              <p style="margin: 0; color: #9ca3af; font-size: 11px;">Medical Director Scoping Tool © 2026 Preqal Inc. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

---

## Environment Variables Needed

Add these to your GitHub Secrets and `.env` file:

```bash
# Existing
VITE_EMAILJS_SERVICE_ID=service_qziw5dg
VITE_EMAILJS_PUBLIC_KEY=your_public_key

# New - MDST specific templates
VITE_EMAILJS_MDST_LEAD_TEMPLATE_ID=template_xxxxx  # For lead notification to Preqal
VITE_EMAILJS_MDST_USER_TEMPLATE_ID=template_xxxxx  # For user report email
```

---

## How to Create Templates in EmailJS

1. Go to [EmailJS Dashboard](https://dashboard.emailjs.com/)
2. Navigate to **Email Templates**
3. Click **Create New Template**

### For Lead Notification Template:
- **Template Name:** "MD-ST Lead Notification"
- **Subject:** `{{subject}}` or "Preqal Lead - MD-ST Assessment"
- **Content:** Copy the HTML from "Template 1: Lead Notification" above
- **To Email:** Your Preqal lead email address
- **From Name:** "MD-ST Assessment Tool"
- **From Email:** Your EmailJS verified sender email

### For User Report Template:
- **Template Name:** "MD-ST User Report"
- **Subject:** `{{subject}}` or "Your MD-ST Assessment Report"
- **Content:** Copy the HTML from "Template 2: User Report Email" above
- **To Email:** `{{email}}` (dynamic - uses user's email)
- **From Name:** "Preqal"
- **From Email:** Your EmailJS verified sender email

4. After creating each template, copy the **Template ID** (starts with `template_`)
5. Add the Template IDs to your environment variables

---

## Testing

After setting up templates, test by:
1. Completing an MD-ST assessment
2. Downloading the PDF report
3. Checking that both emails are sent:
   - Lead notification to Preqal
   - User report email to the assessment taker
