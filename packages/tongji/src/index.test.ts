import { describe, it, expect, beforeEach, vi } from 'vitest';
import abTestManager, { ABTestConfig, registerABTest, setABTestValue, getABTestValue, isInVariant, getExperimentStatus, checkExperimentCondition } from './index';

describe('ABTestManager', () => {
    const mockConfig: ABTestConfig = {
        key: 'test_experiment',
        id: 1,
        name: 'Test Experiment',
        variants: {
            control: 0,
            variant: 1
        }
    };

    beforeEach(() => {
        // Clear all registered tests
        abTestManager['configs'].clear();
        abTestManager['values'].clear();
    });

    describe('registerABTest', () => {
        it('should register a new experiment config', () => {
            registerABTest(mockConfig);
            expect(abTestManager['configs'].get(mockConfig.key)).toEqual(mockConfig);
        });
    });

    describe('setABTestValue and getABTestValue', () => {
        it('should set and get experiment value correctly', () => {
            setABTestValue(mockConfig.key, 1);
            expect(getABTestValue(mockConfig.key)).toBe(1);
        });

        it('should return undefined for non-existent key', () => {
            expect(getABTestValue('non_existent')).toBeUndefined();
        });
    });

    describe('isInVariant', () => {
        beforeEach(() => {
            registerABTest(mockConfig);
        });

        it('should return true when value matches variant', () => {
            setABTestValue(mockConfig.key, 1);
            expect(isInVariant(mockConfig.key, 'variant')).toBe(true);
        });

        it('should return false when value does not match variant', () => {
            setABTestValue(mockConfig.key, 0);
            expect(isInVariant(mockConfig.key, 'variant')).toBe(false);
        });

        it('should return false for non-existent experiment', () => {
            expect(isInVariant('non_existent', 'variant')).toBe(false);
        });
    });

    describe('getExperimentStatus', () => {
        it('should return empty string when no experiments are registered', () => {
            expect(getExperimentStatus()).toBe('');
        });

        it('should return correct status string for registered experiments', () => {
            registerABTest(mockConfig);
            setABTestValue(mockConfig.key, 1);
            expect(getExperimentStatus()).toBe('1-1');
        });
    });

    describe('checkExperimentCondition', () => {
        it('should return true when no condition is specified', () => {
            registerABTest(mockConfig);
            expect(checkExperimentCondition(mockConfig.key)).toBe(true);
        });

        it('should return condition result when condition is specified', () => {
            const configWithCondition: ABTestConfig = {
                ...mockConfig,
                condition: () => false
            };
            registerABTest(configWithCondition);
            expect(checkExperimentCondition(mockConfig.key)).toBe(false);
        });

        it('should return true for non-existent experiment', () => {
            expect(checkExperimentCondition('non_existent')).toBe(true);
        });
    });
}); 