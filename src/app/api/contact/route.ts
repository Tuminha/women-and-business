import { NextRequest, NextResponse } from 'next/server';
import { createContactMessage, sendContactNotification } from '@/lib/contact-service';

// POST handler for submitting contact form
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.name || !body.email || !body.message) {
      return NextResponse.json(
        { success: false, message: 'Nombre, email y mensaje son requeridos' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        { success: false, message: 'Por favor ingresa un email valido' },
        { status: 400 }
      );
    }

    // Create contact message in database
    const contactMessage = await createContactMessage({
      name: body.name.trim(),
      email: body.email.trim().toLowerCase(),
      message: body.message.trim()
    });

    if (!contactMessage) {
      return NextResponse.json(
        { success: false, message: 'Error al guardar el mensaje' },
        { status: 500 }
      );
    }

    // Send email notification to Maria
    // This won't block form submission if email fails
    sendContactNotification(
      'cudeiromaria@gmail.com',
      body.name.trim(),
      body.email.trim(),
      body.message.trim()
    ).catch(err => {
      console.error('Failed to send email notification:', err);
    });

    return NextResponse.json({
      success: true,
      message: 'Tu mensaje ha sido enviado. Maria te respondera pronto!'
    });
  } catch (error) {
    console.error('Contact form submission error:', error);
    return NextResponse.json(
      { success: false, message: 'Ocurrio un error al enviar tu mensaje. Por favor intenta de nuevo.' },
      { status: 500 }
    );
  }
}
