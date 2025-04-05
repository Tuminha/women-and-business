import { NextRequest, NextResponse } from 'next/server';
import { createContactMessage, sendEmail } from '@/lib/contact-service';

// POST handler for submitting contact form
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.name || !body.email || !body.message) {
      return NextResponse.json(
        { success: false, message: 'Name, email, and message are required' },
        { status: 400 }
      );
    }
    
    // Create contact message in database
    const contactMessage = await createContactMessage({
      name: body.name,
      email: body.email,
      message: body.message
    });
    
    if (!contactMessage) {
      return NextResponse.json(
        { success: false, message: 'Failed to save contact message' },
        { status: 500 }
      );
    }
    
    // Send email notification to Maria
    const emailSubject = `New Contact Form Message from ${body.name}`;
    const emailBody = `
      You have received a new message from your website contact form:
      
      Name: ${body.name}
      Email: ${body.email}
      
      Message:
      ${body.message}
      
      You can reply directly to this email to respond to ${body.name}.
    `;
    
    await sendEmail('cudeiromaria@gmail.com', emailSubject, emailBody);
    
    return NextResponse.json({
      success: true,
      message: 'Your message has been sent successfully. Maria will get back to you soon!'
    });
  } catch (error) {
    console.error('Contact form submission error:', error);
    return NextResponse.json(
      { success: false, message: 'An error occurred while sending your message. Please try again later.' },
      { status: 500 }
    );
  }
}
