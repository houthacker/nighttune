import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-http'
import { BatchLogRecordProcessor, LoggerProvider } from '@opentelemetry/sdk-logs'
import { ATTR_SERVICE_NAME } from '@opentelemetry/semantic-conventions'
import { resourceFromAttributes } from '@opentelemetry/resources'
import { logs } from '@opentelemetry/api-logs'

const logExporter = new OTLPLogExporter({
    url: '/log-proxy'
})
const logRecordProcessor = new BatchLogRecordProcessor(logExporter, {
    maxExportBatchSize: 10,
})
const loggerProvider = new LoggerProvider({
    resource: resourceFromAttributes({
        [ATTR_SERVICE_NAME]: 'nighttune-frontend'
    }),
    processors: [logRecordProcessor]
})

logs.setGlobalLoggerProvider(loggerProvider)