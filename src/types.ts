import { ReactNode } from 'react';

export type StrategyType = 'baiduTongji' | 'random' | 'crc32' | CustomStrategyFunction;
export type OmitStrategyType = Omit<StrategyType, 'baiduTongji'>
export interface ABTestConfig {
    key: string;
    paramName: string;
    value: number;
    groups?: {
        [groupId: number]: number; // groupId -> 分流比例 (0-100)
    };
    strategy?: StrategyType;
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

export interface ResolvedABTestConfig {
    strategy: Omit<StrategyType, 'baiduTongji'>;
    userId?: string;
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
    strategy?: Omit<StrategyType, 'baiduTongji'>; // 单个实验的自定义分流策略（可选）
}

/**
 * 自定义分流策略函数类型
 */
export type CustomStrategyFunction = (
  groups: { [groupId: number]: number }
) => number;


/**
 * 全局分流选项
 */
export interface GlobalABTestOptions {
    strategy?: Omit<StrategyType, 'baiduTongji'>; // 分流策略：random(默认) 或 crc32
    userId?: string; // 用户ID，crc32策略必需
    storageKey?: string; // localStorage存储键，默认'__global_abtest__'
}

/**
 * 全局分流结果
 */
export interface GlobalABTestResult {
    [testName: string]: number;
}


export type GlobalConfig = { [testName: string]: GlobalABTestConfig }


/**
 * 获取存储的分流结果和元数据
 */
export interface StoredData {
  result: GlobalABTestResult;
  configHashes?: { [testName: string]: string }; // 存储每个测试的配置哈希
}