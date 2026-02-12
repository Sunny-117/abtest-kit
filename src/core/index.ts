// 核心模块 - 无 React 依赖
export * from './types';
export * from './constant';
export { logger, LogLevel } from './logger';
export { resolveStrategyGroupId, getRandomGroupId, getCrc32GroupId } from './resolveStrategy';
export { baiduTongjiStrategy } from './builtin';
export { forceHitTestFlag, getExperimentHitStatus } from './forceHitTestFlag';
export {
    initGlobalABTest,
    getGlobalABTestValue,
    getGlobalABTestUserstat,
    clearGlobalABTestCache,
    resetGlobalABTest
} from './globalABTest';
