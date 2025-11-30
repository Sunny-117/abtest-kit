import { ABTestConfigMap } from './types';

export const forceHitTestFlag = 'forceHitTestFlag';

interface UrlParams {
    [key: string]: string;
}

const getUrlAllParam = (url: string): UrlParams => {
    const params: UrlParams = {};
    const searchParams = new URLSearchParams(url.split('?')[1]);
    searchParams.forEach((value, key) => {
        params[key] = value;
    });
    return params;
};

export const getExperimentHitStatus = (abTestConfig: ABTestConfigMap): { [key: string]: number } => {
    const { forceHitTestFlag: flagValue } = getUrlAllParam(location.href);
    if (!flagValue) {
        return {};
    }

    // 解析 URL 中的实验配置
    const experimentMap: { [key: string]: number } = {};
    flagValue.split(';').forEach(item => {
        const [key, value] = item.split('-');
        experimentMap[key] = +value;
    });

    // 将 URL 中的实验值映射到 abTestConfig 的 key
    return Object.entries(abTestConfig).reduce((acc, [key, config]) => {
        // 如果 URL 中有对应的实验配置，使用 URL 中的值
        if (experimentMap[config.key] !== undefined) {
            acc[key] = experimentMap[config.key];
        }
        return acc;
    }, {} as { [key: string]: number });
};
