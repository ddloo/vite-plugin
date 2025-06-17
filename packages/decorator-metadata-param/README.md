# vite-plugin-decorator-metadata

一个自动注入 TypeScript 装饰器元数据的 Vite 插件，解决 esbuild 不支持 `emitDecoratorMetadata` 的问题。

## 🚀 特性

- ✅ 自动检测带装饰器的 TypeScript 类
- ✅ 自动注入 `design:paramtypes`、`design:type`、`design:returntype` 元数据
- ✅ 兼容 TypeScript 标准的 `__metadata` 辅助函数
- ✅ 零配置，开箱即用
- ✅ 支持 Vite 4.x 和 5.x

## 📦 安装

```bash
npm install vite-plugin-decorator-metadata-param --save-dev
```

## 🔧 使用方法

在您的 `vite.config.ts` 中添加插件：

```typescript
import { defineConfig } from 'vite'
import decoratorMetadata from 'vite-plugin-decorator-metadata-param'

export default defineConfig({
  plugins: [
    decoratorMetadata()
  ]
})
```

## 📖 背景

由于 esbuild 不支持 TypeScript 的 `emitDecoratorMetadata` 选项，使用装饰器的项目在 Vite 中可能会遇到元数据丢失的问题。这个插件通过在构建时自动注入必要的元数据来解决这个问题。

## 🔍 工作原理

1. 扫描 TypeScript 文件中带装饰器的类
2. 分析类的构造函数参数、属性和方法类型
3. 自动生成并注入对应的 `Reflect.metadata` 调用
4. 确保与 TypeScript 编译器生成的元数据格式一致

## 📋 示例

**输入代码：**
```typescript
@Injectable()
class UserService {
  constructor(private httpClient: HttpClient) {}
  
  @Log()
  async getUser(id: string): Promise<User> {
    return this.httpClient.get(`/users/${id}`)
  }
}
```

**插件处理后：**
```typescript
@Injectable()
class UserService {
  constructor(private httpClient: HttpClient) {}
  
  @Log()
  async getUser(id: string): Promise<User> {
    return this.httpClient.get(`/users/${id}`)
  }
}

// 自动注入的元数据
__metadata("design:paramtypes", ["HttpClient"])(UserService);
__metadata("design:paramtypes", ["String"])(UserService.prototype, "getUser", null);
__metadata("design:returntype", "Promise")(UserService.prototype, "getUser", null);
```

## ⚠️ 注意事项

- 此插件仅处理包含装饰器的 TypeScript 文件
- 需要确保项目中已安装 `reflect-metadata` 包
- 建议在其他 TypeScript 相关插件之前使用此插件

## 📄 许可证

MIT

## 🐛 问题反馈

如果您发现任何问题或有功能建议，请在 [GitHub Issues](https://github.com/yourusername/vite-plugin-decorator-metadata/issues) 中提交。

## 🤝 贡献

欢迎提交 Pull Request 来改进这个插件！
