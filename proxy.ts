import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
    if (request.nextUrl.pathname === '/log-proxy') {
        const rewriteUrl = new URL(process.env.NEXT_PUBLIC_OTEL_EXPORTER_OTLP_LOGS_ENDPOINT!)
        return NextResponse.rewrite(rewriteUrl)
    }

    return NextResponse.next()
}