import { ABTestOptions, Allocation, Experiment } from './types';

export { Experiment, Allocation } from './types';
export { mockAllocateExperiments } from './mock';

export class ABTestManager {
  private allocations: Record<string, Allocation>;

  constructor(options?: ABTestOptions) {
    this.allocations = options?.initialAllocations || {};
  }

  /**
   * 添加实验分配结果
   * @param experimentId 实验ID
   * @param allocation 分配结果
   */
  addAllocation(experimentId: string, allocation: Allocation): void {
    this.allocations = {
      ...this.allocations,
      [experimentId]: allocation,
    };
  }

  /**
   * 获取实验分配结果
   * @param experimentId 实验ID
   * @returns 分配结果
   */
  getAllocation(experimentId: string): Allocation | undefined {
    return this.allocations[experimentId];
  }

  /**
   * 获取所有实验分配结果
   * @returns 所有分配结果
   */
  getAllAllocations(): Record<string, Allocation> {
    return this.allocations;
  }
}
