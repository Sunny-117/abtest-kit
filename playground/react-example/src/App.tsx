import { useLayoutEffect, useState } from 'react';
import { ABTestProvider, ABTestContainer, ABTestSwitch, useABTest } from '@abtest/react';
import { mockAllocateExperiments } from '@abtest/core';

// 默认组件
const DefaultComponent = () => <div>Default Feature</div>;

// 新功能组件
const NewFeature = () => <div>实验组1</div>;

// 旧功能组件
const OldFeature = () => <div>对照组</div>;

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
            id: '1001',
            name: '1001 Test',
            variants: ['对照组', '实验组1']
          },
          {
            id: '1002',
            name: '1002 Test',
            variants: ['对照组', '实验组1']
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
      <div>
        1001: {abTestManager.getAllocation('1001')?.variantId || 'not allocated'}
      </div>
      <div>
        1002: {abTestManager.getAllocation('1002')?.variantId || 'not allocated'}
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
        
        <h3>实验管理</h3>
        <ExperimentManager />

        <h3>实验展示</h3>
        <p>
          1001
        </p>
        <ABTestContainer experimentId="1001" fallbackComponent={<DefaultComponent />}>
          <ABTestSwitch experimentId="1001" variantId="对照组">
            <NewFeature />
          </ABTestSwitch>
          <ABTestSwitch experimentId="1001" variantId="实验组1">
            <OldFeature />
          </ABTestSwitch>
        </ABTestContainer>
        <p>1002</p>
        <ABTestContainer experimentId="1002" fallbackComponent={<DefaultComponent />}>
          <ABTestSwitch experimentId="1002" variantId="对照组">
            <NewFeature />
          </ABTestSwitch>
          <ABTestSwitch experimentId="1002" variantId="实验组1">
            <OldFeature />
          </ABTestSwitch>
        </ABTestContainer>
      </div>
    </ABTestProvider>
  );
};

export default App; 