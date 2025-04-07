import { ABTestProvider, ABTestContainer, ABTestSwitch } from '@abtest/react';

// 默认组件
const DefaultComponent = () => <div>Default Feature</div>;

// 新功能组件
const NewFeature = () => <div>New Feature</div>;

// 旧功能组件
const OldFeature = () => <div>Old Feature</div>;

// 嵌套实验组件
const NestedExperiment = () => (
  <ABTestContainer config={{ key: 'nested-feature' }} fallbackComponent={<DefaultComponent />}>
    <ABTestSwitch name="new">
      <NewFeature />
    </ABTestSwitch>
    <ABTestSwitch name="old">
      <OldFeature />
    </ABTestSwitch>
  </ABTestContainer>
);

// 主应用组件
const App = () => {
  return (
    <ABTestProvider>
      <div>
        <h1>A/B Testing Example</h1>
        
        {/* 简单实验 */}
        <ABTestContainer config={{ key: 'feature-x' }} fallbackComponent={<DefaultComponent />}>
          <ABTestSwitch name="new">
            <NewFeature />
          </ABTestSwitch>
          <ABTestSwitch name="old">
            <OldFeature />
          </ABTestSwitch>
        </ABTestContainer>

        {/* 嵌套实验 */}
        <ABTestContainer config={{ key: 'parent-feature' }} fallbackComponent={<DefaultComponent />}>
          <ABTestSwitch name="new">
            <NestedExperiment />
          </ABTestSwitch>
          <ABTestSwitch name="old">
            <OldFeature />
          </ABTestSwitch>
        </ABTestContainer>
      </div>
    </ABTestProvider>
  );
};

export default App; 