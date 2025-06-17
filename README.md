# Vite Plugin Collection

一个实用的 Vite 插件集合，旨在解决开发过程中的常见问题和提升开发体验。

## 包含的插件

### [`vite-plugin-decorator-metadata`](./packages/decorator-metadata)

一个自动注入 TypeScript 装饰器元数据的 Vite 插件，解决 esbuild 不支持 `emitDecoratorMetadata` 的问题。

**特性：**
- 自动检测带装饰器的 TypeScript 类
- 自动注入 `design:paramtypes`、`design:type`、`design:returntype` 元数据
- 兼容 TypeScript 标准的 `__metadata` 辅助函数
- 零配置，开箱即用
- 支持 Vite 4.x 和 5.x

**安装：**
```bash
npm install vite-plugin-decorator-metadata --save-dev
```

**使用：**
```typescript
import { defineConfig } from 'vite'
import decoratorMetadata from 'vite-plugin-decorator-metadata'

export default defineConfig({
  plugins: [
    decoratorMetadata()
  ]
})
```

## 快速开始

每个插件都有详细的使用文档，请查看对应包目录下的 README.md 文件。

## 开发

本项目使用 monorepo 结构管理多个插件包。

### 项目结构

```
vite-plugin/
├── packages/
│   └── decorator-metadata/     # 装饰器元数据插件
│       ├── src/               # 源代码
│       ├── dist/              # 构建输出
│       ├── package.json       # 包配置
│       └── README.md          # 插件文档
├── README.md                  # 项目总览
└── package.json               # 根配置
```

### 构建

进入对应的包目录，运行构建命令：

```bash
cd packages/decorator-metadata
npm run build
```

## 贡献

欢迎提交 Pull Request 来改进这些插件！请确保：

1. 代码符合项目的编码规范
2. 添加适当的测试用例
3. 更新相关文档
4. 提交信息清晰明确

## 许可证

MIT License - 详见 [LICENSE](./LICENSE) 文件

## 问题反馈

如果您发现任何问题或有功能建议，请在 [GitHub Issues](https://github.com/ddloo/vite-plugin/issues) 中提交。

---

*如果这个项目对您有帮助，请给个 ⭐️ 支持一下！*