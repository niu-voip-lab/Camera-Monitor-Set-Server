const winston = require('winston');
const createLogger = winston.createLogger;
const format = winston.format;
const transports = winston.transports;

const myFormat = format.printf(({ timestamp, level, message, meta }) => {
    return `[${timestamp}] [${level}] ${message} ${meta? JSON.stringify(meta) : ''}`;
  });

const logger = winston.createLogger({
    level: 'info',
    format: format.combine(
        format.timestamp({
            format: 'YYYY-MM-DD HH:mm:ss.SSS'
        }),
        format.errors({ stack: true }),
        format.splat(),
        format.timestamp(),
        myFormat
    ),
    defaultMeta: { service: 'video-server' },
    transports: [
        //
        // - Write to all logs with level `info` and below to `quick-start-combined.log`.
        // - Write all logs error (and below) to `quick-start-error.log`.
        //
        new transports.File({ filename: './logs/error.log', level: 'error' }),
        new transports.File({ filename: './logs/combined.log' })
    ]
});

//
// If we're not in production then **ALSO** log to the `console`
// with the colorized simple format.
//
if (process.env.NODE_ENV !== 'production') {
    logger.add(new transports.Console({
        format: format.combine(
            format.colorize(),
            myFormat
        )
    }));
}

module.exports = logger;