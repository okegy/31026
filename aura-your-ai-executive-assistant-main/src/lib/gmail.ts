import { getGoogleAccessToken } from './googleAuth';

const GMAIL_API_BASE = 'https://www.googleapis.com/gmail/v1';

export interface EmailMessage {
  to: string;
  subject: string;
  body: string;
  html?: boolean;
}

export interface EmailStatus {
  id: string;
  threadId: string;
  labelIds: string[];
}

function createEmailContent(message: EmailMessage): string {
  const contentType = message.html ? 'text/html' : 'text/plain';
  
  const email = [
    `To: ${message.to}`,
    `Subject: ${message.subject}`,
    `Content-Type: ${contentType}; charset=utf-8`,
    '',
    message.body,
  ].join('\n');

  return btoa(unescape(encodeURIComponent(email)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

export async function sendEmail(message: EmailMessage): Promise<EmailStatus> {
  const accessToken = getGoogleAccessToken();
  
  if (!accessToken) {
    throw new Error('Not authenticated with Google');
  }

  try {
    const encodedMessage = createEmailContent(message);

    const response = await fetch(
      `${GMAIL_API_BASE}/users/me/messages/send`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          raw: encodedMessage,
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to send email');
    }

    return await response.json();
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}

export async function sendTaskConfirmationEmail(
  userEmail: string,
  taskTitle: string,
  deadline: string,
  priority: string
): Promise<EmailStatus> {
  const message: EmailMessage = {
    to: userEmail,
    subject: `✓ AURA Task Created: ${taskTitle}`,
    html: true,
    body: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .task-card { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          .priority { display: inline-block; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600; }
          .priority-high { background: #fee2e2; color: #991b1b; }
          .priority-medium { background: #fef3c7; color: #92400e; }
          .priority-low { background: #dbeafe; color: #1e40af; }
          .footer { text-align: center; color: #6b7280; font-size: 14px; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0; font-size: 28px;">✓ Task Confirmed</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">AURA has scheduled your task</p>
          </div>
          <div class="content">
            <div class="task-card">
              <h2 style="margin-top: 0; color: #111827;">${taskTitle}</h2>
              <p style="color: #6b7280; margin: 10px 0;">
                <strong>Deadline:</strong> ${new Date(deadline).toLocaleString()}
              </p>
              <p style="margin: 10px 0;">
                <span class="priority priority-${priority.toLowerCase()}">${priority.toUpperCase()} PRIORITY</span>
              </p>
            </div>
            <p style="color: #374151;">
              <strong>What's next?</strong><br>
              • Calendar event has been created<br>
              • You'll receive reminders before the deadline<br>
              • AURA will follow up if the task is incomplete
            </p>
            <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">
              This is an automated message from your AURA AI Assistant.
            </p>
          </div>
          <div class="footer">
            <p>Powered by AURA - Autonomous Unified Reminder Agent</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  return sendEmail(message);
}

export async function sendTaskReminderEmail(
  userEmail: string,
  taskTitle: string,
  deadline: string,
  timeUntilDeadline: string
): Promise<EmailStatus> {
  const message: EmailMessage = {
    to: userEmail,
    subject: `⏰ AURA Reminder: ${taskTitle}`,
    html: true,
    body: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #f59e0b 0%, #ef4444 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; }
          .content { background: #fffbeb; padding: 30px; border-radius: 0 0 10px 10px; }
          .reminder-card { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b; }
          .cta-button { display: inline-block; background: #2563eb; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0; font-size: 28px;">⏰ Task Reminder</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Time to focus on your task</p>
          </div>
          <div class="content">
            <div class="reminder-card">
              <h2 style="margin-top: 0; color: #111827;">${taskTitle}</h2>
              <p style="color: #92400e; font-size: 18px; font-weight: 600; margin: 15px 0;">
                ⚠️ Due in ${timeUntilDeadline}
              </p>
              <p style="color: #6b7280;">
                <strong>Deadline:</strong> ${new Date(deadline).toLocaleString()}
              </p>
            </div>
            <p style="color: #374151;">
              <strong>AURA recommends:</strong><br>
              • Set aside time now to complete this task<br>
              • Break it into smaller steps if needed<br>
              • Mark as complete when done
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  return sendEmail(message);
}

export async function sendEventConfirmationEmail(
  userEmail: string,
  eventTitle: string,
  startTime: string,
  endTime: string,
  location?: string,
  attendees?: string[]
): Promise<EmailStatus> {
  const message: EmailMessage = {
    to: userEmail,
    subject: `📅 AURA Event Created: ${eventTitle}`,
    html: true,
    body: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; }
          .content { background: #f0fdf4; padding: 30px; border-radius: 0 0 10px 10px; }
          .event-card { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0; font-size: 28px;">📅 Event Scheduled</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">AURA has added this to your calendar</p>
          </div>
          <div class="content">
            <div class="event-card">
              <h2 style="margin-top: 0; color: #111827;">${eventTitle}</h2>
              <p style="color: #6b7280; margin: 10px 0;">
                <strong>Start:</strong> ${new Date(startTime).toLocaleString()}<br>
                <strong>End:</strong> ${new Date(endTime).toLocaleString()}
              </p>
              ${location ? `<p style="color: #6b7280;"><strong>Location:</strong> ${location}</p>` : ''}
              ${attendees && attendees.length > 0 ? `<p style="color: #6b7280;"><strong>Attendees:</strong> ${attendees.join(', ')}</p>` : ''}
            </div>
            <p style="color: #374151;">
              <strong>What's next?</strong><br>
              • Check your Google Calendar for details<br>
              • You'll receive reminders before the event<br>
              • AURA will help you prepare
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  return sendEmail(message);
}
