/**
 * 踩坑了：https://github.com/evanw/esbuild/issues/257
 * Vite 插件：自动注入 TypeScript 装饰器元数据
 * 解决 esbuild 不支持 emitDecoratorMetadata 的问题
 */

import type { Plugin } from "vite";
import * as ts from "typescript";

// 类型定义
interface ClassInfo {
  name: string;
  end: number;
  constructor: string[];
  properties: Array<{ name: string; type: string }>;
  methods: Array<{ name: string; paramTypes: string[]; returnType: string }>;
}

export function viteDecoratorMetadata(): Plugin {
  return {
    name: "vite-decorator-metadata",
    enforce: "pre", // 确保在 TypeScript 解析之前执行
    transform(code: string, id: string) {
      // 仅处理包含装饰器的 TypeScript 文件
      if (!id.match(/\.tsx?$/) || !/@\w+/.test(code)) {
        return null;
      }

      try {
        const result = processDecorators(code, id);
        return result !== code ? { code: result, map: null } : null;
      } catch {
        return null;
      }
    },
  };
}

/**
 * 处理装饰器并注入元数据
 */
function processDecorators(source: string, filePath: string): string {
  const sourceFile = ts.createSourceFile(
    filePath,
    source,
    ts.ScriptTarget.ES2020,
    true
  );
  const decoratedClasses = extractDecoratedClasses(sourceFile);

  if (decoratedClasses.length === 0) {
    return source;
  }

  let result = source;

  // 如果还没定义 __metadata 辅助函数，就注入
  if (!source.includes("var __metadata")) {
    result = METADATA_HELPER + "\n" + result;
  }

  // 从后往前注入元数据，避免位置偏移
  const offset = source.includes("var __metadata")
    ? 0
    : METADATA_HELPER.length + 1;

  for (let i = decoratedClasses.length - 1; i >= 0; i--) {
    const classInfo = decoratedClasses[i];
    const metadataCode = generateMetadata(classInfo);

    if (metadataCode) {
      const insertPos = classInfo.end + offset;
      result =
        result.slice(0, insertPos) +
        "\n" +
        metadataCode +
        result.slice(insertPos);
    }
  }

  return result;
}

/**
 * TypeScript 标准 __metadata 辅助函数
 * 从 ts 那边复制过来的
 */
const METADATA_HELPER = `var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};`;

/**
 * 生成完整的元数据注入代码
 */
function generateMetadata(classInfo: ClassInfo): string {
  const { name, constructor: ctor, properties, methods } = classInfo;
  const lines: string[] = [];

  // 构造函数参数类型
  if (ctor.length > 0) {
    const types = ctor.map((type) => `"${type}"`).join(", ");
    lines.push(`__metadata("design:paramtypes", [${types}])(${name});`);
  }

  // 属性类型
  properties.forEach(({ name: propName, type }) => {
    lines.push(
      `__metadata("design:type", "${type}")(${name}.prototype, "${propName}", void 0);`
    );
  });

  // 方法元数据
  methods.forEach(({ name: methodName, paramTypes, returnType }) => {
    if (paramTypes.length > 0) {
      const types = paramTypes.map((type) => `"${type}"`).join(", ");
      lines.push(
        `__metadata("design:paramtypes", [${types}])(${name}.prototype, "${methodName}", null);`
      );
    }
    if (returnType !== "void") {
      lines.push(
        `__metadata("design:returntype", "${returnType}")(${name}.prototype, "${methodName}", null);`
      );
    }
  });

  return lines.join("\n");
}

/**
 * 提取带装饰器的类信息
 */
function extractDecoratedClasses(sourceFile: ts.SourceFile): ClassInfo[] {
  const classes: ClassInfo[] = [];

  function visitNode(node: ts.Node) {
    if (ts.isClassDeclaration(node) && node.name && hasDecorators(node)) {
      classes.push({
        name: node.name.text,
        end: node.getEnd(),
        constructor: extractConstructorTypes(node),
        properties: extractPropertyTypes(node),
        methods: extractMethodTypes(node),
      });
    }
    ts.forEachChild(node, visitNode);
  }

  visitNode(sourceFile);
  return classes;
}

/**
 * 检查节点是否有装饰器
 */
function hasDecorators(node: ts.ClassDeclaration): boolean {
  const decorators = ts.getDecorators?.(node) || (node as any).decorators || [];
  return decorators.length > 0;
}

/**
 * 提取构造函数参数类型
 */
function extractConstructorTypes(classNode: ts.ClassDeclaration): string[] {
  const constructor = classNode.members.find(ts.isConstructorDeclaration);
  return (
    constructor?.parameters.map((param) => extractTypeString(param.type)) || []
  );
}

/**
 * 提取属性类型
 */
function extractPropertyTypes(
  classNode: ts.ClassDeclaration
): Array<{ name: string; type: string }> {
  return classNode.members
    .filter(
      (member): member is ts.PropertyDeclaration =>
        ts.isPropertyDeclaration(member) && ts.isIdentifier(member.name)
    )
    .map((member) => ({
      name: (member.name as ts.Identifier).text,
      type: extractTypeString(member.type),
    }));
}

/**
 * 提取方法类型信息
 */
function extractMethodTypes(
  classNode: ts.ClassDeclaration
): Array<{ name: string; paramTypes: string[]; returnType: string }> {
  return classNode.members
    .filter(
      (member): member is ts.MethodDeclaration =>
        ts.isMethodDeclaration(member) && ts.isIdentifier(member.name)
    )
    .map((member) => ({
      name: (member.name as ts.Identifier).text,
      paramTypes: member.parameters.map((param) =>
        extractTypeString(param.type)
      ),
      returnType: extractTypeString(member.type),
    }));
}

/**
 * 从类型节点提取类型字符串
 */
function extractTypeString(typeNode: ts.TypeNode | undefined): string {
  if (!typeNode) return "Object";

  if (ts.isTypeReferenceNode(typeNode) && ts.isIdentifier(typeNode.typeName)) {
    return typeNode.typeName.text;
  }

  // 处理基础类型
  switch (typeNode.kind) {
    case ts.SyntaxKind.StringKeyword: return "String";
    case ts.SyntaxKind.NumberKeyword: return "Number";
    case ts.SyntaxKind.BooleanKeyword: return "Boolean";
    case ts.SyntaxKind.VoidKeyword: return "void";
    default: return "Object";
  }
}
