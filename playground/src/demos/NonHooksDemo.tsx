import { useState, useEffect } from 'react';
import {
  initGlobalABTest,
  getGlobalABTestUserstat,
  clearGlobalABTestCache,
  resetGlobalABTest
} from 'abtest-kit';
import './NonHooksDemo.css';

// 模拟用户ID
const getUserId = () => {
  let userId = localStorage.getItem('demo_user_id');
  if (!userId) {
    userId = 'user_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('demo_user_id', userId);
  }
  return userId;
};

// 全局分流配置
const globalABTestConfig = {
  themeColor: {
    key: 'theme_color',
    paramName: 'theme_color_test',
    groups: {
      0: 33, // 蓝色主题
      1: 33, // 紫色主题
      2: 34  // 绿色主题
    }
  },
  cardStyle: {
    key: 'card_style',
    paramName: 'card_style_test',
    groups: {
      0: 50, // 简约风格
      1: 50  // 卡片风格
    }
  },
  recommendAlgorithm: {
    key: 'recommend_algorithm',
    paramName: 'recommend_algorithm_test',
    groups: {
      0: 25, // 算法A
      1: 25, // 算法B
      2: 25, // 算法C
      3: 25  // 算法D
    },
    // 单个实验使用自定义策略
    strategy: (groups: { [groupId: number]: number }) => {
      const hour = new Date().getHours();
      const groupIds = Object.keys(groups).map(Number);
      return groupIds[hour % groupIds.length];
    }
  }
};

export default function NonHooksDemo() {
  const [userId] = useState(getUserId());
  const [strategy, setStrategy] = useState<'random' | 'crc32'>('random');
  const [initialized, setInitialized] = useState(false);
  const [testResults, setTestResults] = useState<Record<string, number>>({});
  const [userstat, setUserstat] = useState('');

  // 初始化全局分流
  const initTests = (strategyType: 'random' | 'crc32') => {
    const result = initGlobalABTest(globalABTestConfig, {
      strategy: strategyType,
      userId: strategyType === 'crc32' ? userId : undefined
    });
    
    setTestResults(result);
    setUserstat(getGlobalABTestUserstat());
    setInitialized(true);
  };

  // 页面加载时初始化
  useEffect(() => {
    initTests(strategy);
  }, []);

  // 切换策略
  const handleStrategyChange = (newStrategy: 'random' | 'crc32') => {
    setStrategy(newStrategy);
    clearGlobalABTestCache();
    initTests(newStrategy);
  };

  // 重置分流
  const handleReset = () => {
    const result = resetGlobalABTest(globalABTestConfig, {
      strategy,
      userId: strategy === 'crc32' ? userId : undefined
    });
    setTestResults(result);
    setUserstat(getGlobalABTestUserstat());
  };

  // 获取主题颜色
  const getThemeColor = () => {
    const value = testResults.themeColor ?? -1;
    switch (value) {
      case 0: return { name: '蓝色主题', color: '#1890ff' };
      case 1: return { name: '紫色主题', color: '#722ed1' };
      case 2: return { name: '绿色主题', color: '#52c41a' };
      default: return { name: '未初始化', color: '#999' };
    }
  };

  const theme = getThemeColor();
  const cardStyleValue = testResults.cardStyle ?? -1;
  const recommendValue = testResults.recommendAlgorithm ?? -1;

  return (
    <div className="non-hooks-demo">
      <div className="intro">
        <h2>非 Hooks 方式使用说明</h2>
        <p>
          使用 <code>initGlobalABTest</code> 在页面加载时初始化分流，通过 <code>getGlobalABTestValue</code> 
          获取分流结果。适合非 React 应用或需要在页面加载初期就确定分流的场景。
        </p>
      </div>

      <div className="control-panel">
        <div className="control-group">
          <label>用户ID:</label>
          <code className="user-id">{userId}</code>
        </div>
        <div className="control-group">
          <label>分流策略:</label>
          <div className="strategy-buttons">
            <button
              className={strategy === 'random' ? 'active' : ''}
              onClick={() => handleStrategyChange('random')}
            >
              Random (随机)
            </button>
            <button
              className={strategy === 'crc32' ? 'active' : ''}
              onClick={() => handleStrategyChange('crc32')}
            >
              CRC32 (确定性)
            </button>
          </div>
        </div>
        <button className="reset-button" onClick={handleReset}>
          🔄 重置分流
        </button>
      </div>

      <div className="status-card">
        <h3>分流状态</h3>
        <div className="status-grid">
          <div className="status-item">
            <span className="label">初始化状态:</span>
            <span className={`status ${initialized ? 'ready' : 'pending'}`}>
              {initialized ? '✅ 已初始化' : '⏳ 未初始化'}
            </span>
          </div>
          <div className="status-item">
            <span className="label">Userstat:</span>
            <code className="userstat">{userstat || '未初始化'}</code>
          </div>
        </div>
      </div>

      <div className="demo-grid">
        {/* 主题颜色测试 */}
        <div className="demo-card" style={{ borderTopColor: theme.color }}>
          <h3>主题颜色测试</h3>
          <p className="description">测试不同主题颜色对用户偏好的影响</p>
          <div className="test-info">
            <span className="label">当前分组:</span>
            <span className="value" style={{ color: theme.color }}>
              {theme.name} (组 {testResults.themeColor ?? -1})
            </span>
          </div>
          <div className="theme-preview" style={{ background: theme.color }}>
            <div className="preview-content">
              <h4>主题预览</h4>
              <p>这是使用当前主题颜色的界面示例</p>
            </div>
          </div>
        </div>

        {/* 卡片样式测试 */}
        <div className="demo-card">
          <h3>卡片样式测试</h3>
          <p className="description">测试不同卡片样式对内容展示的影响</p>
          <div className="test-info">
            <span className="label">当前分组:</span>
            <span className="value">
              {cardStyleValue === 0 ? '简约风格' : cardStyleValue === 1 ? '卡片风格' : '未初始化'}
              (组 {cardStyleValue})
            </span>
          </div>
          <div className={`card-preview ${cardStyleValue === 1 ? 'card-style' : 'simple-style'}`}>
            {[1, 2, 3].map(i => (
              <div key={i} className="preview-item">
                <div className="item-number">{i}</div>
                <div className="item-text">内容项 {i}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 推荐算法测试 */}
        <div className="demo-card">
          <h3>推荐算法测试 (自定义策略)</h3>
          <p className="description">
            使用自定义策略：基于当前小时数分配到不同算法组
          </p>
          <div className="test-info">
            <span className="label">当前分组:</span>
            <span className="value">
              算法 {String.fromCharCode(65 + (recommendValue >= 0 ? recommendValue : 0))} (组 {recommendValue})
            </span>
          </div>
          <div className="algorithm-info">
            <div className="info-item">
              <span className="icon">🕐</span>
              <span>当前小时: {new Date().getHours()}</span>
            </div>
            <div className="info-item">
              <span className="icon">🎯</span>
              <span>策略: 基于小时数的确定性分流</span>
            </div>
          </div>
        </div>
      </div>

      <div className="code-example">
        <h3>代码示例</h3>
        <pre>{`import {
  initGlobalABTest,
  getGlobalABTestValue,
  getGlobalABTestUserstat
} from 'abtest-kit';

// 1. 定义全局分流配置
const globalABTestConfig = {
  themeColor: {
    key: 'theme_color',
    paramName: 'theme_color_test',
    groups: {
      0: 33,  // 蓝色主题
      1: 33,  // 紫色主题
      2: 34   // 绿色主题
    }
  },
  recommendAlgorithm: {
    key: 'recommend_algorithm',
    paramName: 'recommend_algorithm_test',
    groups: {
      0: 25, 1: 25, 2: 25, 3: 25
    },
    // 单个实验的自定义策略
    strategy: (groups) => {
      const hour = new Date().getHours();
      const groupIds = Object.keys(groups).map(Number);
      return groupIds[hour % groupIds.length];
    }
  }
};

// 2. 在页面加载时初始化（支持全局自定义策略）
const result = initGlobalABTest(globalABTestConfig, {
  strategy: 'random', // 或 'crc32' 或自定义函数
  userId: 'user_123'  // crc32策略需要
});

// 3. 获取分流值
const themeValue = getGlobalABTestValue('themeColor');

// 4. 获取 userstat
const userstat = getGlobalABTestUserstat();
console.log(userstat); // "theme_color-1;recommend_algorithm-2"`}</pre>
      </div>

      <div className="tips">
        <h3>💡 使用提示</h3>
        <ul>
          <li>分流结果会保存在 localStorage 中，刷新页面不会改变分流</li>
          <li>Random 策略：每次重置都会随机分配新的组</li>
          <li>CRC32 策略：基于用户ID的确定性分流，同一用户ID总是分配到相同的组</li>
          <li>自定义策略：可以为全局或单个实验定义自己的分流逻辑</li>
          <li>单个实验的 strategy 优先级高于全局 strategy</li>
          <li>使用 <code>resetGlobalABTest()</code> 可以清除缓存并重新分流</li>
        </ul>
      </div>
    </div>
  );
}
