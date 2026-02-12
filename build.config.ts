import {defineConfig} from 'robuild'

export default defineConfig({
    entry: {
        index: 'src/index.ts',      // 核心入口（无 React 依赖）
        react: 'src/react.tsx',     // React 入口
    },
    hooks: {
        start: (ctx) => {
            console.log(`开始构建 ${ctx.pkg.name} v${ctx.pkg.version}`)
            console.log(`工作目录: ${ctx.pkgDir}`)
        }
    }
})