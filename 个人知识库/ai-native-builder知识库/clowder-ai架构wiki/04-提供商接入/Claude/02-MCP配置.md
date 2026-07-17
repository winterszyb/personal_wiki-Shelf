# Claude MCP 配置

## MCP 配置方式

Claude 通过 `--mcp-config <json>` 传入 MCP 配置，支持：

### 配置来源
- **capabilities.json**: 项目级别优先，然后全局回退
- **项目 .mcp.json**: 与 capabilities.json 合并（非托管服务器）
- **Pencil 解析器**: 通过 `resolvePencilCommand()` 解析
- **streamableHttp**: URL 和可选头信息

### 配置注入
- **内置 cat-cafe 分入口点**: 从 `distDir` 解析
- **外部命令**: 命令 + 参数 + 环境变量

### Windows 兼容性
- 内联 JSON 被替换为临时文件路径（规避 Windows JSON 被当作文件路径的 bug）
- 使用 `--strict-mcp-config` 确保只启用声明的服务器

## 关键参数

```javascript
{
  "mcpServers": {
    "cat-cafe-mcp": {
      "command": "node",
      "args": ["path/to/mcp-server.js"],
      "env": {
        "CAT_CAFE_API_URL": "http://...",
        "CAT_CAFE_INVOCATION_ID": "xxx",
        "CAT_CAFE_CALLBACK_TOKEN": "yyy"
      }
    }
  }
}
```

## 相关文档

- [CLI 接入](./01-CLI接入.md)
- [会话管理](./03-会话管理.md)

## 回到上级目录

- [Claude 提供商](../../04-提供商接入.md)