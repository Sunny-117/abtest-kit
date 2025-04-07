帮我设计并实现一套ABTest前端基础设施，要求如下：
1. core：技术栈无关，实现ABT核心流程
2. 框架层：基于React的ABT框架（先不用实现vue）

# 后端设计
接口返回分流好的数据，实验X：命中对照组/实验组A/实验组B/...

# 前端套件设计：
## 新功能 / UI / 文案层面的 ABTest
```js
// BAD：我们尽量要避免这样的情况——
if (flag.isFlag('xx')) {
    if (flag.isFlag('yy')) {
    }
    else {
    }
}
else {
    if (flag.isFlag('yy')) {
    }
    else {
    }
}
```
当推全的时候，你可能需要额外的时间做代码清理，以及回归，一旦误删或者操作错误，就非常容易出 case！

## 初级应用
```jsx
<ABTestContainer config={{key: 'xx'}} fallbackComponent={renderDefault()}>
    <ABTestSwitch name="new">
        <New />
    </ABTestSwitch>
    <ABTestSwitch name="old" />
        <对照组 />
    </ABTestSwitch>
</ABTestContainer>
```
设计初衷是，一个实验即一个 ABTestContainer，可能有多个 ABTestSwitch（用 props.children 遍历去 match）
这样不需要在渲染组件里面清理 if else 逻辑，而是只需要在这个展示层面，摘除对应的 node 即可

## 高级应用
```jsx
<ABTestContainer config={{key: 'xx'}} fallbackComponent={renderDefault()}>
    <ABTestSwitch name="new1">
        <ABTestContainer config={{key: 'yy'}}>
            <ABTestSwitch name="new11">
                <New11 />
            </ABTestSwitch>
            <ABTestSwitch name="new12">
                <New12 />
            </ABTestSwitch>
        </ABTestContainer>
    </ABTestSwitch>
    <ABTestSwitch name="new2">
        <New2 />
    </ABTestSwitch>
    <ABTestSwitch name="old" />
        <对照组 />
    </ABTestSwitch>
</ABTestContainer>

<ABTestContainer config={{key: 'zz'}} fallbackComponent={renderDefault()}>
    <ABTestSwitch name="new3">
        <New3 />
    </ABTestSwitch>
    <ABTestSwitch name="old3" />
        <对照组3 />
    </ABTestSwitch>
</ABTestContainer>
```
可以兼容这种场景：有多层实验，命中实验 xx 的 new1，且在 new1 的情况下又分为 new11 和 new12 做进一步实验 
而且注意到 xx 和 zz 两个最顶层实验 —— 这里可能有多个实验并发（并非单个实验里面的多层）
用这种方式去处理的话，做到逻辑和 UI 解耦。后续维护也不用在代码里面删除各种 if else：进而提升代码的可维护性
