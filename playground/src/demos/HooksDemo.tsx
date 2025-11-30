import { ABTestProvider, useABTest, useABTestValue } from 'abtest-kit';

const abTestConfig = {
  buttonColor: {
    key: 'buttonColor',
    paramName: 'buttonColor',
    value: -1
  },
  layoutStyle: {
    key: 'layoutStyle',
    paramName: 'layoutStyle',
    value: -1
  },
  featureFlag: {
    key: 'featureFlag',
    paramName: 'featureFlag',
    value: -1
  }
};

function HooksDemoContent() {
  const { abTestConfig: config, pending, userstat } = useABTest();
  const buttonColorValue = useABTestValue('buttonColor');
  const layoutValue = config.layoutStyle?.value ?? -1;
  const featureValue = useABTestValue('featureFlag');

  return (
    <div>
      <h2>Hooks 方式 - 实验数据</h2>
      
      <div>
        <h3>实验状态</h3>
        <p>加载状态: {pending ? '加载中' : '已就绪'}</p>
        <p>Userstat: {userstat || '未初始化'}</p>
      </div>

      <div>
        <h3>实验分组数据</h3>
        <p>buttonColor: 组 {buttonColorValue}</p>
        <p>layoutStyle: 组 {layoutValue}</p>
        <p>featureFlag: 组 {featureValue}</p>
      </div>

      <div>
        <h3>完整配置</h3>
        <pre>{JSON.stringify(config, null, 2)}</pre>
      </div>
    </div>
  );
}

export default function HooksDemo() {
  return (
    <ABTestProvider 
      abTestConfig={abTestConfig}
      options={{ strategy: 'random' }}
    >
      <HooksDemoContent />
    </ABTestProvider>
  );
}
