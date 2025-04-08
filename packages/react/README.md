# @abtest/react

ABTest 的 React 实现，提供 React 组件和 Hook 来管理实验。

## 功能特性

- React 组件支持
- 实验状态管理
- 条件渲染
- 多实验场景支持

## 安装

```bash
npm install @abtest/react
```

## 使用示例

### 基本用法

```tsx
import { ABTestProvider, ABTestContainer, ABTestVariant, useABTest } from '@abtest/react';

// 默认组件
const DefaultComponent = () => <div>Default Feature</div>;

// 新功能组件
const NewFeature = () => <div>New Feature</div>;

// 旧功能组件
const OldFeature = () => <div>Old Feature</div>;

// 实验管理组件
const ExperimentManager = () => {
  const abTestManager = useABTest();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const allocateExperiments = async () => {
      try {
        const experiments = [
          {
            id: 'feature-x',
            name: 'Feature X Test',
            variants: ['new', 'old']
          }
        ];

        const allocations = await mockAllocateExperiments(experiments);
        allocations.forEach(allocation => {
          abTestManager.addAllocation(allocation.experimentId, allocation);
        });
      } finally {
        setLoading(false);
      }
    };

    allocateExperiments();
  }, [abTestManager]);

  if (loading) return <div>Loading...</div>;
  return null;
};

// 主应用组件
const App = () => {
  return (
    <ABTestProvider>
      <ExperimentManager />
      <ABTestContainer experimentId="feature-x" fallbackComponent={<DefaultComponent />}>
        <ABTestVariant variantId="new">
          <NewFeature />
        </ABTestVariant>
        <ABTestVariant variantId="old">
          <OldFeature />
        </ABTestVariant>
      </ABTestContainer>
    </ABTestProvider>
  );
};
```

### 多实验场景

```tsx
const App = () => {
  return (
    <ABTestProvider>
      <ExperimentManager />
      
      {/* 二选一实验 */}
      <ABTestContainer experimentId="feature-x" fallbackComponent={<DefaultComponent />}>
        <ABTestVariant variantId="new">
          <NewFeature />
        </ABTestVariant>
        <ABTestVariant variantId="old">
          <OldFeature />
        </ABTestVariant>
      </ABTestContainer>

      {/* 多选实验 */}
      <ABTestContainer experimentId="multi-variant" fallbackComponent={<DefaultComponent />}>
        <ABTestVariant variantId="variant1">
          <Variant1 />
        </ABTestVariant>
        <ABTestVariant variantId="variant2">
          <Variant2 />
        </ABTestVariant>
        <ABTestVariant variantId="variant3">
          <Variant3 />
        </ABTestVariant>
      </ABTestContainer>
    </ABTestProvider>
  );
};
```

## API

### 组件

- `ABTestProvider`: 提供 ABTest 上下文
  - Props:
    - `children`: React 节点
    - `initialAllocations`: 初始实验分配结果

- `ABTestContainer`: 实验容器组件
  - Props:
    - `experimentId`: 实验ID
    - `fallbackComponent`: 默认组件
    - `children`: 实验变体组件

- `ABTestVariant`: 实验变体组件
  - Props:
    - `variantId`: 变体ID
    - `children`: 变体内容

### Hook

- `useABTest`: 获取 ABTest 管理器实例
  ```typescript
  const abTestManager = useABTest();
  ```

## 类型定义

```typescript
interface ABTestProviderProps {
  children: React.ReactNode;
  initialAllocations?: Record<string, Allocation>;
}

interface ABTestContainerProps {
  experimentId: string;
  fallbackComponent?: React.ReactNode;
  children: React.ReactNode;
}

interface ABTestVariantProps {
  variantId: string;
  children?: React.ReactNode;
}
``` 