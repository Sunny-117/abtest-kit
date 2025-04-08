import { ABTestManager } from '@abtest/core';

// 创建 ABTest 管理器实例
const abTestManager = new ABTestManager();

// 添加实验分配结果
abTestManager.addAllocation('1001', {
  experimentId: '1001',
  variantId: 'new'
});

abTestManager.addAllocation('1002', {
  experimentId: '1002',
  variantId: 'old'
});

// 获取并打印实验状态
console.log('1001 allocation:', abTestManager.getAllocation('1001'));
console.log('1002 allocation:', abTestManager.getAllocation('1002'));

// 根据实验状态执行不同逻辑
const featureXAllocation = abTestManager.getAllocation('1001');
if (featureXAllocation?.variantId === 'new') {
  console.log('Using new feature X');
} else {
  console.log('Using old feature X');
}

const featureYAllocation = abTestManager.getAllocation('1002');
if (featureYAllocation?.variantId === 'new') {
  console.log('Using new feature Y');
} else {
  console.log('Using old feature Y');
}

// 获取并打印所有实验分配结果
console.log('All allocations:', abTestManager.getAllAllocations()); 