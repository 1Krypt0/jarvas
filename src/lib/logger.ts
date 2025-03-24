import pino from "pino";

const logger = pino({
  transport:
    process.env.NODE_ENV === "development"
      ? {
          target: "pino-pretty",
          options: {
            colorize: true,
          },
        }
      : undefined, // Pretty logs in dev
  level: process.env.NODE_ENV === "production" ? "warn" : "debug",
});

export default logger;
