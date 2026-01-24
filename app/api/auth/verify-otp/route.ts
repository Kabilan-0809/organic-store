import { NextResponse } from 'next/server'
import { generateStatelessOTP, getUserSecret } from '@/lib/auth-otp'

export async function POST(request: Request) {
    try {
        const { email, otp } = await request.json()

        if (!email || !otp) {
            return NextResponse.json({ error: 'Email and OTP are required' }, { status: 400 })
        }

        // 1. Get User Secret
        const { secret } = await getUserSecret(email)

        if (!secret) {
            return NextResponse.json({ valid: false, message: 'Invalid OTP' }, { status: 400 })
        }

        // 2. Re-calculate Expected OTP
        const expectedOTP = await generateStatelessOTP(email, secret)

        // 3. Compare
        if (otp === expectedOTP) {
            return NextResponse.json({ valid: true, message: 'OTP Verified' })
        } else {
            return NextResponse.json({ valid: false, message: 'Invalid OTP' }, { status: 400 })
        }

    } catch (error) {
        console.error('[Verify OTP API] Error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
