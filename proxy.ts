import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
    return NextResponse.next()
}