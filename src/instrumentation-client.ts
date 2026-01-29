'use client'
import { WebTracerProvider } from '@opentelemetry/sdk-trace-web'
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base'
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http'
import { FetchInstrumentation } from '@opentelemetry/instrumentation-fetch'
import { UserInteractionInstrumentation } from '@opentelemetry/instrumentation-user-interaction'
import { XMLHttpRequestInstrumentation } from '@opentelemetry/instrumentation-xml-http-request'
import { registerInstrumentations } from '@opentelemetry/instrumentation'
import { resourceFromAttributes } from '@opentelemetry/resources'
import { ZoneContextManager } from '@opentelemetry/context-zone'

import { LoggerProvider, BatchLogRecordProcessor } from '@opentelemetry/sdk-logs'
import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-http'
import { logs } from '@opentelemetry/api-logs'

const serviceName = 'nighttune-frontend'
const traceExporter = new OTLPTraceExporter({
  // For self-hosted version, please use the collector url instead.
  url: process.env.NEXT_PUBLIC_DTRACE_URL,
})

const tracerProvider = new WebTracerProvider({
  resource: resourceFromAttributes({
    'deployment.environment': process.env.NEXT_PUBLIC_DEPLOY_ENV ?? 'unspecified',
    'service.name': serviceName,
  }),
  spanProcessors: [new BatchSpanProcessor(traceExporter)],
})

tracerProvider.register({
  contextManager: new ZoneContextManager(),
})

registerInstrumentations({
  instrumentations: [
    new FetchInstrumentation({
      // Selects which backend servers are allowed to receive trace headers for linking traces across services.
      // Using /.*/ acts as a wildcard. For safer usage in production, replace with specific domains:
      // e.g. propagateTraceHeaderCorsUrls: [/api\.example\.com/, /my-backend\.internal/]
      propagateTraceHeaderCorsUrls: /.*/,
    }),
    new UserInteractionInstrumentation({
      eventNames: ['click', 'input', 'submit'],
    }),
    new XMLHttpRequestInstrumentation({
      propagateTraceHeaderCorsUrls: /.*/,
    }),
  ],
})

const loggerProvider = new LoggerProvider({
  resource: resourceFromAttributes({
    'service.name': serviceName
  }),
  processors: [
    new BatchLogRecordProcessor(
      new OTLPLogExporter({
        url: process.env.NEXT_PUBLIC_DTRACE_URL
      })
    )
  ]
})

logs.setGlobalLoggerProvider(loggerProvider)
