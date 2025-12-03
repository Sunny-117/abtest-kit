/**
 * 日志级别
 */
export enum LogLevel {
  NONE = 0,    // 不输出任何日志
  ERROR = 1,   // 只输出错误
  WARN = 2,    // 输出警告和错误
  INFO = 3,    // 输出信息、警告和错误
  DEBUG = 4    // 输出所有日志
}

/**
 * 日志配置
 */
interface LoggerConfig {
  level: LogLevel;
  prefix?: string;
  enableTimestamp?: boolean;
}

/**
 * 默认配置
 */
const defaultConfig: LoggerConfig = {
  level: LogLevel.WARN,
  prefix: '[ABTest]',
  enableTimestamp: false
};

/**
 * 当前配置
 */
let currentConfig: LoggerConfig = { ...defaultConfig };

/**
 * 格式化日志消息
 */
const formatMessage = (level: string, message: string, data?: any): string => {
  const parts: string[] = [];
  
  if (currentConfig.enableTimestamp) {
    parts.push(new Date().toISOString());
  }
  
  if (currentConfig.prefix) {
    parts.push(currentConfig.prefix);
  }
  
  parts.push(`[${level}]`);
  parts.push(message);
  
  return parts.join(' ');
};

/**
 * 日志记录器
 */
export const logger = {
  /**
   * 配置日志记录器
   */
  configure(config: Partial<LoggerConfig>): void {
    currentConfig = { ...currentConfig, ...config };
  },

  /**
   * 重置为默认配置
   */
  reset(): void {
    currentConfig = { ...defaultConfig };
  },

  /**
   * 获取当前配置
   */
  getConfig(): LoggerConfig {
    return { ...currentConfig };
  },

  /**
   * 调试日志
   */
  debug(message: string, data?: any): void {
    if (currentConfig.level >= LogLevel.DEBUG) {
      console.debug(formatMessage('DEBUG', message), data !== undefined ? data : '');
    }
  },

  /**
   * 信息日志
   */
  info(message: string, data?: any): void {
    if (currentConfig.level >= LogLevel.INFO) {
      console.info(formatMessage('INFO', message), data !== undefined ? data : '');
    }
  },

  /**
   * 警告日志
   */
  warn(message: string, data?: any): void {
    if (currentConfig.level >= LogLevel.WARN) {
      console.warn(formatMessage('WARN', message), data !== undefined ? data : '');
    }
  },

  /**
   * 错误日志
   */
  error(message: string, data?: any): void {
    if (currentConfig.level >= LogLevel.ERROR) {
      console.error(formatMessage('ERROR', message), data !== undefined ? data : '');
    }
  }
};
