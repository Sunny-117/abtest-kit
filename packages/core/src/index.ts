import { ABTestManagerOptions, ABTestResult } from './types';

export { ABTestConfig, ABTestResult } from './types';

export class ABTestManager {
  private experiments: Record<string, ABTestResult>;

  constructor(options?: ABTestManagerOptions) {
    this.experiments = options?.initialExperiments || {};
  }

  addExperiment(key: string, result: ABTestResult): void {
    this.experiments = {
      ...this.experiments,
      [key]: result,
    };
  }

  getExperiment(key: string): ABTestResult | undefined {
    return this.experiments[key];
  }

  getExperiments(): Record<string, ABTestResult> {
    return this.experiments;
  }
} 