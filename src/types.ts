import { ReactNode } from 'react';

export interface ABTestConfig {
    key: string;
    paramName: string;
    value: number;
}

export interface ABTestConfigMap {
    [key: string]: ABTestConfig;
}

export interface ABTestContextType {
    abTestConfig: ABTestConfigMap;
    pending: boolean;
    userstat: string;
}

export interface ABTestOptions {
    strategy?: 'baiduTongji' | 'random' | 'crc32';
    userId?: string;
}

export interface ABTestStrategy {
    name: string;
    getValue: (config: ABTestConfig, userId?: string) => Promise<number>;
}

export interface ABTestProviderProps {
    children: ReactNode;
    abTestConfig: ABTestConfigMap;
    injectScript?: () => void;
    options?: ABTestOptions;
}

/**
 * 全局分流配置
 */
export interface GlobalABTestConfig {
    key: string;
    paramName: string;
    groups: {
        [groupId: number]: number; // groupId -> 分流比例 (0-100)
    };
}

/**
 * 全局分流选项
 */
export interface GlobalABTestOptions {
    strategy?: 'random' | 'crc32'; // 分流策略：random(默认) 或 crc32
    userId?: string; // 用户ID，crc32策略必需
    storageKey?: string; // localStorage存储键，默认'__global_abtest__'
}

/**
 * 全局分流结果
 */
export interface GlobalABTestResult {
    [testName: string]: number;
}
