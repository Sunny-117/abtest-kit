import { CacheStorage } from './types';

/**
 * 默认的 localStorage 缓存实现
 */
export const localStorageCache: CacheStorage = {
  getItem(key: string): string | null {
    return localStorage.getItem(key);
  },
  setItem(key: string, value: string): void {
    localStorage.setItem(key, value);
  },
  removeItem(key: string): void {
    localStorage.removeItem(key);
  }
};

/**
 * 当前使用的缓存实例
 */
let currentCache: CacheStorage = localStorageCache;

/**
 * 设置全局缓存实现
 * @param cache 缓存实现，需实现 CacheStorage 接口
 * @example
 * // 使用 Cookie 存储
 * setGlobalCache({
 *   getItem: (key) => getCookie(key),
 *   setItem: (key, value) => setCookie(key, value),
 *   removeItem: (key) => deleteCookie(key)
 * });
 *
 * @example
 * // 使用 sessionStorage
 * setGlobalCache({
 *   getItem: (key) => sessionStorage.getItem(key),
 *   setItem: (key, value) => sessionStorage.setItem(key, value),
 *   removeItem: (key) => sessionStorage.removeItem(key)
 * });
 */
export const setGlobalCache = (cache: CacheStorage): void => {
  currentCache = cache;
};

/**
 * 获取当前缓存实现
 * @returns 当前使用的缓存实例
 */
export const getGlobalCache = (): CacheStorage => {
  return currentCache;
};

/**
 * 重置为默认的 localStorage 缓存
 */
export const resetGlobalCache = (): void => {
  currentCache = localStorageCache;
};
