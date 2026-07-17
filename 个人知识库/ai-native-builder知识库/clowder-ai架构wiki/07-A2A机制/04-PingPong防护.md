# A2A Ping-Pong 防护

## 问题场景

防止两个 Cat 之间无意义的来回 @mention：

```
A: "请 @B 检查"
B: "我觉得 @A 需要重新考虑"
A: "还是请 @B 给出意见"  
B: "等待 @A 的反馈"
  → 无限循环，没有实质性进展
```

## 追踪机制

### StreakPair 数据结构
```typescript
interface StreakPair {
  from: CatId;
  to: CatId;
  count: number;  // 往复次数
}
```

### 阈值设置
```typescript
const PINGPONG_WARN_THRESHOLD = 2;   // 警告阈值
const PINGPONG_BLOCK_THRESHOLD = 4;  // 阻断阈值
```

## 检测流程

### 1. 推送前预测
```typescript
const streak = peekStreakOnPush(worklistEntry, from, to);
// 返回如果推送后的 streak 状态，不修改实际状态
```

### 2. 推送时更新
```typescript
updateStreakOnPush(worklistEntry, from, to);
// 实际修改 streakPair
```

### 3. 阻断逻辑
```typescript
if (streak.count >= PINGPONG_BLOCK_THRESHOLD) {
  return 'block_pingpong';  // 阻断 A2A
}
if (streak.count >= PINGPONG_WARN_THRESHOLD) {
  pingPongWarning = true;   // 发送警告
}
```

## 实质性工作豁免

### 实质性工作定义
1. **实质性工具调用**: 非纯路由工具调用
2. **长文本输出**: >200 字符的内容

### 豁免机制
```typescript
if (hasSubstantiveToolCall || output.length > 200) {
  // 实质性工作，重置 streak 为 1
  streak.count = 1;
} else {
  // 纯语言惯性，streak +1
  streak.count++;
}
```

### 纯路由工具
以下工具不算实质性工作：
- `cat_cafe_post_message`
- `cat_cafe_multi_mention`
- `cat_cafe_hold_ball`

## 用户消息重置

任何用户消息到达时，重置所有 streak：
```typescript
resetStreak(threadId);
// 清除线程的所有工作列表 streakPair
```

## 阻断效果

### 系统消息
当触发阻断时：
```typescript
emitSystemInfo('a2a_pingpong_terminated', {
  message: 'A2A 链已因 ping-pong 阻断',
  streakPair: { from, to, count }
});
```

### 用户界面
- 显示 ping-pong 终止提示
- 建议用户介入或调整策略

## 相关文档

- [路由系统](./01-路由系统.md)
- [工作列表](./03-工作列表.md)

## 回到上级目录

- [总目录](../总目录.md)