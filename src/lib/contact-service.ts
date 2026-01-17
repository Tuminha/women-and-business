import { getSupabaseClient } from './supabase-client';

export interface ContactMessage {
  id: number;
  name: string;
  email: string;
  message: string;
  status: 'unread' | 'read' | 'replied';
  createdAt: Date;
}

export interface CreateContactMessageData {
  name: string;
  email: string;
  message: string;
}

// Contact form message operations
export async function createContactMessage(data: CreateContactMessageData): Promise<ContactMessage | null> {
  try {
    const supabase = getSupabaseClient();
    const { name, email, message } = data;
    
    // Insert message
    const { data: newMessage, error } = await supabase
      .from('contact_messages')
      .insert({
        name,
        email,
        message,
        status: 'unread'
      })
      .select()
      .single();
    
    if (error || !newMessage) {
      console.error('Create contact message error:', error);
      return null;
    }
    
    // Convert from snake_case to camelCase
    return {
      id: newMessage.id,
      name: newMessage.name,
      email: newMessage.email,
      message: newMessage.message,
      status: newMessage.status as 'unread' | 'read' | 'replied',
      createdAt: new Date(newMessage.created_at)
    };
  } catch (error) {
    console.error('Create contact message error:', error);
    return null;
  }
}

export async function getAllContactMessages(options: {
  limit?: number;
  offset?: number;
  status?: 'unread' | 'read' | 'replied' | 'all';
} = {}): Promise<{ messages: ContactMessage[]; total: number }> {
  try {
    const supabase = getSupabaseClient();
    const {
      limit = 10,
      offset = 0,
      status = 'all'
    } = options;
    
    // Start building query
    let query = supabase
      .from('contact_messages')
      .select('*', { count: 'exact' });
    
    // Apply filters
    if (status !== 'all') {
      query = query.eq('status', status);
    }
    
    // Order by created_at
    query = query.order('created_at', { ascending: false });
    
    // Apply pagination
    query = query.range(offset, offset + limit - 1);
    
    // Execute query
    const { data, error, count } = await query;
    
    if (error) {
      console.error('Get all contact messages error:', error);
      return { messages: [], total: 0 };
    }
    
    // Convert from snake_case to camelCase
    const messages = data.map(msg => ({
      id: msg.id,
      name: msg.name,
      email: msg.email,
      message: msg.message,
      status: msg.status as 'unread' | 'read' | 'replied',
      createdAt: new Date(msg.created_at)
    }));
    
    return { messages, total: count || 0 };
  } catch (error) {
    console.error('Get all contact messages error:', error);
    return { messages: [], total: 0 };
  }
}

export async function getContactMessageById(messageId: number): Promise<ContactMessage | null> {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('contact_messages')
      .select('*')
      .eq('id', messageId)
      .single();
    
    if (error || !data) {
      return null;
    }
    
    // Convert from snake_case to camelCase
    return {
      id: data.id,
      name: data.name,
      email: data.email,
      message: data.message,
      status: data.status as 'unread' | 'read' | 'replied',
      createdAt: new Date(data.created_at)
    };
  } catch (error) {
    console.error('Get contact message by ID error:', error);
    return null;
  }
}

export async function updateContactMessageStatus(messageId: number, status: 'unread' | 'read' | 'replied'): Promise<boolean> {
  try {
    const supabase = getSupabaseClient();
    const { error } = await supabase
      .from('contact_messages')
      .update({ status })
      .eq('id', messageId);
    
    return !error;
  } catch (error) {
    console.error('Update contact message status error:', error);
    return false;
  }
}

export async function deleteContactMessage(messageId: number): Promise<boolean> {
  try {
    const supabase = getSupabaseClient();
    const { error } = await supabase
      .from('contact_messages')
      .delete()
      .eq('id', messageId);
    
    return !error;
  } catch (error) {
    console.error('Delete contact message error:', error);
    return false;
  }
}

// Email sending function using SendGrid
export async function sendEmail(to: string, subject: string, body: string): Promise<boolean> {
  const sendgridApiKey = process.env.SENDGRID_API_KEY;

  if (!sendgridApiKey) {
    console.warn('SendGrid API key not configured, skipping email');
    return true; // Return true to not block form submission
  }

  try {
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${sendgridApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: to }] }],
        from: {
          email: 'noreply@womanandbusiness.es',
          name: 'Woman & Business'
        },
        reply_to: { email: to },
        subject,
        content: [
          {
            type: 'text/plain',
            value: body
          },
          {
            type: 'text/html',
            value: body.replace(/\n/g, '<br>')
          }
        ]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('SendGrid error:', response.status, errorText);
      return false;
    }

    console.log('Email sent successfully via SendGrid');
    return true;
  } catch (error) {
    console.error('Send email error:', error);
    return false;
  }
}

// Send email with reply-to set to the sender
export async function sendContactNotification(
  adminEmail: string,
  senderName: string,
  senderEmail: string,
  message: string
): Promise<boolean> {
  const sendgridApiKey = process.env.SENDGRID_API_KEY;

  if (!sendgridApiKey) {
    console.warn('SendGrid API key not configured, skipping email notification');
    return true;
  }

  try {
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #7c3aed; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0;">Woman & Business</h1>
        </div>
        <div style="padding: 30px; background-color: #f9fafb;">
          <h2 style="color: #1f2937; margin-top: 0;">Nuevo mensaje de contacto</h2>
          <p style="color: #4b5563;"><strong>De:</strong> ${senderName}</p>
          <p style="color: #4b5563;"><strong>Email:</strong> <a href="mailto:${senderEmail}">${senderEmail}</a></p>
          <div style="background-color: white; padding: 20px; border-radius: 8px; margin-top: 20px;">
            <p style="color: #1f2937; white-space: pre-wrap;">${message}</p>
          </div>
          <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">
            Responde directamente a este email para contactar con ${senderName}.
          </p>
        </div>
        <div style="background-color: #1f2937; color: #9ca3af; padding: 15px; text-align: center; font-size: 12px;">
          Este mensaje fue enviado desde el formulario de contacto de Woman & Business
        </div>
      </div>
    `;

    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${sendgridApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: adminEmail }] }],
        from: {
          email: 'noreply@womanandbusiness.es',
          name: 'Woman & Business - Contacto'
        },
        reply_to: {
          email: senderEmail,
          name: senderName
        },
        subject: `Nuevo mensaje de contacto de ${senderName}`,
        content: [
          {
            type: 'text/plain',
            value: `Nuevo mensaje de contacto:\n\nDe: ${senderName}\nEmail: ${senderEmail}\n\nMensaje:\n${message}\n\n---\nResponde directamente a este email para contactar con ${senderName}.`
          },
          {
            type: 'text/html',
            value: htmlContent
          }
        ]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('SendGrid error:', response.status, errorText);
      return false;
    }

    console.log('Contact notification sent successfully via SendGrid');
    return true;
  } catch (error) {
    console.error('Send contact notification error:', error);
    return false;
  }
}
