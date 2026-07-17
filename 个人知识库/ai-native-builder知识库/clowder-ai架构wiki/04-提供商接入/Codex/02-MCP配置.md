# Codex MCP 配置

## MCP 配置方式

Codex 通过 TOML 格式的 `--config` 参数传入 MCP 配置：

```bash
--config mcp_servers.<name>.command=<command>
--config mcp_servers.<name>.args=["arg1","arg2"]
--config mcp_servers.<name>.env.KEY=value
--config mcp_servers.<name>.default_tools_approval_mode="approve"
```

## 配置特点

### 显式启用/禁用
所有服务器显式声明 `enabled=true` 或 `enabled=false`，防止 `.codex/config.toml` 残留配置复活。

### 内置服务器
```javascript
{
  "command": "node",
  "args": ["path/to/mcp-server.js"],
  "default_tools_approval_mode": "approve",
  "enabled": true
}
```

### 环境变量注入
工作目录和回调环境键通过 `env.*` 配置键注入：
```javascript
{
  "env": {
    "CAT_CAFE_API_URL": "http://...",
    "CAT_CAFE_INVOCATION_ID": "xxx"
  }
}
```

### 复杂环境变量处理
对于需要复杂环境变量的服务器，生成 `mcp-env-wrapper.mjs` 包装脚本：
```javascript
// Codex 不支持完整的环境变量覆盖
// 通过包装脚本实现复杂环境变量设置
const spawn = require('child_process').spawn;
spawn('node', ['real-mcp-server.js'], {
  env: { ...process.env, CUSTOM_VAR: 'value' }
});
```

### StreamableHttp 认证
使用 `bearer_token_env_var` 进行认证：
```javascript
{
  "bearer_token_env_var": "CLOWDER_MCP_BEARER_<NAME>_<HASH>"
}
```

## 相关文档

- [CLI 接入](./01-CLI接入.md)
- [会话管理](./03-会话管理.md)

## 回到上级目录

- [Codex 提供商](../../04-提供商接入.md)