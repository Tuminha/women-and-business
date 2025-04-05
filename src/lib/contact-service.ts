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

// Email sending function (mock implementation)
export async function sendEmail(to: string, subject: string, body: string): Promise<boolean> {
  try {
    // In a real implementation, this would use an email service like SendGrid, Mailgun, etc.
    console.log(`Sending email to: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Body: ${body}`);
    
    // For now, we'll just log and return success
    return true;
  } catch (error) {
    console.error('Send email error:', error);
    return false;
  }
}
