import React, { useEffect, useState } from 'react';
import { ABTestProvider, ABTestContainer, ABTestSwitch, useABTest } from '@abtest/react';
import { mockAllocateExperiments } from '@abtest/core';

// 默认组件
const DefaultComponent = () => <div>Default Feature</div>;

// 新功能组件
const NewFeature = () => <div>New Feature</div>;

// 旧功能组件
const OldFeature = () => <div>Old Feature</div>;

// 实验组1组件
const Variant1 = () => <div>Variant 1</div>;

// 实验组2组件
const Variant2 = () => <div>Variant 2</div>;

// 实验组3组件
const Variant3 = () => <div>Variant 3</div>;

/**
 * 实验管理组件
 */
const ExperimentManager = () => {
  const abTestManager = useABTest();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const allocateExperiments = async () => {
      try {
        // 定义多个实验配置
        const experiments = [
          {
            id: '1001',
            name: '1001 Test',
            variants: ['new', 'old']
          },
          {
            id: '1002',
            name: '1002 Test',
            variants: ['new', 'old']
          },
          {
            id: 'multi-variant',
            name: 'Multi Variant Test',
            variants: ['variant1', 'variant2', 'variant3']
          }
        ];

        const allocations = await mockAllocateExperiments(experiments);
        allocations.forEach(allocation => {
          abTestManager.addAllocation(allocation.experimentId, allocation);
        });
      } catch (error) {
        console.error('Failed to allocate experiments:', error);
      } finally {
        setLoading(false);
      }
    };

    allocateExperiments();
  }, [abTestManager]);

  if (loading) {
    return <div>Loading experiments...</div>;
  }

  return (
    <div>
      <h2>Experiment Status</h2>
      <div>
        1001: {abTestManager.getAllocation('1001')?.variantId || 'not allocated'}
      </div>
      <div>
        1002: {abTestManager.getAllocation('1002')?.variantId || 'not allocated'}
      </div>
      <div>
        Multi Variant: {abTestManager.getAllocation('multi-variant')?.variantId || 'not allocated'}
      </div>
    </div>
  );
};

/**
 * 复杂实验示例
 */
const ComplexExample = () => {
  return (
    <ABTestProvider>
      <div>
        <h1>Complex A/B Testing Example</h1>
        
        {/* 实验管理 */}
        <ExperimentManager />

        {/* 二选一实验 */}
        <div>
          <h3>Binary Choice Experiment</h3>
          <ABTestContainer experimentId="1001" fallbackComponent={<DefaultComponent />}>
            <ABTestSwitch variantId="new">
              <NewFeature />
            </ABTestSwitch>
            <ABTestSwitch variantId="old">
              <OldFeature />
            </ABTestSwitch>
          </ABTestContainer>
        </div>

        {/* 多选实验 */}
        <div>
          <h3>Multi Variant Experiment</h3>
          <ABTestContainer experimentId="multi-variant" fallbackComponent={<DefaultComponent />}>
            <ABTestSwitch variantId="variant1">
              <Variant1 />
            </ABTestSwitch>
            <ABTestSwitch variantId="variant2">
              <Variant2 />
            </ABTestSwitch>
            <ABTestSwitch variantId="variant3">
              <Variant3 />
            </ABTestSwitch>
          </ABTestContainer>
        </div>
      </div>
    </ABTestProvider>
  );
};

export default ComplexExample; 