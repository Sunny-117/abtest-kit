# @abtest/react

React components for A/B testing, built on top of @abtest/core.

## Installation

```bash
npm install @abtest/react
# or
yarn add @abtest/react
# or
pnpm add @abtest/react
```

## Usage

### Basic Usage

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

### Nested Experiments

```tsx
import { ABTestProvider, ABTestContainer, ABTestSwitch } from '@abtest/react';

function App() {
  return (
    <ABTestProvider>
      <ABTestContainer config={{ key: 'parent-feature' }} fallbackComponent={<DefaultComponent />}>
        <ABTestSwitch name="new">
          <ABTestContainer config={{ key: 'nested-feature' }}>
            <ABTestSwitch name="new">
              <NewNestedFeature />
            </ABTestSwitch>
            <ABTestSwitch name="old">
              <OldNestedFeature />
            </ABTestSwitch>
          </ABTestContainer>
        </ABTestSwitch>
        <ABTestSwitch name="old">
          <OldFeature />
        </ABTestSwitch>
      </ABTestContainer>
    </ABTestProvider>
  );
}
```

## API

### ABTestProvider

The provider component that makes the A/B test context available to all child components.

```tsx
<ABTestProvider initialExperiments={initialExperiments}>
  {children}
</ABTestProvider>
```

Props:
- `initialExperiments`: Initial set of experiments (optional)
- `children`: React nodes

### ABTestContainer

Container component that manages a single A/B test.

```tsx
<ABTestContainer config={config} fallbackComponent={fallbackComponent}>
  {children}
</ABTestContainer>
```

Props:
- `config`: ABTestConfig object
- `fallbackComponent`: Component to render when experiment is not found
- `children`: React nodes

### ABTestSwitch

Switch component that renders content based on experiment group.

```tsx
<ABTestSwitch name="group-name">
  {children}
</ABTestSwitch>
```

Props:
- `name`: Name of the experiment group
- `children`: React nodes to render when group matches

### useABTest Hook

Hook to access the A/B test manager directly.

```tsx
const abTestManager = useABTest();
```

Returns the ABTestManager instance from @abtest/core. 