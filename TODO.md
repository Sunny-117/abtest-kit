# 重构计划

1. API 提供实验参数的值的控制，而不是固定的-1,0,1，而是允许用户定义
2. 简化的 abTestConfig 配置，无论hooks还是no-hooks版本都用一套resolveConfig
3. userstats 不要用，改名字？要么就返回数组，不指定名字
4. 多个ABProvider实例 数据不能互相干扰：let globalConfigMap: NormalizedGlobalConfigMap = {}; 这种就会全局污染
5. 单元测试覆盖率
6. 通过 url 强制命中实验 forceHitTestFlag 不够灵活，不过默认支持设置storage里面
7. hooks的分流策略和no-hooks分流策略统一，并且允许自定义分流（统一一套策略解析逻辑）
8. no-hooks完全不依赖react runtime
