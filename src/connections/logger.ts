import winston = require('winston');
import DatadogTransport = require('@shelf/winston-datadog-logs-transport');

export const logger = (service = 'undefined-service', config) => {
	const _l = winston.createLogger({
		level: 'debug',
		format: winston.format.json(),
		defaultMeta: { service },
		transports: [
			new winston.transports.Console({
				format: winston.format.combine(
					winston.format.simple(),
					winston.format.colorize(),
				)
			}),
			new winston.transports.File({
				filename: `logs/${service}_debug.log`,
				level: 'debug',
			}),
			new winston.transports.File({
				filename: `logs/${service}_info.log`,
				level: 'info',
			}),
			new winston.transports.File({
				filename: `logs/${service}_error.log`,
				level: 'error',
			}),
		],
	});

	if (config.datadog && config.datadog.apiKey) {
		_l.add(
			new DatadogTransport({
				apiKey: config.datadog.apiKey,
				metadata: {
					ddsource: service,
					environment: config.environment,
				},
			})
		);
	}

	return _l;
};

