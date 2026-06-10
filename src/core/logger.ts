import winston from 'winston';

const { combine, timestamp, json, colorize, printf, errors } = winston.format;

// Định dạng log cho Console hiển thị đẹp mắt
const consoleFormat = printf(({ level, message, timestamp, stack, ...metadata }) => {
  let logMsg = `${timestamp} [${level}]: ${message}`;
  
  if (Object.keys(metadata).length > 0) {
    logMsg += ` | Metadata: ${JSON.stringify(metadata)}`;
  }
  
  if (stack) {
    logMsg += `\nStack: ${stack}`;
  }
  
  return logMsg;
});

// Khởi tạo logger Winston
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: combine(
    errors({ stack: true }), // Tự động ghi lại stack trace của Error
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' })
  ),
  transports: [
    // Ghi log ra console
    new winston.transports.Console({
      format: combine(
        colorize(),
        consoleFormat
      )
    }),
    // Ghi log lỗi vào file riêng
    new winston.transports.File({ 
      filename: 'logs/error.log', 
      level: 'error',
      format: json()
    }),
    // Ghi toàn bộ log vào file
    new winston.transports.File({ 
      filename: 'logs/combined.log',
      format: json()
    })
  ]
});

export default logger;
