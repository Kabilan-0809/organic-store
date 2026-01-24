import { NextResponse } from 'next/server'
import { generateStatelessOTP, getUserSecret } from '@/lib/auth-otp'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function POST(request: Request) {
    try {
        const { email, otp, newPassword } = await request.json()

        if (!email || !otp || !newPassword) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        if (newPassword.length < 6) {
            return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 })
        }

        // 1. Get User Secret & ID
        const { secret, userId } = await getUserSecret(email)

        if (!secret || !userId) {
            return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
        }

        // 2. Verify OTP (Stateless check)
        const expectedOTP = await generateStatelessOTP(email, secret)

        if (otp !== expectedOTP) {
            return NextResponse.json({ error: 'Invalid or expired OTP' }, { status: 400 })
        }

        // 3. Reset Password using Admin Client
        const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
            password: newPassword,
        })

        if (error) {
            console.error('Supabase password update error:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ success: true, message: 'Password updated successfully' })

    } catch (error) {
        console.error('[Reset Password API] Error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
