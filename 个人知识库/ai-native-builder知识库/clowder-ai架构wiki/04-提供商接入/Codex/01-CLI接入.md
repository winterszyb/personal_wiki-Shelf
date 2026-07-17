# Codex CLI 接入

## 接入架构

```
invoke-single-cat.ts (统一入口)
  → AgentRegistry.get(catId) → AgentService
    → CodexAgentService.invoke()  → codex CLI 子进程
```

## CLI 子进程启动方式

### Fresh 调用
```bash
codex exec --json
       --config model_reasoning_effort=<level>
       --config developer_instructions=<L0>  # 开发者指令
       --config mcp_servers.X.*             # MCP 配置(TOML格式)
       --sandbox <mode>                     # 沙箱模式
       --add-dir .git                       # Git 目录访问
       -- -
```

### Resume 调用
```bash
codex exec resume <sessionId> --json
       --config sandbox_mode=<mode>
       --config approval_policy=<policy>
       -- -
```

## 关键差异（vs Claude）

| 特性 | Claude | Codex |
|------|--------|-------|
| **命令** | `claude -p` | `codex exec` / `codex exec resume` |
| **输出格式** | `--output-format stream-json` | `--json` |
| **配置方式** | JSON 格式 | TOML 格式 `--config` |
| **权限** | `--permission-mode` | `--sandbox` + `--config approval_policy` |
| **系统提示词** | `--system-prompt-file` | `--config developer_instructions` |

## 关键特性

- **子命令**: 使用 `exec` 和 `resume` 子命令
- **TOML 配置**: MCP 配置通过 TOML 格式传入
- **沙箱模式**: 支持细粒度沙箱控制
- **Git 访问**: 自动添加 `.git` 目录访问权限
- **Stdin 提示词**: 通过 `-- -` 从 stdin 读取提示词

## 相关文档

- [MCP 配置](./02-MCP配置.md)
- [会话管理](./03-会话管理.md)

## 回到上级目录

- [Codex 提供商](../04-提供商接入.md)