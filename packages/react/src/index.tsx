import React, { createContext, useContext, useState } from 'react';
import { ABTestManager, ABTestConfig, ABTestResult } from '@abtest/core';

const ABTestContext = createContext<ABTestManager | null>(null);

export const useABTest = () => {
  const context = useContext(ABTestContext);
  if (!context) {
    throw new Error('useABTest must be used within an ABTestProvider');
  }
  return context;
};

interface ABTestProviderProps {
  children: React.ReactNode;
  initialExperiments?: Record<string, ABTestResult>;
}

export const ABTestProvider: React.FC<ABTestProviderProps> = ({
  children,
  initialExperiments,
}) => {
  const [manager] = useState(() => new ABTestManager({ initialExperiments }));

  return (
    <ABTestContext.Provider value={manager}>
      {children}
    </ABTestContext.Provider>
  );
};

interface ABTestContainerProps {
  config: ABTestConfig;
  fallbackComponent?: React.ReactNode;
  children: React.ReactNode;
}

interface ABTestSwitchProps {
  name: string;
  children?: React.ReactNode;
}

export const ABTestContainer: React.FC<ABTestContainerProps> = ({
  config,
  fallbackComponent,
  children,
}) => {
  const manager = useABTest();
  const experiment = manager.getExperiment(config.key);

  if (!experiment) {
    return <>{fallbackComponent}</>;
  }

  return <>{children}</>;
};

export const ABTestSwitch: React.FC<ABTestSwitchProps> = ({ name, children }) => {
  const manager = useABTest();
  const experiment = manager.getExperiment(name);

  if (!experiment || experiment.group !== name) {
    return null;
  }

  return <>{children}</>;
}; 