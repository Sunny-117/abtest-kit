/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react';
import { render, screen } from '@testing-library/react';
import {
  ABTestProvider,
  ABTestContext,
  initABTestsConfig,
  getUserstat
} from '../react/ABTestProvider';
import { useABTest, useABTestValue } from '../react/hooks';
import { ABTestConfigMap } from '../core/types';

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

// Mock window._hmt
Object.defineProperty(globalThis, 'window', {
  value: {
    ...globalThis.window,
    _hmt: [],
    location: {
      href: 'http://localhost:3000'
    },
    $abtestUserstat: ''
  },
  writable: true
});

describe('React Integration', () => {
  beforeEach(() => {
    mockLocalStorage.clear();
    vi.clearAllMocks();
    (window as any)._hmt = [];
    (window as any).$abtestUserstat = '';
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('getUserstat', () => {
    it('should return empty string for empty config', () => {
      const result = getUserstat({});
      expect(result).toBe('');
    });

    it('should return correct userstat string', () => {
      const config: ABTestConfigMap = {
        test1: { key: '1001', value: 0 },
        test2: { key: '1002', value: 1 }
      };
      const result = getUserstat(config);
      expect(result).toBe('1001-0;1002-1');
    });

    it('should handle config with groups', () => {
      const config: ABTestConfigMap = {
        experiment: {
          key: 'exp1',
          value: 1,
          groups: { 0: 50, 1: 50 }
        }
      };
      const result = getUserstat(config);
      expect(result).toBe('exp1-1');
    });
  });

  describe('ABTestContext', () => {
    it('should have default context values', () => {
      const TestComponent = () => {
        const context = React.useContext(ABTestContext);
        return (
          <div>
            <span data-testid="pending">{String(context.pending)}</span>
            <span data-testid="userstat">{context.userstat}</span>
          </div>
        );
      };

      render(<TestComponent />);
      expect(screen.getByTestId('pending').textContent).toBe('false');
      expect(screen.getByTestId('userstat').textContent).toBe('');
    });
  });

  describe('initABTestsConfig', () => {
    it('should initialize AB test config with random strategy', async () => {
      const config: ABTestConfigMap = {
        test1: {
          key: '1001',
          groups: { 0: 50, 1: 50 },
          strategy: 'random'
        }
      };

      const result = await initABTestsConfig(config);

      expect(result.test1.value).toBeDefined();
      expect([0, 1]).toContain(result.test1.value);
    });

    it('should initialize AB test config with crc32 strategy', async () => {
      const config: ABTestConfigMap = {
        test1: {
          key: '1001',
          groups: { 0: 50, 1: 50 },
          strategy: 'crc32'
        }
      };

      const result = await initABTestsConfig(config, { userId: 'user123' });

      expect(result.test1.value).toBeDefined();
      expect([0, 1]).toContain(result.test1.value);
    });

    it('should call injectScript if provided', async () => {
      const injectScript = vi.fn();
      const config: ABTestConfigMap = {
        test1: {
          key: '1001',
          groups: { 0: 50, 1: 50 },
          strategy: 'random'
        }
      };

      await initABTestsConfig(config, {}, injectScript);

      expect(injectScript).toHaveBeenCalled();
    });

    it('should handle injectScript error gracefully', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const injectScript = vi.fn(() => {
        throw new Error('Script injection failed');
      });
      const config: ABTestConfigMap = {
        test1: {
          key: '1001',
          groups: { 0: 50, 1: 50 },
          strategy: 'random'
        }
      };

      const result = await initABTestsConfig(config, {}, injectScript);

      expect(result.test1.value).toBeDefined();
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('should use forceHitTestFlag when present in URL', async () => {
      const originalHref = window.location.href;
      Object.defineProperty(window, 'location', {
        value: { href: 'http://localhost:3000?__abtesthit__=test1:1' },
        writable: true
      });

      const config: ABTestConfigMap = {
        test1: {
          key: '1001',
          groups: { 0: 50, 1: 50 },
          strategy: 'random'
        }
      };

      const result = await initABTestsConfig(config);

      expect(result.test1.value).toBe(1);

      Object.defineProperty(window, 'location', {
        value: { href: originalHref },
        writable: true
      });
    });

    it('should use default baiduTongji strategy when no strategy specified', async () => {
      // Setup _hmt mock to resolve immediately
      (window as any)._hmt = {
        push: vi.fn((args: any[]) => {
          if (args[0] === '_ABTesting') {
            const callback = args[1];
            // Simulate baiduTongji returning a value
            callback(0);
          }
        })
      };

      const config: ABTestConfigMap = {
        test1: {
          key: '1001'
          // No strategy or groups specified - should use baiduTongji
        }
      };

      // This will use baiduTongji strategy
      const resultPromise = initABTestsConfig(config);

      // The promise should resolve
      const result = await resultPromise;
      expect(result).toHaveProperty('test1');
    });
  });

  describe('ABTestProvider', () => {
    it('should render children', () => {
      const config: ABTestConfigMap = {
        test1: {
          key: '1001',
          groups: { 0: 50, 1: 50 },
          strategy: 'random'
        }
      };

      render(
        <ABTestProvider abTestConfig={config}>
          <div data-testid="child">Child Content</div>
        </ABTestProvider>
      );

      expect(screen.getByTestId('child')).toBeDefined();
    });

    it('should provide context to children', async () => {
      const config: ABTestConfigMap = {
        test1: {
          key: '1001',
          groups: { 0: 100 },
          strategy: 'random'
        }
      };

      const TestConsumer = () => {
        const context = React.useContext(ABTestContext);
        return (
          <div>
            <span data-testid="pending">{String(context.pending)}</span>
          </div>
        );
      };

      render(
        <ABTestProvider abTestConfig={config}>
          <TestConsumer />
        </ABTestProvider>
      );

      // Initially pending should be true
      expect(screen.getByTestId('pending').textContent).toBe('true');

      // Wait for initialization to complete
      await waitFor(() => {
        expect(screen.getByTestId('pending').textContent).toBe('false');
      });
    });

    it('should set window.$abtestUserstat after initialization', async () => {
      const config: ABTestConfigMap = {
        test1: {
          key: '1001',
          groups: { 0: 100 },
          strategy: 'random'
        }
      };

      render(
        <ABTestProvider abTestConfig={config}>
          <div>Test</div>
        </ABTestProvider>
      );

      await waitFor(() => {
        expect((window as any).$abtestUserstat).toBe('1001-0');
      });
    });
  });

  describe('useABTest hook', () => {
    it('should return context values', async () => {
      const config: ABTestConfigMap = {
        test1: {
          key: '1001',
          groups: { 0: 100 },
          strategy: 'random'
        }
      };

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <ABTestProvider abTestConfig={config}>{children}</ABTestProvider>
      );

      const { result } = renderHook(() => useABTest(), { wrapper });

      // Initially pending
      expect(result.current.pending).toBe(true);

      await waitFor(() => {
        expect(result.current.pending).toBe(false);
      });

      expect(result.current.abTestConfig).toHaveProperty('test1');
    });
  });

  describe('useABTestValue hook', () => {
    it('should return -1 when pending', () => {
      const config: ABTestConfigMap = {
        test1: {
          key: '1001',
          groups: { 0: 100 },
          strategy: 'random'
        }
      };

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <ABTestProvider abTestConfig={config}>{children}</ABTestProvider>
      );

      const { result } = renderHook(() => useABTestValue('test1'), { wrapper });

      // Initially should return -1 while pending
      expect(result.current).toBe(-1);
    });

    it('should return correct value after initialization', async () => {
      const config: ABTestConfigMap = {
        test1: {
          key: '1001',
          groups: { 0: 100 },
          strategy: 'random'
        }
      };

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <ABTestProvider abTestConfig={config}>{children}</ABTestProvider>
      );

      const { result } = renderHook(() => useABTestValue('test1'), { wrapper });

      await waitFor(() => {
        expect(result.current).toBe(0);
      });
    });

    it('should return -1 for non-existent test', async () => {
      const config: ABTestConfigMap = {
        test1: {
          key: '1001',
          groups: { 0: 100 },
          strategy: 'random'
        }
      };

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <ABTestProvider abTestConfig={config}>{children}</ABTestProvider>
      );

      const { result } = renderHook(() => useABTestValue('nonExistent'), { wrapper });

      await waitFor(() => {
        // After initialization, non-existent test should return undefined which becomes falsy
        expect(result.current).toBe(-1);
      });
    });
  });
});
