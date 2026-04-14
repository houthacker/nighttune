import { OptionalService, ServiceEnvVars } from './constants'

/**
 * Return whether the given service has been enabled.
 */
export function isServiceEnabled(service: OptionalService): boolean {
    const vars = ServiceEnvVars[service]
    return !vars.some((v) => v === undefined || String(v).trim().length === 0)
}