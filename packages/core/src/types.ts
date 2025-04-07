export interface ABTestConfig {
  key: string;
  version?: string;
  metadata?: Record<string, any>;
}

export interface ABTestResult {
  group: string;
  config: ABTestConfig;
  metadata?: Record<string, any>;
}

export interface ABTestManagerOptions {
  initialExperiments?: Record<string, ABTestResult>;
} 