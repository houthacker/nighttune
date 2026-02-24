import * as Sentry from '@sentry/nextjs'

Sentry.init({
    dsn: "https://3e053e48f7eb4b73ab89e149978bdf6b@dtrace.nighttune.app/1",
    enableLogs: true,
    integrations: [],
    tracesSampleRate: 0
})