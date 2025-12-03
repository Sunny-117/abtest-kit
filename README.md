<h1 align='center'>
<samp>ABTest Kit</samp>
</h1>


<p align='center'>
  <samp>🗃️ Lightweight A/B testing SDK with multiple traffic splitting strategies and optional React integration, built with robuild, only 2.2 kb</samp>
<br>
<br>
<!-- <a href='https://www.npmjs.com/package/abtest-kit'>
<img src='https://img.shields.io/npm/v/abtest-kit?color=333&labelColor=555&style=flat-square' alt='version'/>
</a>
</p> -->

[![Unit Test](https://github.com/sunny-117/abtest-kit/actions/workflows/unit-test.yml/badge.svg)](https://github.com/sunny-117/abtest-kit/actions/workflows/unit-test.yml)
[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![bundle][bundle-src]][bundle-href]
[![JSDocs][jsdocs-src]][jsdocs-href]
[![License][license-src]][license-href]

[简体中文](./README.zh-CN.md) | English

## Introduction

**Core Features:**

- 🚀 **Zero Dependencies Core**: Pure JavaScript implementation, works standalone
- ⚛️ **Optional React Integration**: Provides Hooks and Context API
- 🎯 **Multiple Splitting Strategies**: Random, CRC32, custom functions
- 💾 **Persistent Storage**: localStorage-based result caching
- 🔧 **Flexible Configuration**: Supports Baidu Analytics or fully custom
- 📊 **Incremental Updates**: Smart config change detection and re-splitting
- 🐛 **Debug Friendly**: URL parameter force hit, controllable logging
- ✅ **High Test Coverage**: 100% core logic coverage, 94%+ overall coverage

## Installation

```bash
npm install abtest-kit
# or
pnpm add abtest-kit
# or
yarn add abtest-kit
```

**Optional Dependencies:**

- React 18+ (only required when using React integration)

## Quick Start

### Method 1: Standalone Usage (No React Required)

Suitable for any JavaScript project, perform traffic splitting on page load:

```javascript
import { initGlobalABTest, getGlobalABTestValue } from 'abtest-kit';

// Define splitting configuration
const config = {
  newFeature: {
    key: 'new_feature',
    groups: {
      0: 50,  // Control group 50%
      1: 50   // Experiment group 50%
    }
  }
};

// Initialize splitting (results are automatically cached to localStorage)
const result = initGlobalABTest(config);

// Get splitting value anywhere
const featureValue = getGlobalABTestValue('newFeature');

if (featureValue === 1) {
  // Show new feature
} else {
  // Show old feature
}
```

### Method 2: React Integration

Suitable for React applications, provides reactive splitting state:

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
      {featureValue === 1 ? 'New Feature' : 'Old Feature'}
    </div>
  );
}
```

## Core API

### Standalone API

#### `initGlobalABTest(config, options?)`

Initialize global traffic splitting, results are cached to localStorage.

```typescript
const result = initGlobalABTest(
  {
    test1: {
      key: 'test1',
      groups: { 0: 50, 1: 50 }
    }
  },
  {
    strategy: 'random',  // 'random' | 'crc32' | custom function
    userId: 'user123',   // required for crc32 strategy
    storageKey: '__abtest__'  // custom storage key
  }
);
```

#### `getGlobalABTestValue(testName, storageKey?)`

Get the splitting value for a specific test.

```typescript
const value = getGlobalABTestValue('test1');  // Returns 0 or 1 or -1 (not initialized)
```

#### `getGlobalABTestUserstat(storageKey?)`

Get the statistics string for all splitting results.

```typescript
const userstat = getGlobalABTestUserstat();  // "test_1-0;test_2-1"
```

#### `resetGlobalABTest(config, options?)`

Clear cache and re-split.

```typescript
const newResult = resetGlobalABTest(config);
```

### React API

#### `<ABTestProvider>`

React context provider.

```tsx
<ABTestProvider
  abTestConfig={config}
  options={{ userId: 'user123' }}
  injectScript={() => {
    // Optional: inject Baidu Analytics script
  }}
>
  <App />
</ABTestProvider>
```

#### `useABTest()`

Get the complete AB test context.

```tsx
const { abTestConfig, pending, userstat } = useABTest();
```

#### `useABTestValue(testName)`

Get the value for a specific test.

```tsx
const value = useABTestValue('test1');
```


## Traffic Splitting Strategies

### Random Strategy (Default)

Completely random splitting, randomly assigned on each initialization.

```javascript
initGlobalABTest(config, { strategy: 'random' });
```

### CRC32 Strategy

Deterministic splitting based on user ID, same user always assigned to same group.

```javascript
initGlobalABTest(config, {
  strategy: 'crc32',
  userId: 'user_12345'
});
```

### Custom Strategy

Pass a custom function to implement specific splitting logic.

```javascript
// Global custom strategy
initGlobalABTest(config, {
  strategy: (groups) => {
    // Time-based splitting
    const hour = new Date().getHours();
    return hour % 2 === 0 ? 0 : 1;
  }
});

// Per-experiment custom strategy
const config = {
  test1: {
    key: 'test1',
    groups: { 0: 50, 1: 50 },
    strategy: (groups) => {
      // Only applies to this experiment
      return Math.random() > 0.7 ? 1 : 0;
    }
  }
};
```

### Baidu Analytics Strategy

Integration with Baidu Analytics A/B testing platform (requires React).

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



## Data Flow
![flow](./assets/flow.png)

## Advanced Features

### Global Splitting API

The global splitting feature allows automatic traffic splitting early in page load, without depending on React and Provider. Splitting results are stored in localStorage and permanently retained once saved, ensuring user splitting consistency.

**Core Features:**
- ✅ No React dependency, pure JavaScript implementation
- ✅ Executes splitting on first call, subsequent calls read from cache
- ✅ Splitting results are permanently retained, users won't change groups on page refresh
- ✅ Supports Random (default) and CRC32 strategies
- ✅ Developers can actively re-split via resetGlobalABTest()

#### Basic Usage

```javascript
import { initGlobalABTest, getGlobalABTestValue } from 'abtest-kit';

// Define global splitting configuration
const globalABTestConfig = {
  cardRecommendation: {
    key: 'card_recommendation',
    groups: {
      0: 50,  // Control group 50%
      1: 50   // Experiment group 50%
    }
  },
  newFeature: {
    key: 'newFeature',
    groups: {
      0: 50,  // Control group 50%
      1: 50   // Experiment group 50%
    },
    // Custom splitting strategy for individual experiment (optional)
    strategy: (groups) => {
      // Date-based splitting example
      const day = new Date().getDate();
      return day % 2 === 0 ? 0 : 1;
    }
  }
}

// Initialize global splitting early in page load
const result = initGlobalABTest(globalABTestConfig);
console.log(result); // { cardRecommendation: 1, newFeature: 0 }

// Get splitting value anywhere
const cardTestValue = getGlobalABTestValue('cardRecommendation');
console.log(cardTestValue); // 1
```

#### Using CRC32 Strategy

```javascript
const result = initGlobalABTest(globalABTestConfig, {
  strategy: 'crc32',
  userId: 'user_123456'
});
```

#### Using Custom Splitting Strategy

```javascript
// Global custom strategy
const myCustomStrategy = (groups) => {
  const today = new Date().getDate();
  return today % 2 === 0 ? 0 : 1;
};

const result = initGlobalABTest(globalABTestConfig, {
  strategy: myCustomStrategy
});

// Per-experiment custom strategy
const globalABTestConfig = {
  experimentA: {
    key: 'experimentA',
    groups: { 0: 50, 1: 50 }
  },
  experimentB: {
    key: 'experimentB',
    groups: { 0: 50, 1: 50 },
    strategy: (groups) => {
      const hour = new Date().getHours();
      return hour % 2 === 0 ? 0 : 1;
    }
  }
};
```

#### Get Statistics String

```javascript
import { getGlobalABTestUserstat } from 'abtest-kit';

// Get userstat after initialization
const userstat = getGlobalABTestUserstat();
// "card_recommendation-0;newFeature-1"

// Report statistics
window.$abtestUserstat = userstat;
```

#### Reset Splitting

```javascript
import { resetGlobalABTest, clearGlobalABTestCache } from 'abtest-kit';

// Clear cache and re-split
const newResult = resetGlobalABTest(globalABTestConfig);

// Or just clear cache
clearGlobalABTestCache();
```

## Important Notes

1. React API's default splitting strategy is based on Baidu Analytics, ensure Baidu Analytics experiment splitting is properly configured before using the SDK
2. Initialization is asynchronous, consider the `pending` state when using `useABTestValue`
3. Global splitting uses localStorage, ensure browser supports localStorage
4. Global splitting results are permanently retained once saved, unless actively calling `resetGlobalABTest()` or `clearGlobalABTestCache()`
5. Configuration changes (including traffic ratio adjustments) will trigger re-splitting, modify configuration with caution

## Best Practices

1. Centralize A/B test configuration management
2. Use TypeScript to define configuration types
3. Properly use forced test mode for development debugging
4. Call global splitting early in page load to ensure consistency
5. Use different storageKeys for different tests to avoid conflicts

# Additional Resources

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
