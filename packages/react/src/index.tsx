import React, { createContext, useContext, useState } from 'react';
import { ABTestManager, Allocation } from '@abtest/core';

// 创建 ABTest 上下文
const ABTestContext = createContext<ABTestManager | null>(null);

/**
 * ABTest Hook
 * 用于在组件中访问 ABTest 管理器
 */
export const useABTest = () => {
  const context = useContext(ABTestContext);
  if (!context) {
    throw new Error('useABTest must be used within an ABTestProvider');
  }
  return context;
};

/**
 * ABTest Provider Props
 */
interface ABTestProviderProps {
  children: React.ReactNode;
  initialAllocations?: Record<string, Allocation>;
}

/**
 * ABTest Provider
 * 提供 ABTest 上下文给子组件
 */
export const ABTestProvider: React.FC<ABTestProviderProps> = ({
  children,
  initialAllocations,
}) => {
  const [manager] = useState(() => new ABTestManager({ initialAllocations }));

  return (
    <ABTestContext.Provider value={manager}>
      {children}
    </ABTestContext.Provider>
  );
};

/**
 * ABTest Container Props
 */
interface ABTestContainerProps {
  // 实验ID
  experimentId: string;
  // 默认组件，当实验未分配时显示
  fallbackComponent?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * ABTest Container
 * 根据实验分配结果显示不同的内容
 */
export const ABTestContainer: React.FC<ABTestContainerProps> = ({
  experimentId,
  fallbackComponent,
  children,
}) => {
  const manager = useABTest();
  console.log('运行get')
  const allocation = manager.getAllocation(experimentId);

  if (!allocation) {
    return <>{fallbackComponent}</>;
  }

  return <>{children}</>;
};

/**
 * ABTest Variant Props
 */
interface ABTestVariantProps {
  // 变体ID
  variantId: string;
  children?: React.ReactNode;
}

/**
 * ABTest Variant
 * 根据变体ID显示对应的内容
 */
export const ABTestSwitch: React.FC<ABTestVariantProps> = ({ variantId, children }) => {
  const manager = useABTest();
  const allocation = manager.getAllocation(variantId);

  if (!allocation || allocation.variantId !== variantId) {
    return null;
  }

  return <>{children}</>;
}; 