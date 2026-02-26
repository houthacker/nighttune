

export function debug(body: string, meta?: Record<string, unknown>) {
   console.debug(body, meta)
}

export function info(body: string, meta?: Record<string, unknown>) {
   console.info(body, meta)
}

export function warn(body: string, meta?: Record<string, unknown>) {
    console.warn(body, meta)
}

export function error(body: string, meta?: Record<string, unknown>) {
    console.error(body, meta)
}