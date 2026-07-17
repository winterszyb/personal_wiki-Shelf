# Claude CLI 接入

## 接入架构

```
invoke-single-cat.ts (统一入口)
  → AgentRegistry.get(catId) → AgentService
    → ClaudeAgentService.invoke()  → claude CLI 子进程
```



## CLI 子进程启动方式

```bash
claude -p --output-format stream-json --include-partial-messages --verbose
       --permission-mode bypassPermissions
       --resume <sessionId>        # 会话恢复
       --system-prompt-file <L0>   # 系统提示词
       --mcp-config <json>         # MCP 配置
```

## 关键特性

- **Print 模式**: 使用 `-p` 标志，处理单个提示词后退出
- **输出格式**: `--output-format stream-json` 发出 NDJSON 事件
- **流式输出**: `--include-partial-messages` 启用增量文本增量
- **权限**: `--permission-mode bypassPermissions` 自动批准所有工具调用
- **提示词**: 通过 `stdin` 传入，规避 Windows 32767 字符命令行限制

## 相关文档

- [MCP 配置](?file=个人知识库/ai-native-builder知识库/clowder-ai架构wiki/04-提供商接入/Claude/02-MCP配置.md)
- [会话管理](?file=个人知识库/ai-native-builder知识库/clowder-ai架构wiki/04-提供商接入/Claude/03-会话管理.md)

## 回到上级目录

- [Claude 提供商](../04-提供商接入.md)