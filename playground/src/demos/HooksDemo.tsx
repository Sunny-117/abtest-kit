import { ABTestProvider, useABTest, useABTestValue } from 'abtest-kit';
import { useState } from 'react';
import './HooksDemo.css';

// AB测试配置
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

// 使用 useABTestValue 的组件示例
function ButtonColorTest() {
  const buttonColorValue = useABTestValue('buttonColor');
  const [count, setCount] = useState(0);

  return (
    <div className="demo-card">
      <h3>按钮颜色测试 (useABTestValue)</h3>
      <p className="description">
        测试不同按钮颜色对点击率的影响
      </p>
      <div className="test-info">
        <span className="label">当前分组:</span>
        <span className="value">
          {buttonColorValue === -1 ? '加载中...' : 
           buttonColorValue === 0 ? '对照组 (蓝色)' : '实验组 (绿色)'}
        </span>
      </div>
      <button
        className={`test-button ${buttonColorValue === 1 ? 'green' : 'blue'}`}
        onClick={() => setCount(count + 1)}
        disabled={buttonColorValue === -1}
      >
        点击我 (点击次数: {count})
      </button>
    </div>
  );
}

// 使用 useABTest 的组件示例
function LayoutStyleTest() {
  const { abTestConfig: config, pending } = useABTest();
  const layoutValue = config.layoutStyle?.value ?? -1;

  return (
    <div className="demo-card">
      <h3>布局样式测试 (useABTest)</h3>
      <p className="description">
        测试不同布局样式对用户体验的影响
      </p>
      <div className="test-info">
        <span className="label">当前分组:</span>
        <span className="value">
          {pending ? '加载中...' : 
           layoutValue === 0 ? '对照组 (列表布局)' : '实验组 (卡片布局)'}
        </span>
      </div>
      <div className={`layout-demo ${layoutValue === 1 ? 'card-layout' : 'list-layout'}`}>
        {[1, 2, 3].map(i => (
          <div key={i} className="layout-item">
            <div className="item-icon">📦</div>
            <div className="item-content">
              <h4>项目 {i}</h4>
              <p>这是项目 {i} 的描述内容</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// 功能开关测试
function FeatureFlagTest() {
  const featureValue = useABTestValue('featureFlag');

  return (
    <div className="demo-card">
      <h3>功能开关测试</h3>
      <p className="description">
        测试新功能对用户的影响
      </p>
      <div className="test-info">
        <span className="label">当前分组:</span>
        <span className="value">
          {featureValue === -1 ? '加载中...' : 
           featureValue === 0 ? '对照组 (旧功能)' : '实验组 (新功能)'}
        </span>
      </div>
      <div className="feature-demo">
        {featureValue === 1 ? (
          <div className="new-feature">
            <span className="badge">NEW</span>
            <p>✨ 这是新功能的界面，包含更多高级特性</p>
            <ul>
              <li>智能推荐</li>
              <li>个性化定制</li>
              <li>实时数据分析</li>
            </ul>
          </div>
        ) : (
          <div className="old-feature">
            <p>这是原有功能的界面</p>
          </div>
        )}
      </div>
    </div>
  );
}

// 显示完整的 AB 测试状态
function ABTestStatus() {
  const { abTestConfig, pending, userstat } = useABTest();
  console.log(pending, 'pending')

  return (
    <div className="demo-card status-card">
      <h3>AB测试状态总览</h3>
      <div className="status-grid">
        <div className="status-item">
          <span className="label">加载状态:</span>
          <span className={`status ${pending ? 'pending' : 'ready'}`}>
            {pending ? '⏳ 加载中' : '✅ 已就绪'}
          </span>
        </div>
        <div className="status-item">
          <span className="label">Userstat:</span>
          <code className="userstat">{userstat || '未初始化'}</code>
        </div>
      </div>
      <details className="config-details">
        <summary>查看完整配置</summary>
        <pre>{JSON.stringify(abTestConfig, null, 2)}</pre>
      </details>
    </div>
  );
}

// 主组件
function HooksDemoContent() {
  return (
    <div className="hooks-demo">
      <div className="intro">
        <h2>Hooks 方式使用说明</h2>
        <p>
          使用 <code>ABTestProvider</code> 包裹应用，通过 <code>useABTest</code> 和 <code>useABTestValue</code> 
          获取分流结果。适合 React 应用，支持自动订阅状态变化。
        </p>
      </div>

      <ABTestStatus />

      <div className="demo-grid">
        <ButtonColorTest />
        <LayoutStyleTest />
        <FeatureFlagTest />
      </div>

      <div className="code-example">
        <h3>代码示例</h3>
        <pre>{`import { ABTestProvider, useABTestValue } from 'abtest-kit';

// 1. 配置 AB 测试
const abTestConfig = {
  buttonColor: {
    key: 'button_color',
    paramName: 'button_color_test',
    value: -1
  }
};

// 2. 使用 Provider 包裹应用
function App() {
  return (
    <ABTestProvider 
      abTestConfig={abTestConfig}
      options={{ strategy: 'random' }}
    >
      <YourComponent />
    </ABTestProvider>
  );
}

// 3. 在组件中使用
function YourComponent() {
  const value = useABTestValue('buttonColor');
  return <div>{value === 1 ? '实验组' : '对照组'}</div>;
}`}</pre>
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
