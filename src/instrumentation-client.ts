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

const exporter = new OTLPTraceExporter({
  // For self-hosted version, please use the collector url instead.
  url: process.env.NEXT_PUBLIC_DTRACE_URL,
})

const provider = new WebTracerProvider({
  resource: resourceFromAttributes({
    'deployment.environment': process.env.NEXT_PUBLIC_DEPLOY_ENV ?? 'unspecified',
    'service.name': 'nighttune-frontend',
  }),
  spanProcessors: [new BatchSpanProcessor(exporter)],
})

provider.register({
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
