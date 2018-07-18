const winston = require('winston');
const WinstonCloudwatch = require('winston-cloudwatch');

export class Logger {

    static logger = new winston.Logger({
        transports: [
          new WinstonCloudwatch({
                logGroupName: 'glo3112',
                logStreamName: 'sample',
                awsRegion: 'us-east-1',
                jsonMessage: true,
                accessKeyId: 'AKIAJSWHKIELBIDZ6VAA' ,
                secretAccessKey: 'kxRm+ZnOIC4MIgEes3FKmRGtZBlDXetlZhczMtDq',
                region : 'us-east-1'
            }),
            new winston.transports.Console({
                level: 'debug',
                handleExceptions: true,
                json: false,
                colorize: true
            })
        ],
        exitOnError: false
    });

    static info(logMessage: string, meta = ''): any {
        this.logger.info(logMessage, meta);
    }

    static error(logMessage: string): any {
        this.logger.error(logMessage);
    }
}