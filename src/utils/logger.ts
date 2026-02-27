import { logs } from '@opentelemetry/api-logs'

const logger = logs.getLogger('nighttune-frontend')

export function trace(body: string, meta?: Record<string, unknown>) {
    console.trace(body, meta)
    logger.emit({
        body,
        severityText: 'TRACE',
        attributes: meta ? {...meta} as any : undefined
    })
}

export function debug(body: string, meta?: Record<string, unknown>) {
    console.debug(body, meta)
    logger.emit({
        body,
        severityText: 'DEBUG',
        attributes: meta ? {...meta} as any : undefined,
    })
}

export function info(body: string, meta?: Record<string, unknown>) {
    console.info(body, meta)
    logger.emit({
        body,
        severityText: 'INFO',
        attributes: meta ? {...meta} as any : undefined,
    })
}

export function warn(body: string, meta?: Record<string, unknown>) {
    console.warn(body, meta)
    logger.emit({
        body,
        severityText: 'WARN',
        attributes: meta ? {...meta} as any : undefined,
    })
}

export function error(body: string, meta?: Record<string, unknown>) {
    console.error(body, meta)
    logger.emit({
        body,
        severityText: 'ERROR',
        attributes: meta ? {...meta} as any : undefined,
    })
}