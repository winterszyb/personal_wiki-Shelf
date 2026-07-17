# A2A Mention 解析

## 解析流程

```
原始文本
  → 剥离代码块 (```...```)
  → 扫描每行行首 (去除 > - * 1. 等 Markdown 前缀)
  → 匹配 @handle (最长匹配优先 + token 边界检查)
  → 过滤自身 ID
  → 最多 2 个不同目标
  → resolveCatTarget() 验证 Cat 是否存在/启用
```

## 核心规则

### 1. 行首要求
- **触发路由**: 行首 `@handle` (如 `@opus review`)
- **不触发路由**: 行内 `@handle` (如 `please @opus review`)

### 2. 代码块剥离
```javascript
// 剥离 ```...``` 块
const noCodeText = text.replace(/```[\s\S]*?```/g, '');
```
代码块内容永不产生 A2A 路由。

### 3. Markdown 前缀处理
去除列表前缀后再检查 `@`：
- `> ` (引用)
- `- ` / `* ` (无序列表)
- `1. ` (有序列表)
- 空格

### 4. 最长匹配优先
```
@opus-4.6  >  @opus  (优先匹配长的)
```

### 5. Token 边界检查
`@` 后的 handle 必须以空格、标点或字符串结束结束：
```
@opus-45  ≠  @opus  (token 边界检查防止误匹配)
```

### 6. 最大目标数
**限制**: 最多 2 个不同 Cat 目标
**原因**: 防止过度复杂的多 Agent 协作

### 7. 自身调用过滤
Cat 不能 @ 自己

## 解析函数

```typescript
function parseA2AMentions(text: string, currentCatId?: string): CatId[] {
  // 1. 剥离代码块
  const noCodeText = stripCodeBlocks(text);
  
  // 2. 扫描每行
  const mentions: CatId[] = [];
  for (const line of noCodeText.split('\n')) {
    // 3. 检查行首 @
    const match = line.match(/^\s*[@]/);
    if (!match) continue;
    
    // 4. 匹配 handle
    const handle = extractHandle(line);
    if (isValidHandle(handle)) {
      // 5. 过滤自身
      if (handle !== currentCatId) {
        mentions.push(handle);
      }
    }
    
    // 6. 最多 2 个目标
    if (mentions.length >= 2) break;
  }
  
  return mentions;
}
```

## 行内 @mention 处理

### 写侧反馈
行内 `@handle` 不触发路由，但产生**写侧反馈**：
```
ready for @opus  → 提示 "请在行首使用 @opus 进行路由"
```

### 阴影检测
检测行内 @mention 用于识别"词汇差距"候选：
```
please @opus check this  → 记录候选，用于后续学习
```

## 并行模式

在并行模式 (`route-parallel.ts`) 中：
- 所有 `@` 只做日志记录
- **不产生路由决策**
- **不推入工作列表**
- **不发送 followup 提示**

## 相关文档

- [路由系统](?file=个人知识库/ai-native-builder知识库/clowder-ai架构wiki/07-A2A机制/01-路由系统.md)
- [工作列表](?file=个人知识库/ai-native-builder知识库/clowder-ai架构wiki/07-A2A机制/03-工作列表.md)

## 回到上级目录

- [总目录](../总目录.md)