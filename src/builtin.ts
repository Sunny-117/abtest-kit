import { ABTestConfig, ABTestStrategy } from './types';
declare global {
    interface Window {
        _hmt: any[];
        $abtestUserstat: string;
    }
}

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