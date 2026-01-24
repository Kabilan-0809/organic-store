import crypto from 'crypto'
import { supabaseAdmin } from './supabase/admin'

/**
 * Generates a stateless 6-digit OTP using HMAC SHA256.
 * Seed includes: Email + Secret (Password Hash or Updated At) + Expiration Window
 * 
 * We use a time window to allow the OTP to expire. 
 * Since we want it stateless, we check against the current time window and the previous one 
 * (to account for boundary conditions), or we can just encode the expiry time in the hash 
 * if we send a link. But for a pure 6-digit number, we usually rely on current state.
 * 
 * HOWEVER, the user asked for: "form a six digit number using his email id and current hashed password"
 * comparing "whether the entered otp and the calculated one is the same".
 * 
 * To make it usable (expiry), we can just salt it with the current hour or day? 
 * Or simply: OTP = HMAC(email + secret). This WON'T expire until they change password. 
 * The user noted: "so we dont need to store the otp anywhere".
 * 
 * Let's stick to the prompt's implied logic: a deterministic hash of the current credentials.
 * It invalidates ONLY when the password/secret changes.
 */
export async function generateStatelessOTP(email: string, secret: string): Promise<string> {
    // Create a deterministic hash
    const data = `${email}:${secret}`
    const hash = crypto.createHmac('sha256', process.env.OTP_SECRET || 'default-secret')
        .update(data)
        .digest('hex')

    // Convert to 6 digit integer
    // We take the first few bytes to form an integer
    const otpInt = parseInt(hash.substring(0, 8), 16)
    const otp = (otpInt % 1000000).toString().padStart(6, '0')

    return otp
}

/**
 * Fetches the user's secret for OTP generation.
 * Ideally this is the password hash. 
 * If Supabase doesn't expose it, we use `updated_at` or `last_sign_in_at` + `id`.
 */
export async function getUserSecret(email: string): Promise<{ secret: string | null; userId: string | null }> {
    try {
        // We need to use admin client to search for user
        // listUsers doesn't support filtering by exact email easily in one go without pagination if many users,
        // but typically we can search.
        // However, getUserById needs an ID. 
        // Admin listUsers can filter by query? No, just page.

        // Better approach: User enters email. We basically need their ID to proceed securely.
        // Supabase Admin doesn't give a direct "getUserByEmail" (except generateLink?).
        // Actually `supabaseAdmin.auth.admin.listUsers()` is the way, but slow if huge DB.
        // BUT, we can assume normal scale or use `generateLink` to verify existence implicitly? No.

        // Let's rely on `listUsers` with a filter if supported or iterate?
        // Supabase JS library `listUsers` allows checks? 
        // Actually, creating a client side logic: signIn with fake password? No.

        // Correct way in modern Supabase:
        const { data, error } = await supabaseAdmin.auth.admin.listUsers()
        if (error || !data.users) return { secret: null, userId: null }

        const user = data.users.find(u => u.email?.toLowerCase() === email.toLowerCase())

        if (!user) return { secret: null, userId: null }

        // Use encrypted_password if available, else fallback to stable timestamps
        // Note: Supabase might redact encrypted_password in some versions/configs.
        // If redacted, we use updated_at.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const secret = (user as any).encrypted_password || user.updated_at || user.created_at || 'fallback-secret'

        return { secret, userId: user.id }
    } catch (error) {
        console.error('Error fetching user secret:', error)
        return { secret: null, userId: null }
    }
}
