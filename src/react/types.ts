import { ReactNode } from 'react';
import { ABTestConfigMap, ABTestOptions } from '../core/types';

export interface ABTestProviderProps {
    children: ReactNode;
    abTestConfig: ABTestConfigMap;
    injectScript?: () => void;
    options?: ABTestOptions;
}
