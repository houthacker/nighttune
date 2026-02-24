import * as Sentry from '@sentry/nextjs'

export function debug(body: string, meta?: Record<string, unknown>) {
    Sentry.logger.debug(body, meta)
}

export function info(body: string, meta?: Record<string, unknown>) {
   Sentry.logger.info(body, meta)
}

export function warn(body: string, meta?: Record<string, unknown>) {
    Sentry.logger.warn(body, meta)
}

export function error(body: string, meta?: Record<string, unknown>) {
    Sentry.logger.error(body, meta)
}