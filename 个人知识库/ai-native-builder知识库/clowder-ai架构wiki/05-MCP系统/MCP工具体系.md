# MCP 工具体系

## 整体架构

```
Agent CLI 子进程
  └─ MCP Server (stdio 子进程)
       ├─ 本地 Fetch 工具 → 直接调 API (search/read)
       ├─ 回调 Post 工具 → HTTP 回调 API (write/collab)
       ├─ 文件系统工具 → 直接读写文件
       └─ 音频服务工具 → Python 音频服务
```

MCP Server 作为 stdio 子进程与 Agent CLI 并行运行，通过 `@modelcontextprotocol/sdk` 通信。

## 工具集分类

### 1. Collab（协作工具集）— 回调认证写入
- 消息投递：`post_message`, `cross_post_message`, `multi_mention`
- 线程操作：`get_thread_context`, `list_threads`, `get_message`
- 任务管理：`list_tasks`, `create_task`, `update_task`
- 富块创建：`create_rich_block`

### 2. Memory（记忆工具集）— 读取/搜索
- 搜索：`search_evidence`, `graph_resolve`, `list_recent`
- 文件操作：`read_file`, `write_file`, `list_files`
- 会话历史：`list_session_chain`, `read_session_events`

### 3. Signals（信号工具集）
- 信号文章：`signal_list_inbox`, `signal_get_article`, `signal_search`
- 深度研读：`signal_start_study`, `signal_save_notes`

### 4. Finance（金融工具集）
- `finance_query`: 通过天天基金/FRED 查询金融数据

### 5. Audio（音频工具集）
- 音频源：`audio_list_sources`, `audio_read_transcript`
- 录制控制：`audio_capture_start`, `audio_capture_stop`

### 6. Limb（设备控制工具集）
- 设备发现：`limb_list_available`, `limb_list_tools`
- 设备控制：`limb_invoke_tool`, `limb_pair_approve`

## 相关文档

- [MCP 调用流程](./MCP调用流程.md)
- [MCP 认证机制](./MCP认证机制.md)

## 回到上级目录

- [总目录](../总目录.md)