<h1 align='center'>
<samp>ABTest Kit <img src="https://img.shields.io/npm/v/abtest-kit?color=333&labelColor=555&style=flat-square" ></samp>
</h1>


<p align='center'>
  <samp>轻量级 A/B 测试 SDK，支持多种分流策略和可选的 React 集成，基于 robuild 构建，仅 2.2 kb</samp>
<br>
<br>

[![Unit Test](https://github.com/sunny-117/abtest-kit/actions/workflows/unit-test.yml/badge.svg)](https://github.com/sunny-117/abtest-kit/actions/workflows/unit-test.yml)
[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![bundle][bundle-src]][bundle-href]
[![JSDocs][jsdocs-src]][jsdocs-href]
[![License][license-src]][license-href]

[English](./README.md) | 简体中文

## 简介

**核心特性：**

- **无依赖核心**：纯 JavaScript 实现，可独立使用
- **可选 React 集成**：提供 Hooks 和 Context API
- **多种分流策略**：Random、CRC32、自定义函数
- **持久化存储**：基于 localStorage 的分流结果缓存，支持自定义缓存实现
- **灵活配置**：支持百度统计或完全自定义
- **增量更新**：智能的配置变更检测和重新分流
- **调试友好**：URL 参数强制命中、可控日志输出
- **高测试覆盖率**：核心逻辑 100% 覆盖，整体 94%+ 覆盖率

## 安装

```bash
npm install abtest-kit
# 或
pnpm add abtest-kit
# 或
yarn add abtest-kit
```

**可选依赖：**

- React 18+ (仅在使用 React 集成时需要)

## 引入方式

SDK 提供两个独立的入口点，以优化打包体积：

```javascript
// 方式一：仅核心 API（无 React 依赖，更小的包体积）
import { initGlobalABTest, getGlobalABTestValue } from 'abtest-kit';

// 方式二：React 集成（包含 React 组件和 Hooks）
import { ABTestProvider, useABTest, useABTestValue } from 'abtest-kit/react';
```

| 入口 | 包体积 | 需要 React | 适用场景 |
|------|--------|------------|----------|
| `abtest-kit` | ~1.8 KB | 否 | 原生 JS、Vue、Angular 等 |
| `abtest-kit/react` | ~2.4 KB | 是 | React 应用 |

## 快速开始

### 方式一：独立使用（无需 React）

适用于任何 JavaScript 项目，在页面加载时进行分流：

```javascript
import { initGlobalABTest, getGlobalABTestValue } from 'abtest-kit';

// 定义分流配置
const config = {
  newFeature: {
    key: 'new_feature',
    groups: {
      0: 50,  // 对照组 50%
      1: 50   // 实验组 50%
    }
  }
};

// 初始化分流（结果会自动缓存到 localStorage）
const result = initGlobalABTest(config);

// 在任何地方获取分流值
const featureValue = getGlobalABTestValue('newFeature');

if (featureValue === 1) {
  // 显示新功能
} else {
  // 显示旧功能
}
```

### 方式二：React 集成

适用于 React 应用，提供响应式的分流状态：

```tsx
import { ABTestProvider, useABTestValue } from 'abtest-kit/react';

const abTestConfig = {
  featureA: {
    key: 'feature_a',
    value: -1,
    groups: { 0: 50, 1: 50 },
    strategy: 'random'
  }
};

function App() {
  return (
    <ABTestProvider abTestConfig={abTestConfig}>
      <YourComponent />
    </ABTestProvider>
  );
}

function YourComponent() {
  const featureValue = useABTestValue('featureA');

  return (
    <div>
      {featureValue === 1 ? '新功能' : '旧功能'}
    </div>
  );
}
```

## 核心 API

### 独立使用 API

#### `initGlobalABTest(config, options?)`

初始化全局分流，结果会缓存到 localStorage。

```typescript
const result = initGlobalABTest(
  {
    test1: {
      key: 'test1',
      groups: { 0: 50, 1: 50 }
    }
  },
  {
    strategy: 'random',  // 'random' | 'crc32' | 自定义函数
    userId: 'user123',   // crc32 策略需要
    storageKey: '__abtest__'  // 自定义存储键
  }
);
```

#### `getGlobalABTestValue(testName, storageKey?)`

获取指定测试的分流值。

```typescript
const value = getGlobalABTestValue('test1');  // 返回 0 或 1 或 -1（未初始化）
```

#### `getGlobalABTestUserstat(storageKey?)`

获取所有分流结果的统计字符串。

```typescript
const userstat = getGlobalABTestUserstat();  // "test_1-0;test_2-1"
```

#### `resetGlobalABTest(config, options?)`

清除缓存并重新分流。

```typescript
const newResult = resetGlobalABTest(config);
```

### React API

> **注意：** React API 需要从 `abtest-kit/react` 导入

#### `<ABTestProvider>`

React 上下文提供者。

```tsx
import { ABTestProvider } from 'abtest-kit/react';

<ABTestProvider
  abTestConfig={config}
  options={{ userId: 'user123' }}
  injectScript={() => {
    // 可选：注入百度统计脚本
  }}
>
  <App />
</ABTestProvider>
```

#### `useABTest()`

获取完整的 AB 测试上下文。

```tsx
import { useABTest } from 'abtest-kit/react';

const { abTestConfig, pending, userstat } = useABTest();
```

#### `useABTestValue(testName)`

获取特定测试的值。

```tsx
import { useABTestValue } from 'abtest-kit/react';

const value = useABTestValue('test1');
```


## 分流策略

### Random 策略（默认）

完全随机分流，每次初始化时随机分配。

```javascript
initGlobalABTest(config, { strategy: 'random' });
```

### CRC32 策略

基于用户 ID 的确定性分流，同一用户始终分配到相同组。

```javascript
initGlobalABTest(config, {
  strategy: 'crc32',
  userId: 'user_12345'
});
```

**为什么需要 CRC32？**

在 **首屏性能优化** 场景下，我们无法等待分流结果再决定用户路径，因此需要一种**快速且稳定**的分流方案：

- **传统方案问题**：`Math.random()` 是基于 runtime 的，每次刷新都会变化，导致无法确定用户是否被稳定分流到某个实验组，这在性能分析中会造成数据对不齐的问题。
- **CRC32 优势**：
  - 实现**稳定、可复现**的实验分组
  - 保证 **首屏加载无需等待分流结果**
  - 确保 **分子、分母埋点统计口径一致**
  - SQL 中可以直接使用 `crc32(userId) % 100` 进行分流

### 自定义策略

传入自定义函数实现特定分流逻辑。

```javascript
// 全局自定义策略
initGlobalABTest(config, {
  strategy: (groups) => {
    // 基于时间的分流
    const hour = new Date().getHours();
    return hour % 2 === 0 ? 0 : 1;
  }
});

// 单个实验自定义策略
const config = {
  test1: {
    key: 'test1',
    groups: { 0: 50, 1: 50 },
    strategy: (groups) => {
      // 只对这个实验生效
      return Math.random() > 0.7 ? 1 : 0;
    }
  }
};
```

### 百度统计策略

与百度统计 A/B 测试平台集成（需要在 React 中使用）。

```tsx
import { ABTestProvider } from 'abtest-kit/react';

<ABTestProvider
  abTestConfig={{
    test1: {
      key: 'test1',
      value: -1,
      strategy: 'baiduTongji'
    }
  }}
  injectScript={() => {
    const script = document.createElement('script');
    script.src = '//hm.baidu.com/hm.js?YOUR_SITE_ID';
    document.head.appendChild(script);
  }}
>
  <App />
</ABTestProvider>
```

## 数据流

![flow](./assets/flow.png)

## 架构设计

### 设计原则

1. **最小化依赖**：核心功能不依赖任何框架
2. **渐进增强**：React 集成作为可选扩展
3. **灵活可扩展**：支持自定义策略和缓存实现
4. **性能优先**：初始化耗时 <5ms，内存占用 <1KB
5. **开发体验**：完整的 TypeScript 类型支持

### 架构分层

```
+-------------------------------------------------------------+
|                      应用层 (Application)                     |
|  +---------------------+  +-----------------------------+   |
|  |   React 应用        |  |   非 React 应用              |   |
|  |   (Vue/Angular/原生) |  |   (页面加载初期/纯 JS)        |   |
|  +----------+----------+  +--------------+--------------+   |
+-------------|-----------------------------|------------------+
              |                             |
+-------------v-----------------------------v------------------+
|                      SDK 接入层 (Entry Points)                |
|  +---------------------+  +-----------------------------+   |
|  |  abtest-kit/react   |  |       abtest-kit            |   |
|  |  (~2.4 KB)          |  |       (~1.8 KB)             |   |
|  |  - ABTestProvider   |  |  - initGlobalABTest         |   |
|  |  - useABTest        |  |  - getGlobalABTestValue     |   |
|  |  - useABTestValue   |  |  - setGlobalCache           |   |
|  +----------+----------+  +--------------+--------------+   |
+-------------|-----------------------------|------------------+
              |                             |
              +-------------+---------------+
                            |
+---------------------------v---------------------------------+
|                      核心层 (Core)                            |
|  +--------------+ +--------------+ +----------------------+ |
|  | 分流策略      | | 存储管理      | | 工具函数             | |
|  | - Random     | | - CacheStorage| | - Logger            | |
|  | - CRC32      | | - localStorage| | - forceHitTestFlag  | |
|  | - Custom     | | - 自定义实现   | | - getConfigHash     | |
|  | - BaiduTongji| +--------------+ +----------------------+ |
|  +--------------+                                           |
+-------------------------------------------------------------+
```

### 增量更新算法

```
输入: 新配置 configMap
      |
从缓存读取: storedResult, storedConfigHashes
      |
遍历 configMap 中每个 key:
      |
      +-- key 存在于缓存 且 configHash 未变？
      |       -> 保持原值
      |
      +-- key 存在于缓存 但 configHash 变了？
      |       -> 重新分流
      |
      +-- key 不存在于缓存？
              -> 新分流
      |
保存新结果（只包含当前 configMap 的 key）
      |
返回分流结果
```

### 存储结构

```json
{
  "result": {
    "experimentA": 0,
    "experimentB": 1
  },
  "configHashes": {
    "experimentA": "0:50|1:50",
    "experimentB": "0:30|1:70"
  }
}
```

## 高级功能

### 自定义缓存

默认使用 `localStorage` 存储分流结果，你可以通过 `setGlobalCache` 自定义缓存实现。

#### 缓存接口

```typescript
interface CacheStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}
```

#### 使用 sessionStorage

```javascript
import { setGlobalCache, initGlobalABTest } from 'abtest-kit';

setGlobalCache({
  getItem: (key) => sessionStorage.getItem(key),
  setItem: (key, value) => sessionStorage.setItem(key, value),
  removeItem: (key) => sessionStorage.removeItem(key)
});

initGlobalABTest(config);
```

#### 使用 Cookie

```javascript
import { setGlobalCache } from 'abtest-kit';

setGlobalCache({
  getItem: (key) => getCookie(key),
  setItem: (key, value) => setCookie(key, value, { expires: 365 }),
  removeItem: (key) => deleteCookie(key)
});
```

#### 使用 IndexedDB

```javascript
import { setGlobalCache } from 'abtest-kit';

const cache = new Map();

async function initCache() {
  const data = await loadFromIndexedDB();
  data.forEach((value, key) => cache.set(key, value));
}

setGlobalCache({
  getItem: (key) => cache.get(key) ?? null,
  setItem: (key, value) => {
    cache.set(key, value);
    saveToIndexedDB(key, value);
  },
  removeItem: (key) => {
    cache.delete(key);
    removeFromIndexedDB(key);
  }
});
```

#### 重置为默认缓存

```javascript
import { resetGlobalCache } from 'abtest-kit';

resetGlobalCache();
```

### 调试工具

**强制命中模式：**

```
https://example.com?forceHitTestFlag=experiment_a-1;experiment_b-0
```

- 通过 URL 参数强制指定分流结果
- 便于开发和测试

**日志控制：**

```typescript
import { logger, LogLevel } from 'abtest-kit';

logger.setLevel(LogLevel.DEBUG);  // 开启详细日志
logger.setLevel(LogLevel.ERROR);  // 仅显示错误
```

## 注意事项

1. React API 的默认分流策略是基于百度统计，所以确保在使用SDK前已正确配置百度统计实验分流
2. 初始化是异步的，使用`useABTestValue`时需要考虑`pending`状态
3. 全局分流默认使用localStorage存储，请确保浏览器支持 localStorage，或使用 `setGlobalCache` 自定义缓存
4. 全局分流结果一旦保存就永久保留，除非主动调用 `resetGlobalABTest()` 或 `clearGlobalABTestCache()`
5. 配置变更（包括流量比例调整）会导致重新分流，请谨慎修改配置
6. 自定义缓存需在调用 `initGlobalABTest` 之前设置

## 最佳实践

1. 将A/B测试配置集中管理
2. 使用TypeScript定义配置类型
3. 合理使用强制测试模式进行开发调试
4. 全局分流应在页面加载初期调用，以确保分流的一致性
5. 为不同的测试使用不同的storageKey，避免冲突

## 性能指标

| 指标 | 数值 |
|------|------|
| 初始化耗时 | <5ms |
| 内存占用 | <1KB |
| 核心包体积 | ~1.8KB (gzip) |
| React 包体积 | ~2.4KB (gzip) |

## 兼容性

- 浏览器：支持 ES6+ 的现代浏览器
- React：18.0+
- Node.js：用于 SSR 时需提供 localStorage polyfill

## License

[MIT](./LICENSE) License © [Sunny-117](https://github.com/Sunny-117)

<!-- Badges -->

[npm-version-src]: https://img.shields.io/npm/v/abtest-kit?style=flat&colorA=080f12&colorB=1fa669
[npm-version-href]: https://npmjs.com/package/abtest-kit
[npm-downloads-src]: https://img.shields.io/npm/dm/abtest-kit?style=flat&colorA=080f12&colorB=1fa669
[npm-downloads-href]: https://npmjs.com/package/abtest-kit
[bundle-src]: https://img.shields.io/bundlephobia/minzip/abtest-kit?style=flat&colorA=080f12&colorB=1fa669&label=minzip
[bundle-href]: https://bundlephobia.com/result?p=abtest-kit
[license-src]: https://img.shields.io/github/license/Sunny-117/abtest-kit.svg?style=flat&colorA=080f12&colorB=1fa669
[license-href]: https://github.com/Sunny-117/abtest-kit/blob/main/LICENSE
[jsdocs-src]: https://img.shields.io/badge/jsdocs-reference-080f12?style=flat&colorA=080f12&colorB=1fa669
[jsdocs-href]: https://www.jsdocs.io/package/abtest-kit
