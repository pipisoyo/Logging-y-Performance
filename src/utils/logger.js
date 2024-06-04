import winston, { format } from 'winston';
import config from "../config.js";
import appConfig from '../config.js';

const customLevelOptions = {
    levels: {
        debug: 0,
        http: 1,
        info: 2,
        warning: 3,
        error: 4,
        fatal: 5,
    },
    colors: {
        debug: "cyan",
        http: "green",
        info: "blue",
        warning: "yellow",
        error: "red",
        fatal: "cyan",
    },
};

const customFormat = format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.printf(({ level, message, timestamp }) => {
      return `${timestamp} [${level}]: ${message}`;
    })
  );

const devLogger = winston.createLogger({
    levels: customLevelOptions.levels,
    transports: [
        new winston.transports.Console({
            level: 'debug',
            format: winston.format.combine(
                winston.format.colorize({ all: true }),
                winston.format.simple()
            )
        })
    ]
});

const prodLogger = winston.createLogger({
    levels: customLevelOptions.levels,
    format: customFormat,
    transports: [
        new winston.transports.File({ filename: './logs/production.log', level: 'info'}),
        new winston.transports.File({ filename: './logs/errors.log', level: 'fatal'})
    ]
});

export const addLogger = (req, res, next) => {
    if (appConfig.mode === 'dev') {
        req.logger = devLogger;
    } else {
        req.logger = prodLogger;        
    }
    next();
};