import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { forceHitTestFlag, getExperimentHitStatus } from './forceHitTestFlag';
import { getStrategy } from './strategies';
import {
    ABTestConfigMap,
    ABTestContextType,
    ABTestOptions,
    ABTestProviderProps
} from './types';

// 获取所有AB测试的状态字符串
export const getUserstat = (c: ABTestConfigMap): string => {
    return Object.entries(c)
        .map(([_, config]) => `${config.key}-${Number(config.value)}`)
        .join(';');
};

// 创建AB测试上下文
const ABTestContext = createContext<ABTestContextType>({
    abTestConfig: {},
    pending: false,
    userstat: ''
});

/**
 * 初始化AB测试并返回Promise
 * @param abTestConfig - AB测试配置
 * @param injectScript - 可选的脚本注入函数
 * @param options - 配置选项
 * @returns AB测试初始化Promise
 */
export const initABTestsConfig = (
    abTestConfig: ABTestConfigMap,
    injectScript?: () => void,
    options: ABTestOptions = {}
): Promise<ABTestConfigMap> => {
    const { strategy = 'baiduTongji', userId } = options;
    const selectedStrategy = getStrategy(strategy);

    try {
        injectScript?.();
    } catch (error) {
        console.log(error);
    }

    // 确保_hmt已初始化（仅在使用百度统计策略时需要）
    if (strategy === 'baiduTongji') {
        window._hmt = window._hmt || [];
    }

    return new Promise(resolve => {
        const abTestPromises = Object.values(abTestConfig).map(config => {
            return new Promise<void>(promiseResolve => {
                // 检查是否使用强制测试模式
                if (location.href.includes(forceHitTestFlag)) {
                    const forceValue = getExperimentHitStatus(abTestConfig)[config.paramName];
                    if (forceValue !== undefined) {
                        abTestConfig[config.paramName].value = forceValue;
                    }
                    promiseResolve();
                    return;
                }

                // 使用选定的策略获取测试值
                selectedStrategy.getValue(config, userId).then(value => {
                    if (value !== undefined) {
                        abTestConfig[config.paramName].value = value;
                    }
                    promiseResolve();
                });
            });
        });

        // 所有AB测试完成后解析Promise
        Promise.all(abTestPromises).then(() => {
            resolve(abTestConfig);
        });
    });
};

/**
 * AB测试上下文提供者
 */
export const ABTestProvider = ({
    children,
    abTestConfig,
    injectScript,
    options = {}
}: ABTestProviderProps) => {
    const [state, setState] = useState<ABTestContextType>({
        abTestConfig: {},
        pending: true,
        userstat: ''
    });
    const initialized = useRef(false);

    useEffect(() => {
        if (initialized.current) {
            return;
        }

        initialized.current = true;

        initABTestsConfig(abTestConfig, injectScript, options).then(finalConfig => {
            const userstat = getUserstat(finalConfig);
            setState({
                abTestConfig: finalConfig,
                pending: false,
                userstat
            });
            window.$abtestUserstat = userstat;
        }).catch(error => {
            console.error('AB测试初始化失败:', error);
        });
    }, []);

    return (
        <ABTestContext.Provider value={state}>
            {children}
        </ABTestContext.Provider>
    );
};

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

// 导出全局分流相关的API和类型
export {
    initGlobalABTest,
    getGlobalABTestValue,
    getGlobalABTestUserstat,
    clearGlobalABTestCache,
    resetGlobalABTest,
    type GlobalABTestConfig,
    type GlobalABTestOptions,
    type GlobalABTestResult
} from './globalABTest';
