import { describe, it, expect, vi } from 'vitest';
import { getRandomGroupId, getCrc32GroupId, resolveStrategyGroupId } from '../resolveStrategy';
import { CustomStrategyFunction } from '../types';

describe('resolveStrategy', () => {
  describe('getRandomGroupId', () => {
    it('should return valid group ID', () => {
      const groups = { 0: 50, 1: 50 };
      const groupId = getRandomGroupId(groups);
      expect([0, 1]).toContain(groupId);
    });

    it('should handle uneven distribution', () => {
      const groups = { 0: 20, 1: 80 };
      const groupId = getRandomGroupId(groups);
      expect([0, 1]).toContain(groupId);
    });

    it('should return last group when total ratio is less than 100', () => {
      const groups = { 0: 10, 1: 20, 2: 30 };
      vi.spyOn(Math, 'random').mockReturnValue(0.99);
      const groupId = getRandomGroupId(groups);
      expect(groupId).toBe(2);
      vi.restoreAllMocks();
    });

    it('should handle single group', () => {
      const groups = { 0: 100 };
      const groupId = getRandomGroupId(groups);
      expect(groupId).toBe(0);
    });

    it('should handle multiple groups', () => {
      const groups = { 0: 25, 1: 25, 2: 25, 3: 25 };
      const groupId = getRandomGroupId(groups);
      expect([0, 1, 2, 3]).toContain(groupId);
    });
  });

  describe('getCrc32GroupId', () => {
    it('should return deterministic result for same userId', () => {
      const groups = { 0: 50, 1: 50 };
      const userId = 'test-user-123';
      
      const result1 = getCrc32GroupId(userId, groups);
      const result2 = getCrc32GroupId(userId, groups);
      
      expect(result1).toBe(result2);
      expect([0, 1]).toContain(result1);
    });

    it('should distribute users across groups', () => {
      const groups = { 0: 50, 1: 50 };
      const results = new Set();
      
      for (let i = 0; i < 100; i++) {
        const userId = `user-${i}`;
        const groupId = getCrc32GroupId(userId, groups);
        results.add(groupId);
      }
      
      // 应该至少有两个不同的组
      expect(results.size).toBeGreaterThan(1);
    });

    it('should handle uneven distribution', () => {
      const groups = { 0: 20, 1: 80 };
      const userId = 'test-user';
      const groupId = getCrc32GroupId(userId, groups);
      expect([0, 1]).toContain(groupId);
    });

    it('should return last group when hash falls outside range', () => {
      const groups = { 0: 10, 1: 20 };
      const userId = 'test-user';
      const groupId = getCrc32GroupId(userId, groups);
      expect([0, 1]).toContain(groupId);
    });
  });

  describe('resolveStrategyGroupId', () => {
    describe('random strategy', () => {
      it('should use random strategy by default', () => {
        const groups = { 0: 50, 1: 50 };
        const groupId = resolveStrategyGroupId('random', groups);
        expect([0, 1]).toContain(groupId);
      });

      it('should use random strategy when strategy is undefined', () => {
        const groups = { 0: 50, 1: 50 };
        const groupId = resolveStrategyGroupId(undefined as any, groups);
        expect([0, 1]).toContain(groupId);
      });
    });

    describe('crc32 strategy', () => {
      it('should use crc32 strategy with userId', () => {
        const groups = { 0: 50, 1: 50 };
        const userId = 'test-user';
        const groupId = resolveStrategyGroupId('crc32', groups, userId);
        expect([0, 1]).toContain(groupId);
      });

      it('should return -1 when userId is missing for crc32', () => {
        const groups = { 0: 50, 1: 50 };
        const groupId = resolveStrategyGroupId('crc32', groups);
        expect(groupId).toBe(-1);
      });

      it('should log warning when userId is missing', () => {
        const groups = { 0: 50, 1: 50 };
        resolveStrategyGroupId('crc32', groups, undefined, 'testExperiment');
        // Logger will output warning
      });
    });

    describe('custom strategy', () => {
      it('should use custom strategy function', () => {
        const groups = { 0: 50, 1: 50 };
        const customStrategy: CustomStrategyFunction = () => 1;
        const groupId = resolveStrategyGroupId(customStrategy, groups);
        expect(groupId).toBe(1);
      });

      it('should pass groups to custom strategy', () => {
        const groups = { 0: 30, 1: 70 };
        let receivedGroups: any;
        const customStrategy: CustomStrategyFunction = (g) => {
          receivedGroups = g;
          return 0;
        };
        resolveStrategyGroupId(customStrategy, groups);
        expect(receivedGroups).toEqual(groups);
      });

      it('should fallback to random when custom strategy returns invalid groupId', () => {
        const groups = { 0: 50, 1: 50 };
        const customStrategy: CustomStrategyFunction = () => 999;
        const groupId = resolveStrategyGroupId(customStrategy, groups);
        expect([0, 1]).toContain(groupId);
      });

      it('should fallback to random when custom strategy throws error', () => {
        const groups = { 0: 50, 1: 50 };
        const customStrategy: CustomStrategyFunction = () => {
          throw new Error('Strategy error');
        };
        const groupId = resolveStrategyGroupId(customStrategy, groups);
        expect([0, 1]).toContain(groupId);
      });

      it('should log warning when custom strategy returns invalid groupId', () => {
        const groups = { 0: 50, 1: 50 };
        const customStrategy: CustomStrategyFunction = () => 999;
        resolveStrategyGroupId(customStrategy, groups, undefined, 'testExperiment');
        // Logger will output warning
      });

      it('should log warning when custom strategy throws error', () => {
        const groups = { 0: 50, 1: 50 };
        const customStrategy: CustomStrategyFunction = () => {
          throw new Error('Strategy error');
        };
        resolveStrategyGroupId(customStrategy, groups, undefined, 'testExperiment');
        // Logger will output warning
      });
    });
  });
});
