// 核心入口 - 无 React 依赖
// 适用于独立使用（无需 React）的场景

// 导出核心类型
export type {
    CustomStrategyFunction,
    StrategyType,
    OmitStrategyType,
    ABTestConfig,
    ABTestConfigMap,
    ABTestContextType,
    ABTestOptions,
    ABTestStrategy,
    ResolvedABTestConfig,
    GlobalABTestOptions,
    GlobalABTestResult,
    GlobalABTestConfig,
    StoredData
} from './core/types';

// 导出常量
export { DEFAULT_STORAGE_KEY, CONFIG_SUFFIX } from './core/constant';

// 导出日志工具
export { logger, LogLevel } from './core/logger';

// 导出全局分流 API
export {
    initGlobalABTest,
    getGlobalABTestValue,
    getGlobalABTestUserstat,
    clearGlobalABTestCache,
    resetGlobalABTest
} from './core/globalABTest';

// 导出策略相关
export { resolveStrategyGroupId, getRandomGroupId, getCrc32GroupId } from './core/resolveStrategy';
export { baiduTongjiStrategy } from './core/builtin';
export { forceHitTestFlag, getExperimentHitStatus } from './core/forceHitTestFlag';
