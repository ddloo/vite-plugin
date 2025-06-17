/**
 * 踩坑了：https://github.com/evanw/esbuild/issues/257
 * Vite 插件：自动注入 TypeScript 装饰器元数据
 * 解决 esbuild 不支持 emitDecoratorMetadata 的问题
 */
import type { Plugin } from "vite";
export declare function viteDecoratorMetadata(): Plugin;
