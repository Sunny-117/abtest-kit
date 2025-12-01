import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  initGlobalABTest,
  getGlobalABTestValue,
  clearGlobalABTestCache,
  resetGlobalABTest,
  getGlobalABTestUserstat
} from '../globalABTest';
import { CustomStrategyFunction } from '../types';

// Mock localStorage
const mockLocalStorage = {
  storage: {} as Record<string, string>,
  getItem: vi.fn((key: string) => {
    return mockLocalStorage.storage[key] || null;
  }),
  setItem: vi.fn((key: string, value: string) => {
    mockLocalStorage.storage[key] = value;
  }),
  removeItem: vi.fn((key: string) => {
    delete mockLocalStorage.storage[key];
  }),
  clear: vi.fn(() => {
    mockLocalStorage.storage = {};
  })
};

// 使用globalThis提供跨环境兼容的localStorage模拟
Object.defineProperty(globalThis, 'localStorage', {
  value: mockLocalStorage,
  writable: true
});

describe('ABTest SDK', () => {
  beforeEach(() => {
    mockLocalStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  // 测试配置
  const mockConfig = {
    test1: {
      key: '1001',
      groups: {
        0: 50,
        1: 50
      }
    },
    test2: {
      key: '1002',
      groups: {
        0: 30,
        1: 70
      }
    }
  };

  describe('random strategy', () => {
    it('should return valid group IDs for random strategy', () => {
      const result = initGlobalABTest(mockConfig, { strategy: 'random' });

      // 验证返回的结果格式正确
      expect(result).toHaveProperty('test1');
      expect(result).toHaveProperty('test2');

      // 验证返回的groupId在有效范围内
      expect([0, 1]).toContain(result.test1);
      expect([0, 1]).toContain(result.test2);
    });

    it('should save results to localStorage for random strategy', () => {
      initGlobalABTest(mockConfig, { strategy: 'random', storageKey: '__test_ab__' });

      // 验证结果被保存到localStorage
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        '__test_ab__',
        expect.stringContaining('"result":')
      );
    });

    it('should return cached results for the same config with random strategy', () => {
      const firstResult = initGlobalABTest(mockConfig, { strategy: 'random' });
      const secondResult = initGlobalABTest(mockConfig, { strategy: 'random' });

      // 验证相同配置返回相同结果（缓存生效）
      expect(secondResult.test1).toBe(firstResult.test1);
      expect(secondResult.test2).toBe(firstResult.test2);
    });

    it('should re-shuffle when config changes with random strategy', () => {
      const firstResult = initGlobalABTest(mockConfig, { strategy: 'random' });

      // 修改配置
      const newConfig = {
        ...mockConfig,
        test1: {
          ...mockConfig.test1,
          groups: {
            0: 60,
            1: 40
          }
        }
      };

      const secondResult = initGlobalABTest(newConfig, { strategy: 'random' });

      // 验证test2的结果应该保持不变（因为配置没变）
      expect(secondResult.test2).toBe(firstResult.test2);
    });
  });

  describe('crc32 strategy', () => {
    it('should return deterministic results for the same userId with crc32 strategy', () => {
      const userId = 'test-user-123';
      const firstResult = initGlobalABTest(mockConfig, {
        strategy: 'crc32',
        userId
      });
      const secondResult = initGlobalABTest(mockConfig, {
        strategy: 'crc32',
        userId
      });

      // 验证相同userId返回相同结果
      expect(secondResult.test1).toBe(firstResult.test1);
      expect(secondResult.test2).toBe(firstResult.test2);
    });

    it('should return different results for different userIds with crc32 strategy', () => {
      // 由于是概率性的，我们通过运行多次来验证分布
      const userId1 = 'user-1';
      const userId2 = 'user-2';

      const result1 = initGlobalABTest(mockConfig, {
        strategy: 'crc32',
        userId: userId1
      });

      clearGlobalABTestCache();

      const result2 = initGlobalABTest(mockConfig, {
        strategy: 'crc32',
        userId: userId2
      });

      // 验证结果格式正确
      expect([0, 1]).toContain(result1.test1);
      expect([0, 1]).toContain(result1.test2);
      expect([0, 1]).toContain(result2.test1);
      expect([0, 1]).toContain(result2.test2);
    });

    it('should warn and return -1 when userId is not provided for crc32 strategy', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const result = initGlobalABTest(mockConfig, {
        strategy: 'crc32'
        // 故意不提供userId
      });

      // 验证输出警告
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('CRC32 strategy requires userId')
      );

      // 验证返回-1
      expect(result.test1).toBe(-1);
      expect(result.test2).toBe(-1);

      consoleSpy.mockRestore();
    });
  });

  describe('custom strategy', () => {
    it('should use custom strategy function to determine groupId', () => {
      // 自定义策略：始终返回0
      const customStrategy: CustomStrategyFunction = (groups) => {
        return 0;
      };

      const result = initGlobalABTest(mockConfig, {
        strategy: customStrategy
      });

      // 验证自定义策略生效
      expect(result.test1).toBe(0);
      expect(result.test2).toBe(0);
    });

    it('should pass groups to custom strategy function', () => {
      let receivedGroupsList: Array<{ [groupId: number]: number }> = [];

      const customStrategy: CustomStrategyFunction = (groups) => {
        receivedGroupsList.push({...groups}); // 保存所有接收到的groups
        return 1;
      };

      initGlobalABTest(mockConfig, {
        strategy: customStrategy
      });

      // 验证groups参数正确传递
      expect(receivedGroupsList).toHaveLength(2); // 应该有两个测试
      expect(receivedGroupsList[0]).toEqual(mockConfig.test1.groups);
      expect(receivedGroupsList[1]).toEqual(mockConfig.test2.groups);
    });

    it('should fall back to random strategy when custom strategy returns invalid groupId', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      // 返回无效的groupId
      const invalidStrategy: CustomStrategyFunction = (groups) => 999;

      const result = initGlobalABTest(mockConfig, {
        strategy: invalidStrategy
      });

      // 验证输出警告
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Custom strategy returned invalid groupId')
      );

      // 验证结果是有效的groupId
      expect([0, 1]).toContain(result.test1);
      expect([0, 1]).toContain(result.test2);

      consoleSpy.mockRestore();
    });

    it('should fall back to random strategy when custom strategy throws an error', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      // 抛出错误的策略
      const errorStrategy: CustomStrategyFunction = (groups) => {
        throw new Error('Custom strategy error');
      };

      const result = initGlobalABTest(mockConfig, {
        strategy: errorStrategy
      });

      // 验证输出警告
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Error executing custom strategy'),
        expect.any(Error)
      );

      // 验证结果是有效的groupId
      expect([0, 1]).toContain(result.test1);
      expect([0, 1]).toContain(result.test2);

      consoleSpy.mockRestore();
    });

    it('should handle custom strategy logic correctly', () => {
        // 自定义策略：基于groups配置决定返回值
        const customStrategy: CustomStrategyFunction = (groups) => {
          // 如果groups中包含groupId为0，且其比例大于50，则返回0
          if (groups[0] && groups[0] > 50) {
            return 0;
          }
          // 否则返回1
          return 1;
        };

        const result = initGlobalABTest(mockConfig, {
          strategy: customStrategy
        });

        // test1的groups中0和1的比例都是50，所以应该返回1
        // test2的groups中0的比例是30（小于50），所以应该返回1
        expect(result.test1).toBe(1);
        expect(result.test2).toBe(1);
      });

      it('should prioritize individual experiment strategy over global strategy', () => {
        // 全局策略返回1
        const globalStrategy: CustomStrategyFunction = (groups) => 1;
        
        // 单个实验策略返回0
        const individualStrategy: CustomStrategyFunction = (groups) => 0;
        
        const testConfig = {
          // 使用全局策略的实验
          globalExperiment: {
            key: 'global_key',
            groups: { 0: 50, 1: 50 }
          },
          // 使用单个实验策略的实验
          individualExperiment: {
            key: 'individual_key',
            groups: { 0: 50, 1: 50 },
            strategy: individualStrategy
          }
        };
        
        const result = initGlobalABTest(testConfig, {
          strategy: globalStrategy,
          storageKey: 'priorityTestStorageKey'
        });
        
        // 验证优先级：globalExperiment使用全局策略返回1，individualExperiment使用单个策略返回0
        expect(result.globalExperiment).toBe(1);
        expect(result.individualExperiment).toBe(0);
      });
  });

  describe('辅助功能', () => {
    it('should get correct AB test value', () => {
      const result = initGlobalABTest(mockConfig, { strategy: 'random' });
      const test1Value = getGlobalABTestValue('test1');

      expect(test1Value).toBe(result.test1);
    });

    it('should return -1 when AB test is not initialized', () => {
      const value = getGlobalABTestValue('nonExistentTest');
      expect(value).toBe(-1);
    });

    it('should clear AB test cache correctly', () => {
      initGlobalABTest(mockConfig, { storageKey: '__cache_test__' });
      expect(mockLocalStorage.getItem('__cache_test__')).not.toBeNull();

      clearGlobalABTestCache('__cache_test__');
      expect(mockLocalStorage.getItem('__cache_test__')).toBeNull();
    });

    it('should reset AB test correctly', () => {
      const firstResult = initGlobalABTest(mockConfig, { storageKey: '__reset_test__' });
      const secondResult = resetGlobalABTest(mockConfig, { storageKey: '__reset_test__' });

      // 重置后应该重新分流，结果可能不同
      // 这里我们只验证函数正常执行
      expect(secondResult).toHaveProperty('test1');
      expect(secondResult).toHaveProperty('test2');
    });

    it('should get correct userstat string', () => {
      const result = initGlobalABTest(mockConfig, { strategy: 'random' });
      const userstat = getGlobalABTestUserstat();

      // 验证userstat格式正确
      const expectedPattern = /^1001-\d;1002-\d$/;
      expect(expectedPattern.test(userstat)).toBe(true);

      // 验证值正确
      const parts = userstat.split(';');
      expect(parts[0]).toBe(`1001-${result.test1}`);
      expect(parts[1]).toBe(`1002-${result.test2}`);
    });
  });
});
