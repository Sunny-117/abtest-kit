import { ABTestManager } from '@abtest/core';

// 创建 ABTest 管理器实例
const abTestManager = new ABTestManager();

// 添加实验分配结果
abTestManager.addAllocation('feature-x', {
  experimentId: 'feature-x',
  variantId: 'new'
});

abTestManager.addAllocation('feature-y', {
  experimentId: 'feature-y',
  variantId: 'old'
});

// 获取并打印实验状态
console.log('Feature X allocation:', abTestManager.getAllocation('feature-x'));
console.log('Feature Y allocation:', abTestManager.getAllocation('feature-y'));

// 根据实验状态执行不同逻辑
const featureXAllocation = abTestManager.getAllocation('feature-x');
if (featureXAllocation?.variantId === 'new') {
  console.log('Using new feature X');
} else {
  console.log('Using old feature X');
}

const featureYAllocation = abTestManager.getAllocation('feature-y');
if (featureYAllocation?.variantId === 'new') {
  console.log('Using new feature Y');
} else {
  console.log('Using old feature Y');
}

// 获取并打印所有实验分配结果
console.log('All allocations:', abTestManager.getAllAllocations()); 