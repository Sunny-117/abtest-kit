/**
 * 实验配置
 * 定义实验的基本信息和变体
 */
export interface Experiment {
  // 实验ID，唯一标识一个实验
  id: string;
  // 实验名称
  name: string;
  // 实验变体列表
  variants: string[];
}

/**
 * 实验分配结果
 * 表示用户被分配到哪个实验的哪个变体
 */
export interface Allocation {
  // 实验ID
  experimentId: string;
  // 变体ID
  variantId: string;
}

/**
 * AB测试管理器配置
 */
export interface ABTestOptions {
  // 初始实验分配结果
  initialAllocations?: Record<string, Allocation>;
}
