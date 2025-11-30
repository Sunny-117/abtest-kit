# ABTest SDK 使用文档

## 1. 简介

基于百度统计（Tongji）A/B测试的React SDK【支持自定义分流策略】，提供了简单易用的A/B测试功能集成。该SDK支持与百度统计无缝集成，并提供了强制命中实验模式用于调试。

- 通过hooks API获取实验值
- 自动订阅Context状态变化
- 实验值变化会触发组件重新渲染

## 2. 安装

```bash
npm install abtest-kit
# 或
pnpm add abtest-kit
```

## 3. 核心功能

### 3.1 初始化配置

SDK提供了以下主要组件和功能：

1. `ABTestProvider`: React上下文提供者，用于管理全局A/B测试状态
2. `useABTest`: Hook用于访问A/B测试上下文
3. `useABTestValue`: Hook用于获取特定A/B测试的值
4. `initABTestsConfig`: 初始化A/B测试配置的函数

### 3.2 使用示例

```jsx
import { ABTestProvider, useABTestValue } from 'abtest-kit';

// 定义A/B测试配置
const abTestConfig = {
  featureA: {
    key: 'feature_a',
    paramName: 'feature_a_test',
    value: -1
  },
  featureB: {
    key: 'feature_b',
    paramName: 'feature_b_test',
    value: -1
  }
};

// 在应用根组件中使用Provider
function App() {
  return (
    <ABTestProvider
      abTestConfig={abTestConfig}
      injectScript={() => {
        // 注入百度统计脚本
        const script = document.createElement('script');
        script.src = '//hm.baidu.com/hm.js?YOUR_SITE_ID';
        document.head.appendChild(script);
      }}
    >
      <YourApp />
    </ABTestProvider>
  );
}

// 在组件中使用A/B测试
function YourComponent() {
  const featureAValue = useABTestValue('featureA');

  return (
    <div>
      {featureAValue === 1 ? '实验组' : '对照组'}
    </div>
  );
}
```

## 4. 架构设计

### 4.1 核心架构

SDK采用React Context API实现状态管理，主要包含以下部分：

1. **状态管理层**

- - 使用React Context管理全局A/B测试状态
  - 提供状态访问和更新的接口

1. **初始化层**

- - 负责与百度统计集成
  - 处理A/B测试配置的初始化
  - 支持异步加载和状态更新

1. **工具层**

- - 提供URL参数解析
  - 支持强制命中实验策略
  - 提供用户统计信息生成

### 4.2 数据流
![flow](./assets/flow.png)


## 5. 高级特性

### 5.1 强制命中实验模式

通过URL参数`forceHitTestFlag`可以强制设置A/B测试的值，格式为：

```plain
?forceHitTestFlag=feature_a-1;feature_b-0
```

### 5.2 实验命中统计

SDK会自动生成实验命中统计信息（userstat），格式为：

```plain
feature_a-1;feature_b-0
```

### 5.3 自定义分流策略

1. 百度统计分流（默认）
2. 随机分流
3. CRC32分流

```jsx
// 使用百度统计策略（默认）
function AppWithBaiduTongji() {
  return (
    <ABTestProvider 
      abTestConfig={abTestConfig}
      injectScript={() => {
        const script = document.createElement('script');
        script.src = '//hm.baidu.com/hm.js?YOUR_SITE_ID';
        document.head.appendChild(script);
      }}
    >
      <App />
    </ABTestProvider>
  );
}

// 使用随机分流策略
function AppWithRandom() {
  return (
    <ABTestProvider 
      abTestConfig={abTestConfig}
      options={{
        strategy: 'random'
      }}
    >
      <App />
    </ABTestProvider>
  );
}
```

**策略模式：**SDK采用了策略模式来实现不同的分流策略：

1. **策略接口**

- - 每个策略都实现了相同的接口
  - 包含 `name` 和 `getValue` 方法
  - `getValue` 方法返回 Promise，确保异步兼容性

1. **策略工厂**

- - 通过 `getStrategy` 函数获取对应的策略实现
  - 支持策略的动态切换
  - 提供默认回退机制

**配置选项**

```tsx
interface ABTestOptions {
  strategy?: 'baiduTongji' | 'random' | 'crc32';
  userId?: string;  // 用于CRC32策略
}
```

源码实现：

```js
import crc32 from 'crc-32';

// 百度统计分流策略
export const baiduTongjiStrategy = {
    name: 'baiduTongji',
    getValue: async (config) => {
        return new Promise(resolve => {
            window._hmt.push(['_fetchABTest', {
                paramName: config.paramName,
                defaultValue: -1,
                callback: function (value) {
                    resolve(value);
                }
            }]);
        });
    }
};

// 随机分流策略
export const randomStrategy = {
    name: 'random',
    getValue: async (config) => {
        return Math.random() < 0.5 ? 0 : 1;
    }
};

// CRC32分流策略
export const crc32Strategy = {
    name: 'crc32',
    getValue: async (config, userId) => {
        if (!userId) {
            console.warn('CRC32 strategy requires userId');
            return -1;
        }
        const hash = crc32.str(userId);
        const unsigned = hash >>> 0;
        return unsigned % 2; // 返回0或1
    }
};

// 策略工厂
export const getStrategy = (strategyName) => {
    switch (strategyName) {
        case 'baiduTongji':
            return baiduTongjiStrategy;
        case 'random':
            return randomStrategy;
        case 'crc32':
            return crc32Strategy;
        default:
            console.warn(`Unknown strategy: ${strategyName}, falling back to baiduTongji`);
            return baiduTongjiStrategy;
    }
};
```

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
    paramName: 'card_recommendation_test',
    groups: {
      0: 50,  // 对照组 50%
      1: 50   // 实验组 50%
    }
  },
  newFeature: {
    key: 'new_feature',
    paramName: 'new_feature_test',
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
    paramName: 'experiment_a_test',
    groups: { 0: 50, 1: 50 }
  },
  // 使用单个实验自定义策略的实验
  experimentB: {
    key: 'experiment_b',
    paramName: 'experiment_b_test',
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
    paramName: 'experiment_c_test',
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
- `configMap`: 分流配置映射，key为测试名称，value为GlobalABTestConfig
  - 每个GlobalABTestConfig对象包含：
    - `key`: 实验键名
    - `paramName`: 实验参数名
    - `groups`: 分组配置，{ groupId: 比例 }
    - `strategy`: （可选）单个实验的分流策略，'random'、'crc32'或自定义函数
- `options`: 可选配置对象
  - `strategy`: 全局分流策略，'random'（默认）、'crc32'或自定义函数
  - `userId`: 用户ID，crc32策略必需
  - `storageKey`: localStorage存储键，默认'__global_abtest__'

**自定义策略函数格式：**
```typescript
(groups: { [groupId: number]: number }) => number;
```

**返回值：** GlobalABTestResult 对象，包含每个测试的分流值

#### `getGlobalABTestValue(testName, storageKey?)`

获取指定测试的分流值。

**参数：**
- `testName`: 测试名称
- `storageKey`: localStorage存储键，默认'__global_abtest__'

**返回值：** 分流值，如果未初始化则返回-1

#### `getGlobalABTestUserstat(storageKey?)` ⭐ 新增

获取所有分流结果的userstat字符串，格式与 `useABTest` 的 `userstat` 一致。

**参数：**
- `storageKey`: localStorage存储键，默认'__global_abtest__'

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
- `storageKey`: localStorage存储键，默认'__global_abtest__'

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
      paramName: 'card_recommendation_test',
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
