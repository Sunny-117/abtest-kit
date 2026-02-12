import { useContext } from 'react';
import { ABTestContextType } from '../core/types';
import { ABTestContext } from './ABTestProvider';

/**
 * 使用AB测试上下文的Hook
 */
export const useABTest = (): ABTestContextType => {
    return useContext(ABTestContext);
};

/**
 * 获取特定AB测试值的Hook
 */
export const useABTestValue = (testName: string): number => {
    const { abTestConfig, pending } = useABTest();
    return !pending ? abTestConfig[testName]?.value : -1;
};
