import winston, { format } from 'winston';
import config from "../config.js";
import appConfig from '../config.js';

const customLevelOptions = {
    levels: {
        debug: 5,
        http: 4,
        info: 3,
        warn: 2,
        error: 1,
        fatal: 0,
    },
    colors: {
        debug: "cyan",
        http: "green",
        info: "blue",
        warn: "yellow",
        error: "red",
        fatal: "magenta",
    },
};

winston.addColors(customLevelOptions.colors); 
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
        new winston.transports.File({ filename: './logs/errors.log', level: 'error'})
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