/**
 * 大数据量分流测试脚本
 * 验证initGlobalABTest的分流效果是否符合预期的比例
 */

import process from 'node:process';
import { initGlobalABTest } from '../globalABTest';
import { GlobalABTestConfig } from '../types';

// 模拟localStorage
const mockStorage: { [key: string]: string } = {};
const mockLocalStorage = {
  getItem: (key: string) => mockStorage[key] || null,
  setItem: (key: string, value: string) => { mockStorage[key] = value; },
  removeItem: (key: string) => { delete mockStorage[key]; },
  clear: () => { Object.keys(mockStorage).forEach(key => delete mockStorage[key]); }
};

// 替换全局localStorage
Object.defineProperty(globalThis, 'localStorage', {
  value: mockLocalStorage,
  writable: true
});

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(color: string, text: string) {
  console.log(`${color}${text}${colors.reset}`);
}

function pass(text: string) {
  log(colors.green, `✅ ${text}`);
}

function fail(text: string) {
  log(colors.red, `❌ ${text}`);
}

function info(text: string) {
  log(colors.cyan, text);
}

function title(text: string) {
  log(colors.blue, `\n${'='.repeat(60)}`);
  log(colors.blue, text);
  log(colors.blue, `${'='.repeat(60)}`);
}

// 验证函数
function verifyRatio(actual: number, expected: number, tolerance: number = 10): boolean {
  const diff = Math.abs(actual - expected);
  return diff <= tolerance;
}

// 测试1：50-50分流
function test50_50(): boolean {
  title('测试1：50-50分流（1000次随机分流）');

  const config: { [testName: string]: GlobalABTestConfig } = {
    test50_50: {
      key: 'test_50_50',
      paramName: 'test_50_50_param',
      groups: { 0: 50, 1: 50 }
    }
  };

  const results: { [groupId: number]: number } = { 0: 0, 1: 0 };
  const iterations = 1000;

  for (let i = 0; i < iterations; i++) {
    mockLocalStorage.clear();
    const result = initGlobalABTest(config);
    const groupId = result.test50_50;
    results[groupId]++;
  }

  const ratio0 = (results[0] / iterations) * 100;
  const ratio1 = (results[1] / iterations) * 100;

  info(`\n结果统计（${iterations}次）:`);
  console.log(`  0组: ${results[0]}次 (${ratio0.toFixed(2)}%)`);
  console.log(`  1组: ${results[1]}次 (${ratio1.toFixed(2)}%)`);

  const pass0 = verifyRatio(ratio0, 50, 10);
  const pass1 = verifyRatio(ratio1, 50, 10);

  if (pass0 && pass1) {
    pass('分流比例符合预期 (50% ± 10%)');
    return true;
  } else {
    fail('分流比例不符合预期');
    return false;
  }
}

// 测试2：20-80分流
function test20_80(): boolean {
  title('测试2：20-80分流（1000次随机分流）');

  const config: { [testName: string]: GlobalABTestConfig } = {
    test20_80: {
      key: 'test_20_80',
      paramName: 'test_20_80_param',
      groups: { 0: 20, 1: 80 }
    }
  };

  const results: { [groupId: number]: number } = { 0: 0, 1: 0 };
  const iterations = 1000;

  for (let i = 0; i < iterations; i++) {
    mockLocalStorage.clear();
    const result = initGlobalABTest(config);
    const groupId = result.test20_80;
    results[groupId]++;
  }

  const ratio0 = (results[0] / iterations) * 100;
  const ratio1 = (results[1] / iterations) * 100;

  info(`\n结果统计（${iterations}次）:`);
  console.log(`  0组: ${results[0]}次 (${ratio0.toFixed(2)}%)`);
  console.log(`  1组: ${results[1]}次 (${ratio1.toFixed(2)}%)`);

  const pass0 = verifyRatio(ratio0, 20, 10);
  const pass1 = verifyRatio(ratio1, 80, 10);

  if (pass0 && pass1) {
    pass('分流比例符合预期 (20% ± 10%, 80% ± 10%)');
    return true;
  } else {
    fail('分流比例不符合预期');
    return false;
  }
}

// 测试3：多组分流
function testMultiGroup(): boolean {
  title('测试3：多组分流（5000次随机分流）');

  const config: { [testName: string]: GlobalABTestConfig } = {
    testMulti: {
      key: 'test_multi',
      paramName: 'test_multi_param',
      groups: { 0: 30, 1: 50, 2: 20 }
    }
  };

  const results: { [groupId: number]: number } = { 0: 0, 1: 0, 2: 0 };
  const iterations = 5000;

  for (let i = 0; i < iterations; i++) {
    mockLocalStorage.clear();
    const result = initGlobalABTest(config);
    const groupId = result.testMulti;
    results[groupId]++;
  }

  const ratio0 = (results[0] / iterations) * 100;
  const ratio1 = (results[1] / iterations) * 100;
  const ratio2 = (results[2] / iterations) * 100;

  info(`\n结果统计（${iterations}次）:`);
  console.log(`  0组: ${results[0]}次 (${ratio0.toFixed(2)}%)`);
  console.log(`  1组: ${results[1]}次 (${ratio1.toFixed(2)}%)`);
  console.log(`  2组: ${results[2]}次 (${ratio2.toFixed(2)}%)`);

  const pass0 = verifyRatio(ratio0, 30, 8);
  const pass1 = verifyRatio(ratio1, 50, 8);
  const pass2 = verifyRatio(ratio2, 20, 8);

  if (pass0 && pass1 && pass2) {
    pass('分流比例符合预期 (30% ± 8%, 50% ± 8%, 20% ± 8%)');
    return true;
  } else {
    fail('分流比例不符合预期');
    return false;
  }
}

// 测试4：极端比例
function testExtreme(): boolean {
  title('测试4：极端比例测试（1000次随机分流）');

  const config: { [testName: string]: GlobalABTestConfig } = {
    testExtreme: {
      key: 'test_extreme',
      paramName: 'test_extreme_param',
      groups: { 0: 1, 1: 99 }
    }
  };

  const results: { [groupId: number]: number } = { 0: 0, 1: 0 };
  const iterations = 1000;

  for (let i = 0; i < iterations; i++) {
    mockLocalStorage.clear();
    const result = initGlobalABTest(config);
    const groupId = result.testExtreme;
    results[groupId]++;
  }

  const ratio0 = (results[0] / iterations) * 100;
  const ratio1 = (results[1] / iterations) * 100;

  info(`\n结果统计（${iterations}次）:`);
  console.log(`  0组: ${results[0]}次 (${ratio0.toFixed(2)}%)`);
  console.log(`  1组: ${results[1]}次 (${ratio1.toFixed(2)}%)`);

  const pass0 = verifyRatio(ratio0, 1, 5);
  const pass1 = verifyRatio(ratio1, 99, 5);

  if (pass0 && pass1) {
    pass('分流比例符合预期 (1% ± 5%, 99% ± 5%)');
    return true;
  } else {
    fail('分流比例不符合预期');
    return false;
  }
}

// 测试5：多个测试同时分流
function testMultipleTests(): boolean {
  title('测试5：多个测试同时分流（1000次）');

  const config: { [testName: string]: GlobalABTestConfig } = {
    test1: {
      key: 'test1',
      paramName: 'test1_param',
      groups: { 0: 50, 1: 50 }
    },
    test2: {
      key: 'test2',
      paramName: 'test2_param',
      groups: { 0: 30, 1: 70 }
    },
    test3: {
      key: 'test3',
      paramName: 'test3_param',
      groups: { 0: 20, 1: 80 }
    }
  };

  const results: { [testName: string]: { [groupId: number]: number } } = {
    test1: { 0: 0, 1: 0 },
    test2: { 0: 0, 1: 0 },
    test3: { 0: 0, 1: 0 }
  };

  const iterations = 1000;

  for (let i = 0; i < iterations; i++) {
    mockLocalStorage.clear();
    const result = initGlobalABTest(config);
    results.test1[result.test1]++;
    results.test2[result.test2]++;
    results.test3[result.test3]++;
  }

  info(`\n结果统计（${iterations}次）:`);
  console.log(`\n  test1 (50-50):`);
  console.log(`    0组: ${results.test1[0]}次 (${((results.test1[0] / iterations) * 100).toFixed(2)}%)`);
  console.log(`    1组: ${results.test1[1]}次 (${((results.test1[1] / iterations) * 100).toFixed(2)}%)`);
  console.log(`\n  test2 (30-70):`);
  console.log(`    0组: ${results.test2[0]}次 (${((results.test2[0] / iterations) * 100).toFixed(2)}%)`);
  console.log(`    1组: ${results.test2[1]}次 (${((results.test2[1] / iterations) * 100).toFixed(2)}%)`);
  console.log(`\n  test3 (20-80):`);
  console.log(`    0组: ${results.test3[0]}次 (${((results.test3[0] / iterations) * 100).toFixed(2)}%)`);
  console.log(`    1组: ${results.test3[1]}次 (${((results.test3[1] / iterations) * 100).toFixed(2)}%)`);

  const test1_ratio0 = (results.test1[0] / iterations) * 100;
  const test2_ratio0 = (results.test2[0] / iterations) * 100;
  const test3_ratio0 = (results.test3[0] / iterations) * 100;

  const pass1 = verifyRatio(test1_ratio0, 50, 10);
  const pass2 = verifyRatio(test2_ratio0, 30, 10);
  const pass3 = verifyRatio(test3_ratio0, 20, 10);

  if (pass1 && pass2 && pass3) {
    pass('所有测试分流比例都符合预期');
    return true;
  } else {
    fail('某些测试分流比例不符合预期');
    return false;
  }
}

// 主函数
async function main() {
  log(colors.yellow, '\n🚀 开始大数据量分流测试...\n');

  const results: boolean[] = [];
  results.push(test50_50());
  results.push(test20_80());
  results.push(testMultiGroup());
  results.push(testExtreme());
  results.push(testMultipleTests());

  // 总结
  title('测试总结');
  const passCount = results.filter(r => r).length;
  const totalCount = results.length;

  console.log(`\n总计: ${passCount}/${totalCount} 个测试通过\n`);

  if (passCount === totalCount) {
    pass('所有测试都通过了！分流效果符合预期 ✨');
    process.exit(0);
  } else {
    fail(`有 ${totalCount - passCount} 个测试失败`);
    process.exit(1);
  }
}

main().catch(err => {
  fail(`测试出错: ${(err as Error).message}`);
  process.exit(1);
});

