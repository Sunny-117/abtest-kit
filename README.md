# ABTest Kit

[![Unit Test](https://github.com/sunny-117/abtest-kit/actions/workflows/unit-test.yml/badge.svg)](https://github.com/sunny-117/abtest-kit/actions/workflows/unit-test.yml)
[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![bundle][bundle-src]][bundle-href]
[![JSDocs][jsdocs-src]][jsdocs-href]
[![License][license-src]][license-href]

## 简介

🗃️ 轻量级 A/B 测试 SDK，支持多种分流策略和可选的 React 集成。

**核心特性：**

- 🚀 **无依赖核心**：纯 JavaScript 实现，可独立使用
- ⚛️ **可选 React 集成**：提供 Hooks 和 Context API
- 🎯 **多种分流策略**：Random、CRC32、自定义函数
- 💾 **持久化存储**：基于 localStorage 的分流结果缓存
- 🔧 **灵活配置**：支持百度统计或完全自定义
- 📊 **增量更新**：智能的配置变更检测和重新分流
- 🐛 **调试友好**：URL 参数强制命中、可控日志输出
- ✅ **高测试覆盖率**：核心逻辑 100% 覆盖，整体 94%+ 覆盖率

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
import { ABTestProvider, useABTestValue } from 'abtest-kit';

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

#### `<ABTestProvider>`

React 上下文提供者。

```tsx
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
const { abTestConfig, pending, userstat } = useABTest();
```

#### `useABTestValue(testName)`

获取特定测试的值。

```tsx
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

## 6. 全局分流（无React依赖）

### 6.1 概述

全局分流功能允许在页面加载初期自动进行分流，无需依赖React和Provider。分流结果存储在localStorage中，一旦保存就永久保留，确保用户的分流一致性。

**核心特性：**
- ✅ 无React依赖，纯JavaScript实现
- ✅ 第一次调用时执行分流，后续直接读取缓存
- ✅ 分流结果永久保留，用户不会因为刷新页面而改变分流组
- ✅ 支持Random（默认）和CRC32两种策略
- ✅ 开发者可以通过resetGlobalABTest()主动重新分流

### 6.2 使用场景

- 页面加载初期的自动分流
- 不依赖React的纯JavaScript环境
- 需要确定性分流的场景
- 需要跨页面保持分流一致性
- 用户不应该因为刷新页面而改变分流组

### 6.3 基本使用

```javascript
import { initGlobalABTest, getGlobalABTestValue } from 'abtest-kit';

// 定义全局分流配置
const globalABTestConfig = {
  cardRecommendation: {
    key: 'card_recommendation',
    groups: {
      0: 50,  // 对照组 50%
      1: 50   // 实验组 50%
    }
  },
  newFeature: {
    key: 'new_feature',
    groups: {
      0: 50,  // 对照组 50%
      1: 50   // 实验组 50%
    },
    // 单个实验的自定义分流策略（可选）
    strategy: (groups) => {
      // 基于日期的分流示例
      const day = new Date().getDate();
      return day % 2 === 0 ? 0 : 1;
    }
  }
}

// 在页面加载初期初始化全局分流
// 第一次调用时随机分流，之后从localStorage读取
const result = initGlobalABTest(globalABTestConfig);
console.log(result); // { cardRecommendation: 1, newFeature: 0 }

// 在任何地方获取分流值
const cardTestValue = getGlobalABTestValue('cardRecommendation');
console.log(cardTestValue); // 1

// 后续调用initGlobalABTest会直接返回缓存结果
const result2 = initGlobalABTest(globalABTestConfig);
console.log(result2); // { cardRecommendation: 1, newFeature: 0 } (与第一次相同)
```

### 6.4 高级用法

#### 使用CRC32策略（基于用户ID的确定性分流）

```javascript
const result = initGlobalABTest(globalABTestConfig, {
  strategy: 'crc32',
  userId: 'user_123456'
});
```

#### 使用自定义分流策略

自定义分流策略允许您实现特定的分流逻辑，支持全局策略和单个实验策略两种方式。

**全局自定义策略（应用于所有实验）：**

```javascript
// 定义自定义分流策略函数
const myCustomStrategy = (groups) => {
  console.log('Available groups:', groups);
  
  // 示例1：基于日期的分流（每天切换一次）
  const today = new Date().getDate();
  return today % 2 === 0 ? 0 : 1;
  
  // 示例2：使用随机数实现自定义分配
  // const random = Math.random() * 100;
  // let accumulated = 0;
  // for (const [groupId, ratio] of Object.entries(groups)) {
  //   accumulated += ratio;
  //   if (random < accumulated) {
  //     return Number(groupId);
  //   }
  // }
  // return Object.keys(groups)[0]; // 默认返回第一个组
};

// 使用全局自定义策略
const result = initGlobalABTest(globalABTestConfig, {
  strategy: myCustomStrategy
});
```

**单个实验自定义策略（只应用于特定实验）：**

```javascript
// 定义全局分流配置，为特定实验添加自定义策略
const globalABTestConfig = {
  // 使用全局策略的实验
  experimentA: {
    key: 'experiment_a',
    groups: { 0: 50, 1: 50 }
  },
  // 使用单个实验自定义策略的实验
  experimentB: {
    key: 'experiment_b',
    groups: { 0: 50, 1: 50 },
    // 这个策略只会应用于experimentB
    strategy: (groups) => {
      // 示例：基于当前小时的分流
      const hour = new Date().getHours();
      return hour % 2 === 0 ? 0 : 1;
    }
  },
  // 使用不同策略的另一个实验
  experimentC: {
    key: 'experiment_c',
    groups: { 0: 50, 1: 50 },
    // 使用crc32策略（需要在全局选项中提供userId）
    strategy: 'crc32'
  }
};

// 初始化时可以设置全局策略
const result = initGlobalABTest(globalABTestConfig, {
  strategy: 'random', // 全局默认策略
  userId: 'user_123456' // 用于crc32策略
});
```

**优先级：**单个实验的策略会优先于全局策略。如果某个实验配置了自己的strategy，则会忽略全局strategy设置。
```

**自定义策略注意事项：**
- 返回值必须是groups对象中存在的groupId
- 如果返回无效的groupId或函数执行出错，将自动回退到随机策略
- 单个实验的策略会优先于全局策略
- 为实验配置strategy属性可以实现更灵活的分流控制

#### 自定义存储键

```javascript
const result = initGlobalABTest(globalABTestConfig, {
  storageKey: 'my_custom_abtest_key'
});

// 获取时也需要指定相同的键
const value = getGlobalABTestValue('cardRecommendation', 'my_custom_abtest_key');
```

#### 重置分流

```javascript
import { resetGlobalABTest, clearGlobalABTestCache } from 'abtest-kit';

// 清除缓存并重新分流（比如用户登出/登入时）
const newResult = resetGlobalABTest(globalABTestConfig);

// 或仅清除缓存
clearGlobalABTestCache();
```

### 6.5 API 参考

#### `initGlobalABTest(configMap, options?)`

初始化全局分流。第一次调用时执行分流并保存到localStorage，后续调用直接返回缓存结果。

**参数：**
- `configMap`: 分流配置映射，key为测试名称（同时作为代码中的引用名），value为GlobalABTestConfig
  - 每个GlobalABTestConfig对象包含：
    - `key`: 实验上报ID（用于统计上报）
    - `groups`: 分组配置，{ groupId: 比例 }
    - `strategy`: （可选）单个实验的分流策略，'random'、'crc32'或自定义函数
- `options`: 可选配置对象
  - `strategy`: 全局分流策略，'random'（默认）、'crc32'或自定义函数
  - `userId`: 用户ID，crc32策略必需
  - `storageKey`: localStorage存储键，默认DEFAULT_STORAGE_KEY

**自定义策略函数格式：**
```typescript
(groups: { [groupId: number]: number }) => number;
```

**返回值：** GlobalABTestResult 对象，包含每个测试的分流值

#### `getGlobalABTestValue(testName, storageKey?)`

获取指定测试的分流值。

**参数：**
- `testName`: 测试名称
- `storageKey`: localStorage存储键，默认DEFAULT_STORAGE_KEY

**返回值：** 分流值，如果未初始化则返回-1

#### `getGlobalABTestUserstat(storageKey?)` ⭐ 新增

获取所有分流结果的userstat字符串，格式与 `useABTest` 的 `userstat` 一致。

**参数：**
- `storageKey`: localStorage存储键，默认DEFAULT_STORAGE_KEY

**返回值：** 格式化的分流结果字符串，格式为 `key-value;key-value;...`

**说明：**
- 复用 `getUserstat` 的逻辑处理格式
- 不需要传递configMap参数，自动使用initGlobalABTest时保存的配置
- 如果未初始化则返回空字符串

**示例：**
```javascript
// 初始化
initGlobalABTest(globalABTestConfig);

// 获取userstat
const userstat = getGlobalABTestUserstat();
// "card_recommendation-0;new_feature-1"

// 上报统计
window.$abtestUserstat = userstat;
```

#### `clearGlobalABTestCache(storageKey?)`

清除全局分流缓存。

**参数：**
- `storageKey`: localStorage存储键，默认DEFAULT_STORAGE_KEY

#### `resetGlobalABTest(configMap, options?)`

重置全局分流（清除缓存并重新分流）。

**参数：** 同 `initGlobalABTest`

**返回值：** 新的分流结果

### 6.6 完整示例

```javascript
// 在页面加载初期（如在HTML中的内联脚本）
<script>
  const globalABTestConfig = {
    cardRecommendation: {
      key: 'card_recommendation',
      groups: {
        0: 20,  // 对照组 20%
        1: 20,  // 实验组 20%
        '-1': 60 // 空闲组 60%
      }
    }
  };

  // 导入SDK并初始化
  import { initGlobalABTest } from 'abtest-kit';

  const result = initGlobalABTest(globalABTestConfig);
  window.userRecommendationTest = result.cardRecommendation;
</script>

// 在React组件中使用
import { getGlobalABTestValue } from 'abtest-kit';

function MyComponent() {
  const testValue = getGlobalABTestValue('cardRecommendation');

  return (
    <div>
      {testValue === 0 && <p>对照组内容</p>}
      {testValue === 1 && <p>实验组内容</p>}
      {testValue === -1 && <p>空闲组内容</p>}
    </div>
  );
}
```

## 7. 注意事项

1. 默认分流策略下，确保在使用SDK前已正确配置百度统计
2. 初始化是异步的，使用`useABTestValue`时需要考虑`pending`状态
3. 强制命中实验模式仅用于开发调试，不要在生产环境使用
4. 全局分流使用localStorage存储，请确保浏览器支持localStorage
5. 全局分流结果一旦保存就永久保留，除非主动调用 `resetGlobalABTest()` 或 `clearGlobalABTestCache()`
6. 配置变更（包括流量比例调整）会导致重新分流，请谨慎修改配置

## 8. 最佳实践

1. 将A/B测试配置集中管理
2. 使用TypeScript定义配置类型
3. 在关键功能点添加错误处理
4. 合理使用强制测试模式进行开发调试
5. 全局分流应在页面加载初期调用，以确保分流的一致性
6. 为不同的测试使用不同的storageKey，避免冲突

# 其他资料

https://zhuanlan.zhihu.com/p/571901803


## License

💛 [MIT](./LICENSE) License © [Sunny-117](https://github.com/Sunny-117)
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
