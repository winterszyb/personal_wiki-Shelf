# MCP 认证机制

## 三种认证模式

### 1. 调用令牌认证（默认）

**适用场景**: 每次 Agent 调用
**认证方式**: `x-invocation-id` + `x-callback-token` HTTP 头
**TTL**: 2 小时

```javascript
// 调用创建
const {invocationId, callbackToken} = InvocationRegistry.create();

// 回调请求
headers: {
  'x-invocation-id': invocationId,
  'x-callback-token': callbackToken
}
```

### 2. Agent 密钥认证

**适用场景**: 持久化 Agent（如 Antigravity IDE）
**认证方式**: `x-agent-key-secret` HTTP 头
**密钥来源**: 
- 共享密钥环境变量
- 单个密钥文件路径
- 按猫的密钥文件映射（JSON）

```javascript
headers: {
  'x-agent-key-secret': sharedSecret
}
```

### 3. 凭证文件刷新认证（#1092）

**适用场景**: 会话恢复场景
**实现方式**: 从 `CAT_CAFE_CREDENTIAL_FILE` 文件重读凭证
**优势**: MCP 子进程无需重启即可获取新凭证

```javascript
// 每次回调时重新读取凭证
const credentials = readCredentialFile(process.env.CAT_CAFE_CREDENTIAL_FILE);
```

## 认证校验流程

`InvocationRegistry.verify()` 执行四层检查：

### 1. TTL 过期检查
```javascript
if (Date.now() > entry.createdAt + TTL) {
  return { status: 'expired' };
}
```

### 2. Token 不匹配检查
```javascript
if (entry.token !== providedToken) {
  return { status: 'invalid_token' };
}
```

### 3. 未知调用检查
```javascript
if (!registry.has(invocationId)) {
  return { status: 'unknown_invocation' };
}
```

### 4. 过期调用检查（防重放）
```javascript
if (!isLatest(invocationId)) {
  return { status: 'stale_invocation' };
}
```

## 访问控制

### 只读模式
`CAT_CAFE_READONLY=true` 时：
- 仅白名单工具可用（搜索、列表、读取、信号等）
- 写入类工具被过滤
- Agent 密钥可解锁部分写入工具

### 桌面模式
`CAT_CAFE_DESKTOP_MODE` 时：
- 10 工具严格白名单（5 Collab + 5 Memory）
- 更严格的访问控制

### 新鲜度通知 (F254)
- 每 5 次只读工具调用
- MCP Server ping API 检查是否有未读消息
- 有则附加提示到工具结果中

## 相关文档

- [MCP 工具体系](./MCP工具体系.md)
- [MCP 调用流程](./MCP调用流程.md)

## 回到上级目录

- [总目录](../总目录.md)