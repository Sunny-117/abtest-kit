import { ABTestProvider, useABTest, useABTestValue, type ABTestConfigMap } from 'abtest-kit';

const abTestConfig: ABTestConfigMap = {
  buttonColor: {
    key: 'buttonColor',
    value: -1,
    groups: {
      0: 50,
      1: 50
    },
    strategy: 'random' as const
  },
  layoutStyle: {
    key: 'layoutStyle',
    value: -1,
    groups: {
      0: 33,
      1: 33,
      2: 34
    },
    strategy: 'random' as const
  },
  featureFlag: {
    key: 'featureFlag',
    value: -1,
    groups: {
      0: 70,
      1: 30
    },
    strategy: 'random' as const
  }
};

function HooksDemoContent() {
  const { abTestConfig: config, pending, userstat } = useABTest();
  const buttonColorValue = useABTestValue('buttonColor');
  const layoutValue = config.layoutStyle?.value ?? -1;
  const featureValue = useABTestValue('featureFlag');

  return (
    <div>
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
    >
      <HooksDemoContent />
    </ABTestProvider>
  );
}
