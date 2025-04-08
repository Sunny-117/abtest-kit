import { useLayoutEffect, useState } from 'react';
import { ABTestProvider, ABTestContainer, ABTestSwitch, useABTest } from '@abtest/react';
import { mockAllocateExperiments } from '@abtest/core';

// 默认组件
const DefaultComponent = () => <div>Default Feature</div>;

// 新功能组件
const NewFeature = () => <div>New Feature</div>;

// 旧功能组件
const OldFeature = () => <div>Old Feature</div>;

/**
 * 实验管理组件
 * 负责从服务器获取实验分配结果并更新到AB测试管理器中
 */
const ExperimentManager = () => {
  const abTestManager = useABTest();
  const [loading, setLoading] = useState(true);

  useLayoutEffect(() => {
    const allocateExperiments = async () => {
      try {
        // 定义要分配的实验配置
        const experiments = [
          {
            id: 'feature-x',
            name: 'Feature X Test',
            variants: ['new', 'old']
          },
          {
            id: 'feature-y',
            name: 'Feature Y Test',
            variants: ['new', 'old']
          }
        ];

        // 从服务器获取实验分配结果
        const allocations = await mockAllocateExperiments(experiments);
        
        // 将分配结果添加到AB测试管理器
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
        Feature X: {abTestManager.getAllocation('feature-x')?.variantId || 'not allocated'}
      </div>
      <div>
        Feature Y: {abTestManager.getAllocation('feature-y')?.variantId || 'not allocated'}
      </div>
    </div>
  );
};

/**
 * 主应用组件
 */
const App = () => {
  return (
    <ABTestProvider>
      <div>
        <h1>A/B Testing Example</h1>
        
        <p>实验管理</p>
        <ExperimentManager />

        <p>实验展示</p>
        <ABTestContainer experimentId="feature-x" fallbackComponent={<DefaultComponent />}>
          <ABTestSwitch experimentId="feature-x" variantId="new">
            <NewFeature />
          </ABTestSwitch>
          <ABTestSwitch experimentId="feature-x" variantId="old">
            <OldFeature />
          </ABTestSwitch>
        </ABTestContainer>

        <ABTestContainer experimentId="feature-y" fallbackComponent={<DefaultComponent />}>
          <ABTestSwitch experimentId="feature-y" variantId="new">
            <NewFeature />
          </ABTestSwitch>
          <ABTestSwitch experimentId="feature-y" variantId="old">
            <OldFeature />
          </ABTestSwitch>
        </ABTestContainer>
      </div>
    </ABTestProvider>
  );
};

export default App; 