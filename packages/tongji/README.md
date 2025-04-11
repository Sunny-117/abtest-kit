# AB Testing Library

A lightweight and flexible AB testing infrastructure that provides unified configuration, management, and execution capabilities.

## Installation

```bash
npm install @abtest/tongji
```

## Usage

### Basic Configuration

First, define your AB test configuration:

```typescript
import { ABTestConfig } from '@abtest/tongji';

const myExperiment: ABTestConfig = {
    key: 'button_color',  // Unique identifier for the experiment
    id: 1,               // Experiment ID
    name: 'Button Color Test',  // Human-readable name
    variants: {
        control: 'blue',  // Control group variant
        variant: 'red'    // Test group variant
    }
};
```

### Registering Experiments

Register your experiment configuration:

```typescript
import { registerABTest } from '@abtest/tongji';

registerABTest(myExperiment);
```

### Setting and Getting Values

Set and retrieve experiment values:

```typescript
import { setABTestValue, getABTestValue } from '@abtest/tongji';

// Set the value for a user/group
setABTestValue('button_color', 'red');

// Get the value
const buttonColor = getABTestValue('button_color'); // Returns 'red'
```

### Checking Variants

Check if a user is in a specific variant:

```typescript
import { isInVariant } from '@abtest/tongji';

if (isInVariant('button_color', 'red')) {
    // User is in the red button variant
    renderRedButton();
} else {
    // User is in the control group
    renderBlueButton();
}
```

### Conditional Experiments

You can add conditions to your experiments:

```typescript
const conditionalExperiment: ABTestConfig = {
    key: 'new_feature',
    id: 2,
    name: 'New Feature Test',
    variants: {
        control: false,
        variant: true
    },
    condition: () => {
        // Only run this experiment for premium users
        return isPremiumUser();
    }
};
```

### Getting Experiment Status

Get the current status of all experiments:

```typescript
import { getExperimentStatus } from '@abtest/tongji';

const status = getExperimentStatus(); // Returns string like "1-red;2-true"
```

### Checking Experiment Conditions

Check if an experiment's conditions are met:

```typescript
import { checkExperimentCondition } from '@abtest/tongji';

if (checkExperimentCondition('new_feature')) {
    // Experiment conditions are met
    runExperiment();
}
```

## API Reference

### ABTestConfig

```typescript
interface ABTestConfig {
    key: string;        // Unique identifier for the experiment
    id: number;         // Experiment ID
    name: string;       // Human-readable name
    variants: Record<string, any>;  // Experiment variants
    condition?: () => boolean;  // Optional condition function
}
```

### Functions

- `registerABTest(config: ABTestConfig): void` - Register a new AB test configuration
- `setABTestValue(key: string, value: any): void` - Set the value for an experiment
- `getABTestValue<T = any>(key: string): T | undefined` - Get the value for an experiment
- `isInVariant(key: string, variant: string): boolean` - Check if current value matches a variant
- `getExperimentStatus(): string` - Get status of all experiments
- `checkExperimentCondition(key: string): boolean` - Check if experiment conditions are met

## Best Practices

1. **Unique Keys**: Always use unique keys for your experiments to avoid conflicts
2. **Clear Variants**: Define clear and meaningful variant names
3. **Conditional Logic**: Use conditions to target specific user segments
4. **Type Safety**: Use TypeScript generics with `getABTestValue` for type safety
5. **Testing**: Always test your experiments in a controlled environment before deployment

## Example

```typescript
// Define experiment
const buttonExperiment: ABTestConfig = {
    key: 'button_style',
    id: 1,
    name: 'Button Style Test',
    variants: {
        control: 'rounded',
        variant: 'square'
    },
    condition: () => isDesktopUser()
};

// Register experiment
registerABTest(buttonExperiment);

// Set value for current user
setABTestValue('button_style', 'square');

// Use in UI
const buttonStyle = getABTestValue('button_style');
renderButton(buttonStyle);

// Check variant
if (isInVariant('button_style', 'square')) {
    applySquareStyle();
}
```