import { logs, SeverityNumber, type AnyValueMap } from '@opentelemetry/api-logs'

const logger = logs.getLogger('frontend-logger')

function log(severityNumber: SeverityNumber, severityText: string, body: string, attrs: AnyValueMap = {}) {
    logger.emit({
        body,
        severityNumber,
        severityText,
        attributes: attrs
    })
}

export function debug(body: string, attrs: AnyValueMap = {}) {
    log(SeverityNumber.DEBUG, 'DEBUG', body, attrs)
}

export function info(body: string, attrs: AnyValueMap = {}) {
    log(SeverityNumber.INFO, 'INFO', body, attrs)
}

export function warn(body: string, attrs: AnyValueMap = {}) {
    log(SeverityNumber.WARN, 'WARN', body, attrs)
}

export function error(body: string, attrs: AnyValueMap = {}) {
    log(SeverityNumber.ERROR, 'ERROR', body, attrs)
}