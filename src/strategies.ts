import { ABTestConfig, ABTestStrategy } from './types';
import { logger } from './logger';

declare global {
    interface Window {
        _hmt: any[];
        $abtestUserstat: string;
    }
}
// 百度统计分流策略
export const baiduTongjiStrategy: ABTestStrategy = {
    name: 'baiduTongji',
    getValue: async (config: ABTestConfig): Promise<number> => {
        return new Promise(resolve => {
            window._hmt.push(['_fetchABTest', {
                paramName: config.key,
                defaultValue: -1,
                callback: function (value: number) {
                    resolve(value);
                }
            }]);
        });
    }
};

// 随机分流策略
export const randomStrategy: ABTestStrategy = {
    name: 'random',
    getValue: async (): Promise<number> => {
        // TODO: 分流只能是0/1，后续支持多种结果（follow globalABTest config）
        return Math.random() < 0.5 ? 0 : 1;
    }
};

// CRC32分流策略
export const crc32Strategy: ABTestStrategy = {
    name: 'crc32',
    getValue: async (_config: ABTestConfig, userId?: string): Promise<number> => {
        if (!userId) {
            logger.warn('CRC32 strategy requires userId');
            return -1;
        }
        const crc32 = await import('crc-32');
        const hash = crc32.str(userId);
        const unsigned = hash >>> 0;
        // TODO: 分流只能是0/1，后续支持多种结果（follow globalABTest config）
        return unsigned % 2; // 返回0或1
    }
};

// 策略工厂
export const getStrategy = (strategyName: string): ABTestStrategy => {
    switch (strategyName) {
        case 'baiduTongji':
            return baiduTongjiStrategy;
        case 'random':
            return randomStrategy;
        case 'crc32':
            return crc32Strategy;
        default:
            logger.warn(`Unknown strategy: ${strategyName}, falling back to baiduTongji`);
            return randomStrategy;
    }
};
