import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import { getIronSession } from 'iron-session'

export async function proxy(request: NextRequest) {
    const response = NextResponse.next()

    const session = await getIronSession(await cookies(), { 
        password: process.env.SESSION_KEY || 'no-password', 
        cookieName: 'nighttune-session',
        cookieOptions: {
            secure: process.env.NODE_ENV === 'production'
        }
    })
    await session.save()

    return response
}