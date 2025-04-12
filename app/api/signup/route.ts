import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import WelcomeEmail from '@/components/email/WelcomeEmail';

// Initialize Resend with your API key
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { email, name } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Send welcome email
    await resend.emails.send({
      from: 'Invest Assist <notifications@investassist.com>',
      to: email,
      subject: 'Welcome to Invest Assist!',
      react: WelcomeEmail({ name: name || undefined }),
    });

    // Here you would typically also save the email to your database
    // For example:
    // await db.users.create({ data: { email, name } });

    return NextResponse.json(
      { success: true, message: 'Signup successful' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Failed to process signup' },
      { status: 500 }
    );
  }
} 