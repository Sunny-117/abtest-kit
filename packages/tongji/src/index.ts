/**
 * AB测试基础设施
 * 提供统一的AB测试配置、管理和执行能力
 */

/**
 * AB测试实验配置类型
 */
export interface ABTestConfig {
    /** 实验唯一标识 */
    key: string;
    /** 实验ID */
    id: number;
    /** 实验名称 */
    name: string;
    /** 实验变体配置 */
    variants: Record<string, any>;
    /** 实验条件判断函数 */
    condition?: () => boolean;
}

/**
 * AB测试管理器
 */
class ABTestManager {
    private configs: Map<string, ABTestConfig>;
    private values: Map<string, any>;

    constructor() {
        this.configs = new Map();
        this.values = new Map();
    }

    /**
     * 注册AB测试实验
     * @param config - 实验配置
     */
    register(config: ABTestConfig): void {
        this.configs.set(config.key, config);
    }

    /**
     * 设置实验值
     * @param key - 实验标识
     * @param value - 实验值
     */
    setValue(key: string, value: any): void {
        this.values.set(key, value);
    }

    /**
     * 获取实验值
     * @param key - 实验标识
     * @returns 实验值
     */
    getValue<T = any>(key: string): T | undefined {
        return this.values.get(key);
    }

    /**
     * 判断是否在实验组
     * @param key - 实验标识
     * @param variant - 变体名称
     * @returns 是否在指定变体
     */
    isInVariant(key: string, variant: string): boolean {
        const config = this.configs.get(key);
        if (!config) {
            return false;
        }

        const value = this.getValue(key);
        return config.variants[variant] === value;
    }

    /**
     * 获取所有实验状态
     * @returns 实验状态字符串
     */
    getExperimentStatus(): string {
        return Array.from(this.configs.values())
            .map(config => `${config.id}-${Number(this.getValue(config.key))}`)
            .join(';');
    }

    /**
     * 执行实验条件判断
     * @param key - 实验标识
     * @returns 是否满足实验条件
     */
    checkCondition(key: string): boolean {
        const config = this.configs.get(key);
        if (!config || !config.condition) {
            return true;
        }
        return config.condition();
    }
}

// 创建全局单例
const abTestManager = new ABTestManager();

// 导出工具函数
export const registerABTest = (config: ABTestConfig): void => abTestManager.register(config);
export const setABTestValue = (key: string, value: any): void => abTestManager.setValue(key, value);
export const getABTestValue = <T = any>(key: string): T | undefined => abTestManager.getValue<T>(key);
export const isInVariant = (key: string, variant: string): boolean => abTestManager.isInVariant(key, variant);
export const getExperimentStatus = (): string => abTestManager.getExperimentStatus();
export const checkExperimentCondition = (key: string): boolean => abTestManager.checkCondition(key);

// 导出管理器实例
export default abTestManager;
