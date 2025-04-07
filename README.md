# ABTest

A framework-agnostic A/B testing infrastructure with React implementation.

## Packages

- `@abtest/core`: Core A/B testing infrastructure
- `@abtest/react`: React components for A/B testing

## Installation

```bash
# Install core package
npm install @abtest/core
# or
yarn add @abtest/core
# or
pnpm add @abtest/core

# Install React package
npm install @abtest/react
# or
yarn add @abtest/react
# or
pnpm add @abtest/react
```

## Examples

### Using Core Package

```typescript
import { ABTestManager } from '@abtest/core';

const abTestManager = new ABTestManager();

// Add experiment
abTestManager.addExperiment('feature-x', {
  group: 'new',
  config: {
    key: 'feature-x',
    version: '1.0.0'
  }
});

// Use experiment
const experiment = abTestManager.getExperiment('feature-x');
if (experiment?.group === 'new') {
  // Use new feature
} else {
  // Use old feature
}
```

### Using React Package

```tsx
import { ABTestProvider, ABTestContainer, ABTestSwitch } from '@abtest/react';

function App() {
  return (
    <ABTestProvider>
      <ABTestContainer config={{ key: 'feature-x' }} fallbackComponent={<DefaultComponent />}>
        <ABTestSwitch name="new">
          <NewFeature />
        </ABTestSwitch>
        <ABTestSwitch name="old">
          <OldFeature />
        </ABTestSwitch>
      </ABTestContainer>
    </ABTestProvider>
  );
}
```

## Development

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run in development mode
pnpm dev
```

## License

MIT