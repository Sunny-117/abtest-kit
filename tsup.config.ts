import { defineConfig } from 'tsup';

export default defineConfig({
  clean: true,
  dts: true,
  format: ['cjs', 'esm'],
  minify: true,
  skipNodeModulesBundle: true,
  sourcemap: true,
  target: 'es2015',
  tsconfig: 'tsconfig.json',
}); 