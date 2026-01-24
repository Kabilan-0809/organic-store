import { NextResponse } from 'next/server'
import { generateStatelessOTP, getUserSecret } from '@/lib/auth-otp'
import { sendEmail } from '@/lib/mail'

export async function POST(request: Request) {
    try {
        const { email } = await request.json()

        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 })
        }

        // 1. Get User Secret (Hash/Timestamp)
        const { secret, userId } = await getUserSecret(email)

        if (!secret || !userId) {
            // Security: Always return success even if email doesn't exist to prevent enumeration
            return NextResponse.json({
                success: true,
                message: 'If an account exists, an OTP has been sent.'
            })
        }

        // 2. Generate OTP
        const otp = await generateStatelessOTP(email, secret)

        // 3. Send Email
        const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4f46e5;">Reset Your Password</h2>
        <p>You requested a password reset for your Organic Store account.</p>
        <p>Your One-Time Password (OTP) is:</p>
        <div style="background-color: #f3f4f6; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #1f2937;">${otp}</span>
        </div>
        <p>Enter this code on the password reset page to set a new password.</p>
        <p style="color: #6b7280; font-size: 14px;">This code is valid until you change your password or update your account details.</p>
        <p style="color: #6b7280; font-size: 14px;">If you didn't request this, you can safely ignore this email.</p>
      </div>
    `

        const emailResult = await sendEmail({
            to: email,
            subject: 'Your Password Reset OTP - Organic Store',
            html,
        })

        if (!emailResult.success) {
            console.error('Failed to send OTP email', emailResult.error)
            return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
        }

        return NextResponse.json({
            success: true,
            message: 'OTP sent successfully'
        })

    } catch (error) {
        console.error('[Forgot Password API] Error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
