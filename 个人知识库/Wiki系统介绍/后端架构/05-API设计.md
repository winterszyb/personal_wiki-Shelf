# 后端架构 - API 设计

## 接口总览

| 方法 | 路径 | 功能 |
|------|------|------|
| GET | `/api/wiki/tree` | 获取目录树 |
| GET | `/api/wiki/read?file=xxx` | 读取文件 |
| POST | `/api/wiki/create` | 创建文件/目录 |
| PUT | `/api/wiki/update` | 更新文件 |
| DELETE | `/api/wiki/delete` | 删除文件/目录 |
| PUT | `/api/wiki/rename` | 重命名 |

## 详细接口

### 1. 获取目录树

```
GET /api/wiki/tree
```

**响应**：
```json
{
    "tree": [
        {
            "name": "个人知识库",
            "type": "directory",
            "path": "个人知识库",
            "children": [...]
        }
    ]
}
```

### 2. 读取文件

```
GET /api/wiki/read?file=个人知识库/README.md
```

**响应**：Markdown 文本（已处理内部链接）

### 3. 创建文件/目录

```
POST /api/wiki/create
Content-Type: application/json

{
    "type": "file",           // "file" | "directory"
    "path": "新文档.md",       // 文件名
    "parentDir": "个人知识库", // 父目录（空为根目录）
    "content": "# 标题\n\n内容"  // 文件内容（仅文件）
}
```

**响应**：
```json
{
    "success": true,
    "path": "个人知识库/新文档.md"
}
```

### 4. 更新文件

```
PUT /api/wiki/update
Content-Type: application/json

{
    "file": "个人知识库/README.md",
    "content": "# 新内容"
}
```

### 5. 删除文件/目录

```
DELETE /api/wiki/delete
Content-Type: application/json

{
    "file": "个人知识库/旧文档.md"
}
```

### 6. 重命名

```
PUT /api/wiki/rename
Content-Type: application/json

{
    "oldPath": "个人知识库/旧名.md",
    "newPath": "个人知识库/新名.md"
}
```

## 状态码

| 状态码 | 含义 | 场景 |
|--------|------|------|
| 200 | 成功 | 正常响应 |
| 201 | 创建成功 | 文件/目录创建 |
| 400 | 请求参数错误 | 缺少必要参数 |
| 403 | 拒绝访问 | 路径安全检查失败 |
| 404 | 文件不存在 | 文件未找到 |
| 409 | 冲突 | 文件已存在 |
| 500 | 服务器错误 | 内部异常 |

## 相关文档

- [技术选型](./01-技术选型.md)
- [目录扫描器](./02-目录扫描器.md)

## 回到上级目录

- [Wiki 系统介绍总目录](../总目录.md)