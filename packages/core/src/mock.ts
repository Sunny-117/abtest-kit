import { Experiment, Allocation } from './types';

/**
 * 模拟实验分配
 * @param experiments 实验列表
 * @returns 分配结果
 */
export const mockAllocateExperiments = async (experiments: Experiment[]): Promise<Allocation[]> => {
  return new Promise<Allocation[]>((resolve) => {
    setTimeout(() => {
      // 模拟分配：每个实验随机分配一个变体
      const allocations: Allocation[] = experiments.map(experiment => ({
        experimentId: experiment.id,
        variantId: experiment.variants[Math.floor(Math.random() * experiment.variants.length)]
      }));
      resolve(allocations);
    }, 100);
  });
}; 