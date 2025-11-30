import { useState, useEffect } from 'react';
import {
  initGlobalABTest,
  getGlobalABTestUserstat,
  clearGlobalABTestCache,
  resetGlobalABTest
} from 'abtest-kit';

const getUserId = () => {
  let userId = localStorage.getItem('demo_user_id');
  if (!userId) {
    userId = 'user_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('demo_user_id', userId);
  }
  return userId;
};

const globalABTestConfig = {
  themeColor: {
    key: 'themeColor',
    paramName: 'themeColor',
    groups: {
      0: 99,
      1: 1,
    }
  },
  recommendAlgorithm: {
    key: 'themeColor',
    paramName: 'themeColor',
    groups: {
      0: 25,
      1: 25,
      2: 25,
    },
    strategy: (groups: { [groupId: number]: number }) => {
      return 1;
    }
  }
};

export default function NonHooksDemo() {
  const [userId] = useState(getUserId());
  const [strategy, setStrategy] = useState<'random' | 'crc32'>('random');
  const [testResults, setTestResults] = useState<Record<string, number>>({});

  const initTests = (strategyType: 'random' | 'crc32') => {
    const result = initGlobalABTest(globalABTestConfig, {
      strategy: strategyType,
      userId: strategyType === 'crc32' ? userId : undefined
    });
    setTestResults(result);
  };

  useEffect(() => {
    initTests(strategy);
  }, []);

  const handleStrategyChange = (newStrategy: 'random' | 'crc32') => {
    setStrategy(newStrategy);
    clearGlobalABTestCache();
    initTests(newStrategy);
  };

  const handleReset = () => {
    const result = resetGlobalABTest(globalABTestConfig, {
      strategy,
      userId: strategy === 'crc32' ? userId : undefined
    });
    setTestResults(result);
  };

  return (
    <div>
      <div>
        <p>用户ID: {userId}</p>
        <p>
          策略: 
          <button onClick={() => handleStrategyChange('random')}>
            Random {strategy === 'random' && '✓'}
          </button>
          <button onClick={() => handleStrategyChange('crc32')}>
            CRC32 {strategy === 'crc32' && '✓'}
          </button>
        </p>
        <button onClick={handleReset}>重置</button>
      </div>

      <div>
        <h3>实验状态</h3>
        <p>Userstat: {getGlobalABTestUserstat()}</p>
      </div>

      <div>
        <h3>实验分组数据</h3>
        <p>themeColor: 组 {testResults.themeColor ?? -1}</p>
        <p>recommendAlgorithm (自定义策略): 组 {testResults.recommendAlgorithm ?? -1}</p>
      </div>

      <div>
        <h3>完整结果</h3>
        <pre>{JSON.stringify(testResults, null, 2)}</pre>
      </div>
    </div>
  );
}
