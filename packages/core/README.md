# @abtest/core

ABTest 核心包，提供实验管理和分配的基础功能。

## 功能特性

- 实验配置管理
- 实验分配结果管理
- 模拟实验分配

## 安装

```bash
npm install @abtest/core
```

## 使用示例

### 基本用法

```typescript
import { ABTestManager } from '@abtest/core';

// 创建 ABTest 管理器实例
const abTestManager = new ABTestManager();

// 添加实验分配结果
abTestManager.addAllocation('feature-x', {
  experimentId: 'feature-x',
  variantId: 'new'
});

// 获取实验分配结果
const allocation = abTestManager.getAllocation('feature-x');
console.log(allocation?.variantId); // 'new'
```

### 模拟实验分配

```typescript
import { mockAllocateExperiments } from '@abtest/core';

// 定义实验配置
const experiments = [
  {
    id: 'feature-x',
    name: 'Feature X Test',
    variants: ['new', 'old']
  }
];

// 获取实验分配结果
const allocations = await mockAllocateExperiments(experiments);
console.log(allocations); // [{ experimentId: 'feature-x', variantId: 'new' }]
```

## API

### ABTestManager

- `constructor(options?: ABTestOptions)`: 创建 ABTest 管理器实例
- `addAllocation(experimentId: string, allocation: Allocation)`: 添加实验分配结果
- `getAllocation(experimentId: string)`: 获取实验分配结果
- `getAllAllocations()`: 获取所有实验分配结果

### mockAllocateExperiments

- `mockAllocateExperiments(experiments: Experiment[]): Promise<Allocation[]>`: 模拟实验分配

## 类型定义

```typescript
interface Experiment {
  id: string;
  name: string;
  variants: string[];
}

interface Allocation {
  experimentId: string;
  variantId: string;
}

interface ABTestOptions {
  initialAllocations?: Record<string, Allocation>;
}
``` 