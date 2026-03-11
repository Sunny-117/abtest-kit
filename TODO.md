# 重构计划

0. baiduTongjiStrategy.getValue 可以优化下,调用抽象接口,不要和百度统计耦合
2. 简化的 abTestConfig 配置，无论hooks还是no-hooks版本都用一套resolveConfig
3. userstats 不要用，改名字？要么就返回数组，不指定名字
6. 通过 url 强制命中实验 forceHitTestFlag 不够灵活，不过默认支持设置storage里面
7. 分流用户的时候可以使用 fingerprintjs 浏览器指纹
