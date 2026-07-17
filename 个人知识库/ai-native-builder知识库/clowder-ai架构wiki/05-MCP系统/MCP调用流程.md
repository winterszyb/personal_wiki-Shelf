# MCP 调用流程

## 完整调用流程

### 第一步：调用创建

`invoke-single-cat.ts` 为每次调用生成唯一的 `{invocationId, callbackToken}`：

```
InvocationRegistry.create() → {invocationId, callbackToken} (TTL 2h)
  ↓ 注入环境变量
CAT_CAFE_INVOCATION_ID=xxx
CAT_CAFE_CALLBACK_TOKEN=yyy
CAT_CAFE_API_URL=http://...
```

### 第二步：MCP Server 启动

Claude CLI 通过 `--mcp-config` 加载 MCP Server 配置，Codex 通过 `--config mcp_servers.*`。MCP Server 通过 stdio 与 Agent CLI 通信。

### 第三步：工具调用

Agent 调用 MCP 工具时，根据工具类型走不同路径：

```
Agent 调用 cat_cafe_search_evidence
  → MCP Server 收到请求
  → 直接 fetch("GET /api/evidence/search?q=...")  （无需认证的本地调用）

Agent 调用 cat_cafe_post_message
  → MCP Server 收到请求
  → callbackPost("/api/callbacks/post-message", body)
    → 读取 CAT_CAFE_CALLBACK_TOKEN / CAT_CAFE_INVOCATION_ID
    → HTTP Header: x-invocation-id + x-callback-token
    → API 端 InvocationRegistry.verify() 校验
    → 执行消息投递
```

### 第四步：认证校验

`InvocationRegistry.verify()` 做四层检查：
1. **TTL 过期** — token 超过 2 小时
2. **Token 不匹配** — 伪造或损坏
3. **未知调用** — invocationId 不存在
4. **过期调用** — 不是该 thread+cat 的最新调用（防重放）

### 第五步：容错与降级

- **回调出箱** (`callback-outbox.ts`)：关键写入工具失败时持久化到 `~/.cat-cafe/callback-outbox/`
- **降级处理** (`degradation.ts`)：认证失败时对写入类工具可配置降级策略

## 工具通信模式分类

### Group 1 -- 本地 Fetch
- 直接调 API，无需回调凭证
- 示例：`search_evidence`, `graph_resolve`, `list_recent`

### Group 2 -- 回调 Post
- 使用 `callbackPost()` 通过认证 HTTP 端点路由
- 所有 collab 工具、hub 动作、事件记忆工具

### Group 3 -- 回调 Get
- 只读、认证的回调请求
- 示例：`get_thread_context`, `list_threads`

### Group 4 -- 直接文件系统
- 无 API 调用，直接读写文件
- 示例：`read_file`, `write_file`, `list_files`

### Group 5 -- 音频服务
- 直接与独立 Python 音频服务通信
- 所有 `cat_cafe_audio_*` 工具

## 相关文档

- [MCP 工具体系](./MCP工具体系.md)
- [MCP 认证机制](./MCP认证机制.md)

## 回到上级目录

- [总目录](../总目录.md)