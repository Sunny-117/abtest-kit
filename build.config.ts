import {defineConfig} from 'robuild'

export default defineConfig({
    entry: {
        index: 'src/index.ts',      // 核心入口（无 React 依赖）
        react: 'src/react.tsx',     // React 入口
    },
})