import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server'
import { OptionalService } from './src/utils/constants'
import { isServiceEnabled } from './src/utils/optionalServices'

export async function proxy(request: NextRequest) {

    // Do not proxy /log-proxy if distributed tracing has been disabled
    if (isServiceEnabled(OptionalService.DistributedTracing)) {
        if (request.nextUrl.pathname === '/log-proxy') {
            const rewriteUrl = new URL(process.env.NEXT_PUBLIC_OTEL_EXPORTER_OTLP_LOGS_ENDPOINT!)
            return NextResponse.rewrite(rewriteUrl)
        }
    }

    return NextResponse.next()
}