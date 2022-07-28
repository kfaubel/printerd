import winston, { createLogger, format, transports } from "winston";
const { combine, label, printf } = format;

export interface LoggerInterface {
    setLogFile(logfile: string): void;
    error(text: string): void;
    warn(text: string): void;
    log(text: string): void;
    info(text: string): void;
    http(text: string): void;
    verbose(text: string): void;
    debug(text: string): void;
    trace(text: string): void;
}

export class Logger {
    private module: string;
    private level = 2;
    private _ERROR   = 0;
    private _WARN    = 1;
    private _INFO    = 2;
    private _HTTP    = 3;
    private _VERBOSE = 4
    private _DEBUG   = 5;
    private _SILLY   = 6;
    private winstonLogger: winston.Logger;

    constructor(module: string) {
        this.module = module;

        this.winstonLogger = createLogger({
            format: combine(
                label({ label: module }),
                format.colorize(),
                format.simple(),
                format.timestamp(),
                this.logFormat
            ),
            transports: [
                new transports.Console()//,
                //new transports.File({ filename: logfile})
            ]
        });
    }

    private logFormat = printf(({ level, message, label, timestamp }) => {
        return `${timestamp} [${label}] ${level}: ${message}`;
    });

    public setLevel(levelStr: string): void {
        switch (levelStr) {
        case "error":   this.level = this._ERROR; break;
        case "warn":    this.level = this._WARN; break;
        case "info":    this.level = this._INFO; break;
        case "http":    this.level = this._HTTP; break;
        case "verbose": this.level = this._VERBOSE; break;
        case "debug":   this.level = this._DEBUG; break;
        case "silly":   this.level = this._SILLY; break;
        default: this.warn(`Unexpected level: ${levelStr}, using warn`);
        }
    }

    public setLogFile(logfile: string): void {
        this.winstonLogger.add(new transports.File({filename: logfile}));
    }

    public error(text: string): void {
        if (this.level >= this._ERROR) {
            this.winstonLogger.error(text);
        }
    }

    public warn(text: string): void {
        if (this.level >= this._WARN) {
            this.winstonLogger.warn(text);
        } 
    }

    public info(text: string): void {
        if (this.level >= this._INFO) {
            this.winstonLogger.info(text);
        } 
    }

    public http(text: string): void {
        if (this.level >= this._HTTP) {
            this.winstonLogger.info(text);
        } 
    }

    public verbose(text: string): void {
        if (this.level >= this._VERBOSE) {
            this.winstonLogger.verbose(text);
        } 
    }

    public debug(text: string): void {
        if (this.level >= this._VERBOSE) {
            this.winstonLogger.debug(text);
        }
    }

    public silly(text: string): void {
        if (this.level >= this._SILLY) {
            this.winstonLogger.debug(text);
        }
    }
}