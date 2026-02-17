# ABTest Kit 架构设计文档

## 目录

1. [项目概述](#1-项目概述)
2. [整体架构](#2-整体架构)
3. [目录结构](#3-目录结构)
4. [核心模块设计](#4-核心模块设计)
5. [分流策略](#5-分流策略)
6. [存储机制](#6-存储机制)
7. [数据流](#7-数据流)
8. [设计决策](#8-设计决策)
9. [扩展机制](#9-扩展机制)

---

## 1. 项目概述

### 1.1 项目定位

ABTest Kit 是一个轻量级的 A/B 测试 SDK，专为前端应用设计。它提供了灵活的流量分流能力，支持多种分流策略，并可选集成 React 框架。

### 1.2 核心特性

| 特性 | 说明 |
|------|------|
| 零依赖核心 | 核心功能无任何第三方依赖，纯 JavaScript 实现 |
| 可选 React 集成 | 提供 Hooks 和 Context API，按需引入 |
| 多种分流策略 | Random、CRC32、自定义函数、百度统计 |
| 持久化存储 | 基于 localStorage，支持自定义缓存实现 |
| 增量更新 | 智能检测配置变更，最小化重新分流 |
| 调试友好 | URL 参数强制命中、可控日志输出 |

### 1.3 设计原则

1. **最小化依赖**：核心功能不依赖任何框架
2. **渐进增强**：React 集成作为可选扩展
3. **灵活可扩展**：支持自定义策略和缓存实现
4. **性能优先**：初始化耗时 <5ms，内存占用 <1KB
5. **开发体验**：完整的 TypeScript 类型支持

---

## 2. 整体架构

### 2.1 架构分层

```
┌─────────────────────────────────────────────────────────────┐
│                      应用层 (Application)                     │
│  ┌─────────────────────┐  ┌─────────────────────────────┐   │
│  │   React 应用        │  │   非 React 应用              │   │
│  │   (Vue/Angular/原生) │  │   (页面加载初期/纯 JS)        │   │
│  └──────────┬──────────┘  └──────────────┬──────────────┘   │
└─────────────┼────────────────────────────┼──────────────────┘
              │                            │
┌─────────────▼────────────────────────────▼──────────────────┐
│                      SDK 接入层 (Entry Points)                │
│  ┌─────────────────────┐  ┌─────────────────────────────┐   │
│  │  abtest-kit/react   │  │       abtest-kit            │   │
│  │  (~2.4 KB)          │  │       (~1.8 KB)             │   │
│  │  • ABTestProvider   │  │  • initGlobalABTest         │   │
│  │  • useABTest        │  │  • getGlobalABTestValue     │   │
│  │  • useABTestValue   │  │  • setGlobalCache           │   │
│  └──────────┬──────────┘  └──────────────┬──────────────┘   │
└─────────────┼────────────────────────────┼──────────────────┘
              │                            │
              └────────────┬───────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│                      核心层 (Core)                            │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────────────┐ │
│  │ 分流策略      │ │ 存储管理      │ │ 工具函数             │ │
│  │ • Random     │ │ • CacheStorage│ │ • Logger            │ │
│  │ • CRC32      │ │ • localStorage│ │ • forceHitTestFlag  │ │
│  │ • Custom     │ │ • 自定义实现   │ │ • getConfigHash     │ │
│  │ • BaiduTongji│ └──────────────┘ └──────────────────────┘ │
│  └──────────────┘                                           │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 双入口设计

SDK 采用双入口设计，优化打包体积：

| 入口 | 包体积 | 依赖 | 适用场景 |
|------|--------|------|----------|
| `abtest-kit` | ~1.8 KB | 无 | 原生 JS、Vue、Angular、页面加载初期 |
| `abtest-kit/react` | ~2.4 KB | React 18+ | React 应用 |

---

## 3. 目录结构

```
src/
├── core/                    # 核心模块（无框架依赖）
│   ├── types.ts             # 类型定义
│   ├── constant.ts          # 常量定义
│   ├── logger.ts            # 日志工具
│   ├── storage.ts           # 缓存抽象层
│   ├── resolveStrategy.ts   # 分流策略解析
│   ├── globalABTest.ts      # 全局分流 API
│   ├── builtin.ts           # 内置策略（百度统计）
│   ├── forceHitTestFlag.ts  # 强制命中调试
│   └── index.ts             # 核心模块导出
│
├── react/                   # React 集成模块
│   ├── types.ts             # React 相关类型
│   ├── ABTestProvider.tsx   # Context Provider
│   ├── hooks.ts             # React Hooks
│   └── index.ts             # React 模块导出
│
├── index.ts                 # 主入口（核心 API）
└── __tests__/               # 测试文件
    ├── globalABTest.test.ts
    ├── resolveStrategy.test.ts
    ├── builtin.test.ts
    └── forceHitTestFlag.test.ts
```

---

## 4. 核心模块设计

### 4.1 类型系统 (types.ts)

```typescript
// 分流策略类型
type StrategyType = 'baiduTongji' | 'random' | 'crc32' | CustomStrategyFunction;

// 自定义策略函数签名
type CustomStrategyFunction = (groups: { [groupId: number]: number }) => number;

// AB 测试配置
interface ABTestConfig {
  key: string;                              // 实验标识
  value: number;                            // 分流结果
  groups?: { [groupId: number]: number };   // 分流比例配置
  strategy?: StrategyType;                  // 分流策略
}

// 缓存接口（支持自定义实现）
interface CacheStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}
```

### 4.2 分流策略解析 (resolveStrategy.ts)

核心函数 `resolveStrategyGroupId` 统一处理所有分流策略：

```typescript
resolveStrategyGroupId(strategy, groups, userId?, testName?) → groupId
```

**处理流程：**

```
┌─────────────────┐
│ 输入：strategy   │
└────────┬────────┘
         │
         ▼
    ┌────────────┐     ┌──────────────────┐
    │ crc32?     │──是─▶│ 检查 userId      │
    └────────────┘      │ 有: getCrc32GroupId │
         │否            │ 无: 返回 -1 + 警告  │
         ▼              └──────────────────┘
    ┌────────────┐     ┌──────────────────┐
    │ function?  │──是─▶│ 执行自定义函数    │
    └────────────┘      │ 验证返回值       │
         │否            │ 异常: 回退 random │
         ▼              └──────────────────┘
    ┌────────────┐
    │ random     │──────▶ getRandomGroupId
    └────────────┘
```

### 4.3 全局分流 (globalABTest.ts)

全局分流系统是 SDK 的核心，提供无框架依赖的分流能力。

**核心函数：**

| 函数 | 说明 |
|------|------|
| `initGlobalABTest` | 初始化分流，支持增量更新 |
| `getGlobalABTestValue` | 获取指定实验的分流值 |
| `getGlobalABTestUserstat` | 获取统计字符串 |
| `resetGlobalABTest` | 清除缓存并重新分流 |
| `clearGlobalABTestCache` | 仅清除缓存 |

**增量更新算法：**

```
输入: 新配置 configMap
      ↓
从缓存读取: storedResult, storedConfigHashes
      ↓
遍历 configMap 中每个 key:
      │
      ├── key 存在于缓存 且 configHash 未变？
      │       → 保持原值
      │
      ├── key 存在于缓存 但 configHash 变了？
      │       → 重新分流
      │
      └── key 不存在于缓存？
              → 新分流
      ↓
保存新结果（只包含当前 configMap 的 key）
      ↓
返回分流结果
```

### 4.4 缓存抽象层 (storage.ts)

```typescript
// 默认实现
const localStorageCache: CacheStorage = {
  getItem: (key) => localStorage.getItem(key),
  setItem: (key, value) => localStorage.setItem(key, value),
  removeItem: (key) => localStorage.removeItem(key)
};

// 全局缓存实例
let currentCache: CacheStorage = localStorageCache;

// API
setGlobalCache(cache)    // 设置自定义缓存
getGlobalCache()         // 获取当前缓存
resetGlobalCache()       // 重置为默认
```

### 4.5 React 集成 (ABTestProvider.tsx)

```
┌─────────────────────────────────────────┐
│          ABTestProvider                 │
│  ┌───────────────────────────────────┐  │
│  │        ABTestContext              │  │
│  │  • abTestConfig: 配置映射         │  │
│  │  • pending: 加载状态              │  │
│  │  • userstat: 统计字符串           │  │
│  └───────────────────────────────────┘  │
│                  │                      │
│                  ▼                      │
│  ┌───────────────────────────────────┐  │
│  │      initABTestsConfig()          │  │
│  │  1. 检查 forceHitTestFlag         │  │
│  │  2. 解析每个实验的策略            │  │
│  │  3. 执行分流（百度统计/本地策略）  │  │
│  │  4. 更新 Context state            │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

---

## 5. 分流策略

### 5.1 Random 策略（默认）

```typescript
getRandomGroupId(groups: { [groupId: number]: number }): number
```

**原理：**
1. 生成 0-100 的随机数
2. 按比例累加，找到落入的分组
3. 结果存入缓存，后续直接读取

**特点：**
- 简单快速
- 同一设备/浏览器内分流一致
- 不同用户分流比例可能不均匀

### 5.2 CRC32 策略

```typescript
getCrc32GroupId(userId: string, groups): number
```

**原理：**
1. 对 userId 计算 CRC32 哈希值
2. 哈希值取模 100，得到 0-99 的确定值
3. 按比例映射到分组

**特点：**
- 确定性分流，同一 userId 总是分到同一组
- 分流比例均匀
- 支持跨设备/跨域一致性
- 可在 SQL 中复现：`crc32(userId) % 100`

**为什么需要 CRC32？**

在 **首屏性能优化** 场景下，我们无法等待分流结果再决定用户路径，因此需要一种**快速且稳定**的分流方案。
* **传统方案问题**
  `Math.random()` 是基于 runtime 的，每次刷新都会变化，导致无法确定用户是否被稳定分流到某个实验组。这在性能分析中会造成数据对不齐的问题。

* **性能分析困难点**
  当我们分析「进入直播间前卡」的性能时，它作为性能统计的 **分母**。但由于随机分流的不确定性：

  * 埋点虽然会带上实验参数，但只能作为 **分子数据** 存在；
  * 分母部分（前卡曝光或点击）却无法准确对应，导致实验结果不可信。

* **现实影响**
  如果用户在直播间加载完成前就退出，进入直播间的埋点不会被触发，造成「直播间进入率 = 进入直播间 / 前卡点击」统计偏差。

**引入 CRC32 的意义**：通过对 `bd_vid`（或其他稳定标识）进行 **CRC32 哈希** 分流：

* 实现**稳定、可复现**的实验分组；
* 保证 **首屏加载无需等待分流结果**；
* 确保 **分子、分母埋点统计口径一致**；
* 让性能数据具备可比性与可追踪性。
* sql 中可以直接使用 `crc32(bd_vid) % 100` 进行分流。

### 5.3 自定义策略

```typescript
const myStrategy = (groups) => {
  // 基于时间的分流示例
  const hour = new Date().getHours();
  return hour % 2 === 0 ? 0 : 1;
};

initGlobalABTest(config, { strategy: myStrategy });
```

**安全机制：**
- 验证返回值是否为有效 groupId
- 异常时自动回退到 Random 策略

### 5.4 百度统计策略

```typescript
baiduTongjiStrategy.getValue(config, userId): Promise<number>
```

**特点：**
- 异步获取分流值
- 依赖百度统计 SDK (`window._hmt`)
- 在百度统计后台配置分流规则

---

## 6. 存储机制

### 6.1 存储结构

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

| 字段 | 说明 |
|------|------|
| `result` | 各实验的分流结果 |
| `configHashes` | 配置哈希，用于检测变更 |

### 6.2 配置哈希计算

```typescript
getConfigHash({ 0: 50, 1: 50 }) → "0:50|1:50"
```

- 对 groupId 排序后拼接
- 任何配置变化都会产生不同哈希
- 用于判断是否需要重新分流

### 6.3 自定义缓存实现

```typescript
// sessionStorage
setGlobalCache({
  getItem: (key) => sessionStorage.getItem(key),
  setItem: (key, value) => sessionStorage.setItem(key, value),
  removeItem: (key) => sessionStorage.removeItem(key)
});

// Cookie（需自行实现工具函数）
setGlobalCache({
  getItem: (key) => getCookie(key),
  setItem: (key, value) => setCookie(key, value, { expires: 365 }),
  removeItem: (key) => deleteCookie(key)
});

// IndexedDB（需包装为同步接口）
const cache = new Map();
setGlobalCache({
  getItem: (key) => cache.get(key) ?? null,
  setItem: (key, value) => { cache.set(key, value); saveToIDB(key, value); },
  removeItem: (key) => { cache.delete(key); removeFromIDB(key); }
});
```

---

## 7. 数据流

### 7.1 全局分流数据流

```
┌─────────────────────────────────────────────────────────────┐
│                    initGlobalABTest(config)                 │
└─────────────────────────────┬───────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    读取缓存数据                              │
│        getGlobalCache().getItem(storageKey)                 │
└─────────────────────────────┬───────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    增量更新判断                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │ 新增 key    │  │ 已存在 key  │  │ 配置变更 key        │  │
│  │ → 执行分流  │  │ hash 相同   │  │ hash 不同           │  │
│  │             │  │ → 保持原值  │  │ → 重新分流          │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────────────┬───────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    执行分流策略                              │
│              resolveStrategyGroupId(...)                    │
└─────────────────────────────┬───────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    保存结果到缓存                            │
│        getGlobalCache().setItem(storageKey, data)           │
└─────────────────────────────┬───────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    返回分流结果                              │
│           { experimentA: 0, experimentB: 1 }                │
└─────────────────────────────────────────────────────────────┘
```

### 7.2 React 分流数据流

```
┌─────────────────────────────────────────────────────────────┐
│                    <ABTestProvider>                         │
│                          │                                  │
│                          ▼                                  │
│              initABTestsConfig(config)                      │
│                          │                                  │
│     ┌────────────────────┼────────────────────┐             │
│     ▼                    ▼                    ▼             │
│ ┌────────┐        ┌────────────┐       ┌────────────┐       │
│ │强制命中 │        │ 本地策略   │       │ 百度统计   │       │
│ │URL参数  │        │ random/crc32│      │ 异步获取   │       │
│ └────────┘        └────────────┘       └────────────┘       │
│     │                    │                    │             │
│     └────────────────────┼────────────────────┘             │
│                          ▼                                  │
│              更新 ABTestContext.state                       │
│                          │                                  │
│                          ▼                                  │
│                    子组件渲染                                │
│              useABTest() / useABTestValue()                 │
└─────────────────────────────────────────────────────────────┘
```

---

## 8. 设计决策

### 8.1 为什么采用双入口设计？

**问题：** React 依赖会增加打包体积，非 React 项目不需要这部分代码。

**方案：**
- 核心逻辑与 React 集成分离
- 两个独立入口，按需引入
- Tree-shaking 友好

### 8.2 为什么需要配置哈希？

**问题：** 如何检测配置是否变更？

**方案：**
- 对 groups 配置计算哈希字符串
- 存储时保存 configHash
- 下次初始化时比较哈希

**优点：**
- 快速比较，O(1) 复杂度
- 任何配置变化都能检测到

### 8.3 为什么分流结果永久保留？

**问题：** 用户刷新页面后分流结果应该保持一致还是变化？

**决策：** 永久保留（除非主动重置）

**原因：**
- 用户体验一致性
- 实验数据准确性
- 避免同一用户被多次分流到不同组

### 8.4 为什么抽象缓存接口？

**问题：** localStorage 不适用于所有场景（SSR、特殊隐私要求等）

**方案：**
- 定义 `CacheStorage` 接口
- 默认使用 localStorage
- 支持自定义实现（sessionStorage、Cookie、IndexedDB 等）

---

## 9. 扩展机制

### 9.1 自定义分流策略

```typescript
// 基于地理位置的分流
const geoStrategy = (groups) => {
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  if (timezone.includes('Asia')) return 1;
  return 0;
};

initGlobalABTest(config, { strategy: geoStrategy });
```

### 9.2 自定义缓存实现

```typescript
// 带 TTL 的缓存
const ttlCache = {
  getItem(key) {
    const item = localStorage.getItem(key);
    if (!item) return null;
    const { value, expiry } = JSON.parse(item);
    if (Date.now() > expiry) {
      localStorage.removeItem(key);
      return null;
    }
    return value;
  },
  setItem(key, value) {
    const item = { value, expiry: Date.now() + 7 * 24 * 60 * 60 * 1000 };
    localStorage.setItem(key, JSON.stringify(item));
  },
  removeItem(key) {
    localStorage.removeItem(key);
  }
};

setGlobalCache(ttlCache);
```

### 9.3 调试工具

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

---

## 附录

### A. 性能指标

| 指标 | 数值 |
|------|------|
| 初始化耗时 | <5ms |
| 内存占用 | <1KB |
| 核心包体积 | ~1.8KB (gzip) |
| React 包体积 | ~2.4KB (gzip) |

### B. 兼容性

- 浏览器：支持 ES6+ 的现代浏览器
- React：18.0+
- Node.js：用于 SSR 时需提供 localStorage polyfill

### C. 相关链接

- [A/B 测试基础知识](https://zhuanlan.zhihu.com/p/571901803)
- [CRC32 算法详解](./ref/CRC32.md)
- [增量更新机制](./ref/COMPLETE_INCREMENTAL_UPDATE.md)
