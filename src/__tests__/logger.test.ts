import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { logger, LogLevel } from '../core/logger';

describe('logger', () => {
  beforeEach(() => {
    logger.reset();
    vi.clearAllMocks();
  });

  afterEach(() => {
    logger.reset();
  });

  describe('configure', () => {
    it('should configure log level', () => {
      logger.configure({ level: LogLevel.DEBUG });
      const config = logger.getConfig();
      expect(config.level).toBe(LogLevel.DEBUG);
    });

    it('should configure prefix', () => {
      logger.configure({ prefix: '[TestPrefix]' });
      const config = logger.getConfig();
      expect(config.prefix).toBe('[TestPrefix]');
    });

    it('should configure enableTimestamp', () => {
      logger.configure({ enableTimestamp: true });
      const config = logger.getConfig();
      expect(config.enableTimestamp).toBe(true);
    });

    it('should merge configurations', () => {
      logger.configure({ level: LogLevel.DEBUG });
      logger.configure({ prefix: '[Custom]' });
      const config = logger.getConfig();
      expect(config.level).toBe(LogLevel.DEBUG);
      expect(config.prefix).toBe('[Custom]');
    });
  });

  describe('reset', () => {
    it('should reset to default configuration', () => {
      logger.configure({ level: LogLevel.DEBUG, prefix: '[Custom]', enableTimestamp: true });
      logger.reset();
      const config = logger.getConfig();
      expect(config.level).toBe(LogLevel.WARN);
      expect(config.prefix).toBe('[ABTest]');
      expect(config.enableTimestamp).toBe(false);
    });
  });

  describe('getConfig', () => {
    it('should return a copy of current config', () => {
      const config = logger.getConfig();
      config.level = LogLevel.NONE;
      expect(logger.getConfig().level).toBe(LogLevel.WARN);
    });
  });

  describe('debug', () => {
    it('should log debug message when level is DEBUG', () => {
      const consoleSpy = vi.spyOn(console, 'debug').mockImplementation(() => {});
      logger.configure({ level: LogLevel.DEBUG });

      logger.debug('debug message');

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[DEBUG]'),
        expect.anything()
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('debug message'),
        expect.anything()
      );
      consoleSpy.mockRestore();
    });

    it('should not log debug message when level is INFO', () => {
      const consoleSpy = vi.spyOn(console, 'debug').mockImplementation(() => {});
      logger.configure({ level: LogLevel.INFO });

      logger.debug('debug message');

      expect(consoleSpy).not.toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('should log debug message with data', () => {
      const consoleSpy = vi.spyOn(console, 'debug').mockImplementation(() => {});
      logger.configure({ level: LogLevel.DEBUG });
      const testData = { key: 'value' };

      logger.debug('debug message', testData);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('debug message'),
        testData
      );
      consoleSpy.mockRestore();
    });
  });

  describe('info', () => {
    it('should log info message when level is INFO or higher', () => {
      const consoleSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
      logger.configure({ level: LogLevel.INFO });

      logger.info('info message');

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[INFO]'),
        expect.anything()
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('info message'),
        expect.anything()
      );
      consoleSpy.mockRestore();
    });

    it('should not log info message when level is WARN', () => {
      const consoleSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
      logger.configure({ level: LogLevel.WARN });

      logger.info('info message');

      expect(consoleSpy).not.toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('should log info message with data', () => {
      const consoleSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
      logger.configure({ level: LogLevel.INFO });
      const testData = { key: 'value' };

      logger.info('info message', testData);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('info message'),
        testData
      );
      consoleSpy.mockRestore();
    });
  });

  describe('warn', () => {
    it('should log warn message when level is WARN or higher', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      logger.configure({ level: LogLevel.WARN });

      logger.warn('warn message');

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[WARN]'),
        expect.anything()
      );
      consoleSpy.mockRestore();
    });

    it('should not log warn message when level is ERROR', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      logger.configure({ level: LogLevel.ERROR });

      logger.warn('warn message');

      expect(consoleSpy).not.toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('error', () => {
    it('should log error message when level is ERROR or higher', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      logger.configure({ level: LogLevel.ERROR });

      logger.error('error message');

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[ERROR]'),
        expect.anything()
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('error message'),
        expect.anything()
      );
      consoleSpy.mockRestore();
    });

    it('should not log error message when level is NONE', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      logger.configure({ level: LogLevel.NONE });

      logger.error('error message');

      expect(consoleSpy).not.toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('should log error message with data', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      logger.configure({ level: LogLevel.ERROR });
      const errorData = new Error('test error');

      logger.error('error message', errorData);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('error message'),
        errorData
      );
      consoleSpy.mockRestore();
    });
  });

  describe('timestamp', () => {
    it('should include timestamp when enableTimestamp is true', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      logger.configure({ enableTimestamp: true });

      logger.warn('test message');

      // ISO timestamp format: YYYY-MM-DDTHH:mm:ss.sssZ
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringMatching(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/),
        expect.anything()
      );
      consoleSpy.mockRestore();
    });
  });

  describe('prefix', () => {
    it('should include custom prefix in log message', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      logger.configure({ prefix: '[MyApp]' });

      logger.warn('test message');

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[MyApp]'),
        expect.anything()
      );
      consoleSpy.mockRestore();
    });

    it('should work without prefix when prefix is empty', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      logger.configure({ prefix: '' });

      logger.warn('test message');

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[WARN]'),
        expect.anything()
      );
      consoleSpy.mockRestore();
    });
  });
});
