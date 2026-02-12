import { OmitStrategyType, StrategyType } from './types';
import { logger } from './logger';

/**
 * 生成随机分流值
 * @param groups 分流配置，key为组ID，value为分流比例(0-100)
 * @returns 分流的组ID
 */
export const getRandomGroupId = (groups: { [groupId: number]: number }): number => {
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
export const getCrc32GroupId = (userId: string, groups: { [groupId: number]: number }): number => {
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
 * 解析策略并返回分组ID
 * @param strategy 策略类型或自定义函数
 * @param groups 分组配置
 * @param userId 用户ID（crc32策略需要）
 * @param testName 测试名称（用于日志）
 * @returns 分组ID
 */
export const resolveStrategyGroupId = (
  strategy: StrategyType | OmitStrategyType,
  groups: { [groupId: number]: number },
  userId?: string,
  testName?: string
): number => {
  const currentStrategy = strategy !== undefined ? strategy : 'random';

  if (currentStrategy === 'crc32') {
    if (!userId) {
      logger.warn(`CRC32 strategy requires userId for test ${testName || 'unknown'}`);
      return -1;
    }
    return getCrc32GroupId(userId, groups);
  } else if (typeof currentStrategy === 'function') {
    // 使用自定义分流策略函数
    try {
      const groupId = currentStrategy(groups);
      // 验证返回值是否为有效的groupId
      if (!(groupId in groups)) {
        logger.warn(`Custom strategy returned invalid groupId ${groupId} for test ${testName || 'unknown'}`);
        // 回退到随机策略
        return getRandomGroupId(groups);
      }
      return groupId;
    } catch (error) {
      logger.warn(`Error executing custom strategy for test ${testName || 'unknown'}`, error);
      // 出错时回退到随机策略
      return getRandomGroupId(groups);
    }
  } else {
    // 默认使用random策略（随机分流）
    return getRandomGroupId(groups);
  }
};
