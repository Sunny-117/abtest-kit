import { ABTestOptions, Allocation, Experiment } from './types';

export { Experiment, Allocation } from './types';
export { mockAllocateExperiments } from './mock';

type Listener = () => void;

export class ABTestManager {
  private allocations: Record<string, Allocation>;
  private isInitialized: boolean;
  private listeners: Set<Listener>;

  constructor(options?: ABTestOptions) {
    this.allocations = options?.initialAllocations || {};
    this.isInitialized = Object.keys(this.allocations).length > 0;
    this.listeners = new Set();

    // 创建代理对象
    return new Proxy(this, {
      set: (target, property, value) => {
        // 只监听 allocations 和 isInitialized 的变化
        if (property === 'allocations' || property === 'isInitialized') {
          target[property] = value;
          // 通知所有监听器
          target.listeners.forEach(listener => listener());
          return true;
        }
        return Reflect.set(target, property, value);
      }
    });
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
    this.isInitialized = true;
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

  /**
   * 检查是否已初始化
   */
  isInitializedState(): boolean {
    return this.isInitialized;
  }

  /**
   * 添加状态变化监听器
   * @param listener 监听器函数
   * @returns 移除监听器的函数
   */
  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }
}
