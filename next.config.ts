import type { NextConfig } from 'next'
import { withSentryConfig } from '@sentry/nextjs'

const nextConfig: NextConfig = {
    distDir: './dist',
    productionBrowserSourceMaps: true,
}

export default withSentryConfig(nextConfig, {
    authToken: process.env.NT_BUGSINK_AUTH_TOKEN,
    sentryUrl: 'https://dtrace.nighttune.app',
    org: 'ci',
    project: 'Nighttune', 
    sourcemaps: {
        deleteSourcemapsAfterUpload: false
    },
    telemetry: false,
    webpack: {
        treeshake: {
            removeDebugLogging: true
        }
    },
    widenClientFileUpload: true,
})