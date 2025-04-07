# @abtest/core

Core A/B testing infrastructure that is framework-agnostic.

## Installation

```bash
npm install @abtest/core
# or
yarn add @abtest/core
# or
pnpm add @abtest/core
```

## Usage

```typescript
import { ABTestManager } from '@abtest/core';

// Create an instance
const abTestManager = new ABTestManager();

// Add an experiment
abTestManager.addExperiment('feature-x', {
  group: 'new',
  config: {
    key: 'feature-x',
    version: '1.0.0',
    metadata: {
      description: 'New feature experiment'
    }
  }
});

// Get experiment status
const experiment = abTestManager.getExperiment('feature-x');

// Use experiment status
if (experiment?.group === 'new') {
  // Use new feature
} else {
  // Use old feature
}

// Get all experiments
const allExperiments = abTestManager.getExperiments();
```

## API

### ABTestManager

The core class for managing A/B tests.

#### Constructor

```typescript
new ABTestManager(options?: ABTestManagerOptions)
```

Options:
- `initialExperiments`: Initial set of experiments (optional)

#### Methods

- `addExperiment(key: string, result: ABTestResult): void`
  - Add or update an experiment
- `getExperiment(key: string): ABTestResult | undefined`
  - Get experiment by key
- `getExperiments(): Record<string, ABTestResult>`
  - Get all experiments

### Types

#### ABTestConfig

```typescript
interface ABTestConfig {
  key: string;
  version?: string;
  metadata?: Record<string, any>;
}
```

#### ABTestResult

```typescript
interface ABTestResult {
  group: string;
  config: ABTestConfig;
  metadata?: Record<string, any>;
}
```

#### ABTestManagerOptions

```typescript
interface ABTestManagerOptions {
  initialExperiments?: Record<string, ABTestResult>;
}
``` 