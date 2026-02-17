import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  setGlobalCache,
  getGlobalCache,
  resetGlobalCache,
  localStorageCache
} from '../core/storage';

// Mock localStorage
const mockLocalStorage = {
  store: {} as Record<string, string>,
  getItem: vi.fn((key: string) => mockLocalStorage.store[key] || null),
  setItem: vi.fn((key: string, value: string) => {
    mockLocalStorage.store[key] = value;
  }),
  removeItem: vi.fn((key: string) => {
    delete mockLocalStorage.store[key];
  }),
  clear: vi.fn(() => {
    mockLocalStorage.store = {};
  })
};

Object.defineProperty(globalThis, 'localStorage', {
  value: mockLocalStorage,
  writable: true
});

describe('storage', () => {
  beforeEach(() => {
    mockLocalStorage.clear();
    vi.clearAllMocks();
    resetGlobalCache();
  });

  afterEach(() => {
    resetGlobalCache();
  });

  describe('localStorageCache', () => {
    it('should get item from localStorage', () => {
      mockLocalStorage.store['testKey'] = 'testValue';
      const result = localStorageCache.getItem('testKey');
      expect(result).toBe('testValue');
    });

    it('should return null for non-existent key', () => {
      const result = localStorageCache.getItem('nonExistent');
      expect(result).toBeNull();
    });

    it('should set item to localStorage', () => {
      localStorageCache.setItem('testKey', 'testValue');
      expect(mockLocalStorage.store['testKey']).toBe('testValue');
    });

    it('should remove item from localStorage', () => {
      mockLocalStorage.store['testKey'] = 'testValue';
      localStorageCache.removeItem('testKey');
      expect(mockLocalStorage.store['testKey']).toBeUndefined();
    });
  });

  describe('setGlobalCache', () => {
    it('should set custom cache implementation', () => {
      const customCache = {
        getItem: vi.fn(() => 'custom'),
        setItem: vi.fn(),
        removeItem: vi.fn()
      };

      setGlobalCache(customCache);
      const cache = getGlobalCache();

      expect(cache.getItem('key')).toBe('custom');
      expect(customCache.getItem).toHaveBeenCalledWith('key');
    });

    it('should use custom cache for all operations', () => {
      const customCache = {
        getItem: vi.fn(() => 'value'),
        setItem: vi.fn(),
        removeItem: vi.fn()
      };

      setGlobalCache(customCache);
      const cache = getGlobalCache();

      cache.setItem('key', 'value');
      cache.removeItem('key');

      expect(customCache.setItem).toHaveBeenCalledWith('key', 'value');
      expect(customCache.removeItem).toHaveBeenCalledWith('key');
    });
  });

  describe('getGlobalCache', () => {
    it('should return default localStorage cache', () => {
      const cache = getGlobalCache();
      expect(cache).toBe(localStorageCache);
    });

    it('should return custom cache after setGlobalCache', () => {
      const customCache = {
        getItem: vi.fn(),
        setItem: vi.fn(),
        removeItem: vi.fn()
      };

      setGlobalCache(customCache);
      expect(getGlobalCache()).toBe(customCache);
    });
  });

  describe('resetGlobalCache', () => {
    it('should reset to localStorage cache', () => {
      const customCache = {
        getItem: vi.fn(),
        setItem: vi.fn(),
        removeItem: vi.fn()
      };

      setGlobalCache(customCache);
      expect(getGlobalCache()).toBe(customCache);

      resetGlobalCache();
      expect(getGlobalCache()).toBe(localStorageCache);
    });
  });

  describe('custom cache scenarios', () => {
    it('should work with sessionStorage-like implementation', () => {
      const sessionStore: Record<string, string> = {};
      const sessionCache = {
        getItem: (key: string) => sessionStore[key] || null,
        setItem: (key: string, value: string) => { sessionStore[key] = value; },
        removeItem: (key: string) => { delete sessionStore[key]; }
      };

      setGlobalCache(sessionCache);
      const cache = getGlobalCache();

      cache.setItem('session-key', 'session-value');
      expect(cache.getItem('session-key')).toBe('session-value');

      cache.removeItem('session-key');
      expect(cache.getItem('session-key')).toBeNull();
    });

    it('should work with memory cache implementation', () => {
      const memoryStore = new Map<string, string>();
      const memoryCache = {
        getItem: (key: string) => memoryStore.get(key) || null,
        setItem: (key: string, value: string) => memoryStore.set(key, value),
        removeItem: (key: string) => memoryStore.delete(key)
      };

      setGlobalCache(memoryCache);
      const cache = getGlobalCache();

      cache.setItem('mem-key', 'mem-value');
      expect(cache.getItem('mem-key')).toBe('mem-value');
    });
  });
});
