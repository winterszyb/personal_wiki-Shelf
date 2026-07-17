# Ball Custody

## 基本概念

Ball Custody 是"球权持有"机制，控制 Cat 何时发言、何时等待。类似于会议中的"发言权"。

## Hold Ball 模式

### 触发条件
当 Agent 表示"我先调研一下，有结果了回来汇报"时：
```
cat_cafe_hold_ball
  → 注册 scheduled reminder（hold-ball- 前缀）
  → 或注册条件探针（如 "GitHub Issue #42 关闭时唤醒我"）
  → 探针满足 → BallCustodyWakeSender
    → 投递 "[定时任务] 条件探针已满足"
    → invokeTrigger.trigger() 唤醒
```

### 限制
- **每个 (thread, cat) 对**: 3.6 秒内最多 3 次 hold
- **目的**: 防止滥用 hold ball 功能

## 探针唤醒

### 探针类型
1. **定时探针**: 固定时间后唤醒
2. **条件探针**: 满足特定条件后唤醒
3. **外部探针**: 外部事件触发唤醒

### 探针条件
- GitHub Issue 状态变更
- 管理命令完成
- 外部服务状态变更
- 文件系统变更

## Ball Custody Wake Sender

### 触发流程
```
探针条件满足
  → BallCustodyWakeSender 检测
  → 投递系统消息 "[定时任务] 条件探针已满足"
  → invokeTrigger.trigger() 唤醒 Cat
  → Cat 继续之前的任务
```

### 消息格式
```
[定时任务] 条件探针已满足
探针: <探针描述>
触发时间: <timestamp>
```

## 状态管理

### Ball 状态
- `in_progress`: 球权持有中
- `completed`: 球权释放
- `needs_handoff`: 需要交接球权
- `needs_owner`: 需要新的球权持有者

### 持有时间
- **默认**: 无限制（直到显式释放）
- **定时**: 按照探针设置的时间
- **条件**: 直到满足条件

## 应用场景

### 1. 异步调研
- "我先调研一下这个问题，有结果了回来汇报"
- Hold ball，调研完成后自动唤醒

### 2. 外部依赖等待
- "等 CI 通过后再继续"
- 等待 CI 状态变更后自动唤醒

### 3. 分段任务执行
- 先完成第一部分，稍后继续第二部分
- Hold ball，分时段完成复杂任务

## 相关文档

- [定时任务触发](./01-定时任务.md)
- [事件驱动触发](./02-事件驱动.md)

## 回到上级目录

- [AI 主动发言](../06-AI主动发言.md)