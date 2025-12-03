import { describe, it, expect, beforeEach, vi } from 'vitest';
import { baiduTongjiStrategy } from '../builtin';
import { ABTestConfig } from '../types';

describe('builtin strategies', () => {
  describe('baiduTongjiStrategy', () => {
    beforeEach(() => {
      // Mock window._hmt
      (globalThis as any).window = {
        _hmt: []
      };
    });

    it('should have correct name', () => {
      expect(baiduTongjiStrategy.name).toBe('baiduTongji');
    });

    it('should call _hmt.push with correct parameters', async () => {
      const config: ABTestConfig = {
        key: 'test_experiment',
        value: -1
      };

      const pushSpy = vi.fn((args: any[]) => {
        // Simulate Baidu Tongji callback
        if (args[0] === '_fetchABTest') {
          const callback = args[1].callback;
          setTimeout(() => callback(1), 0);
        }
      });

      window._hmt = { push: pushSpy } as any;

      const promise = baiduTongjiStrategy.getValue(config);

      expect(pushSpy).toHaveBeenCalledWith([
        '_fetchABTest',
        {
          paramName: 'test_experiment',
          defaultValue: -1,
          callback: expect.any(Function)
        }
      ]);

      const result = await promise;
      expect(result).toBe(1);
    });

    it('should resolve with callback value', async () => {
      const config: ABTestConfig = {
        key: 'test_experiment',
        value: -1
      };

      window._hmt = {
        push: (args: any[]) => {
          if (args[0] === '_fetchABTest') {
            const callback = args[1].callback;
            setTimeout(() => callback(0), 0);
          }
        }
      } as any;

      const result = await baiduTongjiStrategy.getValue(config);
      expect(result).toBe(0);
    });

    it('should handle different experiment keys', async () => {
      const config1: ABTestConfig = {
        key: 'experiment_a',
        value: -1
      };

      const config2: ABTestConfig = {
        key: 'experiment_b',
        value: -1
      };

      const calls: string[] = [];

      window._hmt = {
        push: (args: any[]) => {
          if (args[0] === '_fetchABTest') {
            calls.push(args[1].paramName);
            const callback = args[1].callback;
            setTimeout(() => callback(1), 0);
          }
        }
      } as any;

      await baiduTongjiStrategy.getValue(config1);
      await baiduTongjiStrategy.getValue(config2);

      expect(calls).toEqual(['experiment_a', 'experiment_b']);
    });

    it('should use defaultValue from config', async () => {
      const config: ABTestConfig = {
        key: 'test_experiment',
        value: -1
      };

      let capturedDefaultValue: number | undefined;

      window._hmt = {
        push: (args: any[]) => {
          if (args[0] === '_fetchABTest') {
            capturedDefaultValue = args[1].defaultValue;
            const callback = args[1].callback;
            setTimeout(() => callback(1), 0);
          }
        }
      } as any;

      await baiduTongjiStrategy.getValue(config);
      expect(capturedDefaultValue).toBe(-1);
    });

    it('should ignore userId parameter', async () => {
      const config: ABTestConfig = {
        key: 'test_experiment',
        value: -1
      };

      window._hmt = {
        push: (args: any[]) => {
          if (args[0] === '_fetchABTest') {
            const callback = args[1].callback;
            setTimeout(() => callback(1), 0);
          }
        }
      } as any;

      const result = await baiduTongjiStrategy.getValue(config, 'user123');
      expect(result).toBe(1);
    });
  });
});
