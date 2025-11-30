/**
 * 全局分流配置
 */
export interface GlobalABTestConfig {
  key: string;
  paramName: string;
  groups: {
    [groupId: number]: number; // groupId -> 分流比例 (0-100)
  };
  strategy?: 'random' | 'crc32' | CustomStrategyFunction; // 单个实验的自定义分流策略（可选）
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
  strategy?: 'random' | 'crc32' | CustomStrategyFunction; // 分流策略：random(默认)、crc32或自定义函数
  userId?: string; // 用户ID，crc32策略必需
  storageKey?: string; // localStorage存储键，默认'__global_abtest__'
}

/**
 * 全局分流结果
 */
export interface GlobalABTestResult {
  [testName: string]: number;
}

type GlobalConfig = { [testName: string]: GlobalABTestConfig }
/**
 * 全局存储当前的分流配置，用于getGlobalABTestUserstat获取
 */
let globalConfigMap: GlobalConfig = {};

/**
 * 生成随机分流值
 * @param groups 分流配置，key为组ID，value为分流比例(0-100)
 * @returns 分流的组ID
 */
const getRandomGroupId = (groups: { [groupId: number]: number }): number => {
  const rand = Math.random() * 100;
  let accumulated = 0;

  for (const [groupId, ratio] of Object.entries(groups)) {
    accumulated += ratio;
    if (rand < accumulated) {
      return Number(groupId);
    }
  }

  // 如果没有匹配到（比例总和不足100），返回最后一个组
  const lastGroupId = Math.max(...Object.keys(groups).map(Number));
  return lastGroupId;
};

/**
 * 计算CRC32哈希值
 */
const crc32Hash = (str: string): number => {
  let crc = 0 ^ -1;
  for (let i = 0; i < str.length; i++) {
    crc = (crc >>> 8) ^ ((crc ^ str.charCodeAt(i)) & 0xff);
  }
  return (crc ^ -1) >>> 0;
};

/**
 * 基于CRC32的确定性分流
 * @param userId 用户ID
 * @param groups 分流配置
 * @returns 分流的组ID
 */
const getCrc32GroupId = (userId: string, groups: { [groupId: number]: number }): number => {
  const hash = crc32Hash(userId);
  const rand = (hash % 100) / 100; // 转换为0-1之间的数
  let accumulated = 0;

  for (const [groupId, ratio] of Object.entries(groups)) {
    accumulated += ratio / 100;
    if (rand < accumulated) {
      return Number(groupId);
    }
  }

  const lastGroupId = Math.max(...Object.keys(groups).map(Number));
  return lastGroupId;
};

/**
 * 计算配置的哈希值，用于检测配置变更
 */
const getConfigHash = (config: { [groupId: number]: number }): string => {
  const sortedKeys = Object.keys(config).sort();
  const hashStr = sortedKeys.map(key => `${key}:${config[key as any]}`).join('|');
  // 注意：配置变化了（包含流量分配）都要重置，即是客户今天看到A，明天看到B，这样才能保证流量的分布准确性
  // 流量服务端存储比较复杂，所以这里牺牲一点
  return hashStr;
};

/**
 * 获取存储的分流结果和元数据
 */
interface StoredData {
  result: GlobalABTestResult;
  configHashes?: { [testName: string]: string }; // 存储每个测试的配置哈希
}

const getStoredData = (storageKey: string): StoredData | null => {
  try {
    const stored = localStorage.getItem(storageKey);
    if (!stored) return null;

    const data = JSON.parse(stored);

    // 兼容旧格式（直接是result对象）
    if (data.result === undefined) {
      return { result: data, configHashes: {} };
    }

    return data || null;
  } catch (error) {
    console.warn(`Failed to get stored AB test result from ${storageKey}:`, error);
    return null;
  }
};

/**
 * 保存分流结果和元数据到localStorage
 */
const saveData = (
  storageKey: string,
  result: GlobalABTestResult,
  configHashes: { [testName: string]: string }
): void => {
  try {
    const data: StoredData = {
      result,
      configHashes
    };
    localStorage.setItem(storageKey, JSON.stringify(data));
  } catch (error) {
    console.warn(`Failed to save AB test result to ${storageKey}:`, error);
  }
};

/**
 * 初始化全局分流
 * 支持完整的增量更新：
 * - 新增的key会进行分流
 * - 已存在的key且配置未变更时保持不变
 * - 配置变更的key会重新分流
 * - 删除的key会从storage中移除
 * @param configMap 分流配置映射
 * @param options 选项
 * @returns 分流结果
 */
export const initGlobalABTest = (
  configMap: { [testName: string]: GlobalABTestConfig },
  options: GlobalABTestOptions = {}
): GlobalABTestResult => {
  const {
    strategy = 'random',
    userId,
    storageKey = '__global_abtest__'
  } = options;

  // 保存配置到全局变量，用于getGlobalABTestUserstat获取
  globalConfigMap = configMap;
  localStorage.setItem(storageKey + '__config__', JSON.stringify(globalConfigMap));

  // 获取存储的数据
  const storedData = getStoredData(storageKey);
  const storedResult = storedData?.result || {};
  const storedConfigHashes = storedData?.configHashes || {};

  // 初始化新结果，只包含当前config中的key
  const result: GlobalABTestResult = {};
  const newConfigHashes: { [testName: string]: string } = {};

  // 执行增量分流
  for (const [testName, config] of Object.entries(configMap)) {
    const currentConfigHash = getConfigHash(config.groups);
    const storedConfigHash = storedConfigHashes[testName];

    // 如果key已存在且配置未变更，保持原有分流结果
    if (testName in storedResult && storedConfigHash === currentConfigHash) {
      result[testName] = storedResult[testName];
      newConfigHashes[testName] = currentConfigHash;
      continue;
    }

    // 新增key或配置变更，需要重新分流
    let groupId: number;
    // 优先使用单个实验的strategy，如果没有则使用全局strategy
    const currentStrategy = config.strategy !== undefined ? config.strategy : strategy;

    if (currentStrategy === 'crc32') {
      if (!userId) {
        console.warn(`CRC32 strategy requires userId for test ${testName}`);
        groupId = -1;
      } else {
        groupId = getCrc32GroupId(userId, config.groups);
      }
    } else if (typeof currentStrategy === 'function') {
          // 使用自定义分流策略函数
          try {
            groupId = currentStrategy(config.groups);
            // 验证返回值是否为有效的groupId
            if (!(groupId in config.groups)) {
              console.warn(`Custom strategy returned invalid groupId ${groupId} for test ${testName}`);
              // 回退到随机策略
              groupId = getRandomGroupId(config.groups);
            }
          } catch (error) {
            console.warn(`Error executing custom strategy for test ${testName}:`, error);
            // 出错时回退到随机策略
            groupId = getRandomGroupId(config.groups);
          }
    } else {
      // 默认使用random策略（随机分流）
      groupId = getRandomGroupId(config.groups);
    }

    result[testName] = groupId;
    newConfigHashes[testName] = currentConfigHash;
  }

  // 保存结果和配置哈希到localStorage
  // 注意：result只包含当前config中的key，已删除的key会被自动移除
  saveData(storageKey, result, newConfigHashes);

  return result;
};

/**
 * 获取全局分流结果
 * @param testName 测试名称
 * @param storageKey 存储键
 * @returns 分流值，如果未初始化则返回-1
 */
export const getGlobalABTestValue = (testName: string, storageKey: string = '__global_abtest__'): number => {
  try {
    const stored = localStorage.getItem(storageKey);
    if (!stored) return -1;

    const data = JSON.parse(stored);
    return data?.result?.[testName] ?? -1;
  } catch (error) {
    console.warn(`Failed to get AB test value for ${testName}:`, error);
    return -1;
  }
};

/**
 * 清除全局分流缓存
 * @param storageKey 存储键
 */
export const clearGlobalABTestCache = (storageKey: string = '__global_abtest__'): void => {
  try {
    localStorage.removeItem(storageKey);
  } catch (error) {
    console.warn(`Failed to clear AB test cache:`, error);
  }
};

/**
 * 重置全局分流（清除缓存并重新分流）
 * @param configMap 分流配置映射
 * @param options 选项
 * @returns 新的分流结果
 */
export const resetGlobalABTest = (
  configMap: { [testName: string]: GlobalABTestConfig },
  options: GlobalABTestOptions = {}
): GlobalABTestResult => {
  const { storageKey = '__global_abtest__' } = options;
  clearGlobalABTestCache(storageKey);
  return initGlobalABTest(configMap, options);
};

/**
 * 获取所有全局分流结果的userstat字符串
 * 返回格式与useABTest的userstat一致：key-value;key-value;...
 * 复用getUserstat的逻辑处理格式
 * @param storageKey 存储键，默认'__global_abtest__'
 * @returns 格式化的分流结果字符串，如果未初始化则返回空字符串
 */
export const getGlobalABTestUserstat = (
  storageKey: string = '__global_abtest__'
): string => {
  try {
    const stored = localStorage.getItem(storageKey);
    if (!stored) return '';

    const data = JSON.parse(stored);
    const result = data?.result || {};
    const globalConfigMapFromStorage = JSON.parse(localStorage.getItem(storageKey + '__config__') || '{}') as GlobalConfig;
    // 复用getUserstat的逻辑：按照configMap的顺序生成userstat字符串
    // 格式：key-value;key-value;...
    return Object.entries(globalConfigMapFromStorage)
      .map(([_, config]) => {
        const value = result[config.paramName] ?? -1;
        return `${config.key}-${Number(value)}`;
      })
      .join(';');
  } catch (error) {
    console.warn(`Failed to get global AB test userstat:`, error);
    return '';
  }
};

