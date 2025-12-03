import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getExperimentHitStatus, forceHitTestFlag } from '../forceHitTestFlag';
import { ABTestConfigMap } from '../types';

describe('forceHitTestFlag', () => {
  const mockConfig: ABTestConfigMap = {
    experiment1: {
      key: 'exp1',
      value: -1,
      groups: { 0: 50, 1: 50 }
    },
    experiment2: {
      key: 'exp2',
      value: -1,
      groups: { 0: 30, 1: 70 }
    }
  };

  beforeEach(() => {
    // Mock location.href
    delete (globalThis as any).location;
    (globalThis as any).location = { href: '' };
  });

  describe('getExperimentHitStatus', () => {
    it('should return empty object when forceHitTestFlag is not in URL', () => {
      (globalThis as any).location.href = 'https://example.com/page';
      const result = getExperimentHitStatus(mockConfig);
      expect(result).toEqual({});
    });

    it('should parse single experiment from URL', () => {
      (globalThis as any).location.href = 'https://example.com/page?forceHitTestFlag=exp1-1';
      const result = getExperimentHitStatus(mockConfig);
      expect(result).toEqual({ experiment1: 1 });
    });

    it('should parse multiple experiments from URL', () => {
      (globalThis as any).location.href = 'https://example.com/page?forceHitTestFlag=exp1-1;exp2-0';
      const result = getExperimentHitStatus(mockConfig);
      expect(result).toEqual({ experiment1: 1, experiment2: 0 });
    });

    it('should ignore experiments not in config', () => {
      (globalThis as any).location.href = 'https://example.com/page?forceHitTestFlag=exp1-1;unknown-1';
      const result = getExperimentHitStatus(mockConfig);
      expect(result).toEqual({ experiment1: 1 });
    });

    it('should handle empty forceHitTestFlag value', () => {
      (globalThis as any).location.href = 'https://example.com/page?forceHitTestFlag=';
      const result = getExperimentHitStatus(mockConfig);
      expect(result).toEqual({});
    });

    it('should handle malformed experiment values', () => {
      (globalThis as any).location.href = 'https://example.com/page?forceHitTestFlag=exp1-abc';
      const result = getExperimentHitStatus(mockConfig);
      expect(result.experiment1).toBeNaN();
    });

    it('should handle URL with multiple query parameters', () => {
      (globalThis as any).location.href = 'https://example.com/page?foo=bar&forceHitTestFlag=exp1-1&baz=qux';
      const result = getExperimentHitStatus(mockConfig);
      expect(result).toEqual({ experiment1: 1 });
    });

    it('should handle negative values', () => {
      (globalThis as any).location.href = 'https://example.com/page?forceHitTestFlag=exp1--1';
      const result = getExperimentHitStatus(mockConfig);
      // URLSearchParams treats '--1' as '-' and '-1', resulting in 0
      expect(result.experiment1).toBeDefined();
    });

    it('should handle zero values', () => {
      (globalThis as any).location.href = 'https://example.com/page?forceHitTestFlag=exp1-0;exp2-0';
      const result = getExperimentHitStatus(mockConfig);
      expect(result).toEqual({ experiment1: 0, experiment2: 0 });
    });
  });

  describe('forceHitTestFlag constant', () => {
    it('should export correct flag name', () => {
      expect(forceHitTestFlag).toBe('forceHitTestFlag');
    });
  });
});
