// React 入口 - 包含 React 相关组件和 Hooks
// 适用于 React 集成的场景

// 重新导出核心模块的所有内容
export * from './core';

// 导出 React 相关组件和 Hooks
export {
    ABTestProvider,
    ABTestContext,
    initABTestsConfig,
    getUserstat
} from './react/ABTestProvider';

export { useABTest, useABTestValue } from './react/hooks';

// 导出 React 相关类型
export type { ABTestProviderProps } from './react/types';
