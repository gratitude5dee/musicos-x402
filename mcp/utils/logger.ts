import pino, { Logger as PinoLogger, LoggerOptions } from "pino";
import { Logger } from "../types";

interface CreateLoggerOptions {
  level?: string;
}

function wrap(logger: PinoLogger): Logger {
  return {
    debug(message, meta) {
      if (meta && Object.keys(meta).length > 0) {
        logger.debug(meta, message);
      } else {
        logger.debug(message);
      }
    },
    info(message, meta) {
      if (meta && Object.keys(meta).length > 0) {
        logger.info(meta, message);
      } else {
        logger.info(message);
      }
    },
    warn(message, meta) {
      if (meta && Object.keys(meta).length > 0) {
        logger.warn(meta, message);
      } else {
        logger.warn(message);
      }
    },
    error(message, meta) {
      if (meta && Object.keys(meta).length > 0) {
        logger.error(meta, message);
      } else {
        logger.error(message);
      }
    },
    child(bindings) {
      return wrap(logger.child(bindings));
    }
  };
}

export function createLogger(options?: CreateLoggerOptions): Logger {
  const loggerOptions: LoggerOptions = {
    level: options?.level ?? "info"
  };

  if (process.env.NODE_ENV !== "production") {
    loggerOptions.transport = {
      target: "pino-pretty",
      options: {
        colorize: true,
        translateTime: "SYS:standard"
      }
    };
  }

  const base = pino(loggerOptions);
  return wrap(base);
}
