import { useState, useEffect } from 'react';
import {
  initGlobalABTest,
  getGlobalABTestUserstat,
  resetGlobalABTest
} from 'abtest-kit';

const getUserId = () => {
  let userId = localStorage.getItem('demo_user_id');
  if (!userId) {
    userId = 'user_' + Math.random().toString(36).substring(2, 11);
    localStorage.setItem('demo_user_id', userId);
  }
  return userId;
};

const globalABTestConfig = {
  themeColor: {
    key: 'themeColor',
    groups: {
      0: 99,
      1: 1,
    },
    strategy: 'random' as const
  },
  recommendAlgorithm: {
    key: 'recommendAlgorithm',
    groups: {
      0: 25,
      1: 25,
      2: 25,
    },
    strategy: () => {
      return 1;
    }
  }
};

export default function NonHooksDemo() {
  const [userId] = useState(getUserId());
  const [testResults, setTestResults] = useState<Record<string, number>>({});

  const initTests = () => {
    const result = initGlobalABTest(globalABTestConfig, {
      userId
    });
    setTestResults(result);
  };

  useEffect(() => {
    initTests();
  }, []);

  const handleReset = () => {
    const result = resetGlobalABTest(globalABTestConfig, {
      userId
    });
    setTestResults(result);
  };

  return (
    <div>
      <div>
        <p>用户ID: {userId}</p>
        <button onClick={handleReset}>重置</button>
      </div>

      <div>
        <h3>实验状态</h3>
        <p>Userstat: {getGlobalABTestUserstat()}</p>
      </div>

      <div>
        <h3>实验分组数据</h3>
        <p>themeColor (random策略): 组 {testResults.themeColor ?? -1}</p>
        <p>recommendAlgorithm (自定义策略): 组 {testResults.recommendAlgorithm ?? -1}</p>
      </div>

      <div>
        <h3>完整结果</h3>
        <pre>{JSON.stringify(testResults, null, 2)}</pre>
      </div>
    </div>
  );
}
