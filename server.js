const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

const WIKI_DIR = path.join(__dirname, '个人知识库');
const PORT = 3000;

// MIME 类型映射
const MIME_TYPES = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.md': 'text/markdown',
    '.txt': 'text/plain'
};

// 递归扫描目录结构
function scanDirectory(dir, baseDir = WIKI_DIR) {
    const items = [];
    const files = fs.readdirSync(dir);

    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        const relativePath = path.relative(baseDir, fullPath).replace(/\\/g, '/');

        if (stat.isDirectory()) {
            // 递归扫描子目录
            const children = scanDirectory(fullPath, baseDir);
            if (children.length > 0) {
                items.push({
                    name: file,
                    type: 'directory',
                    path: relativePath,
                    children: children
                });
            }
        } else if (file.endsWith('.md')) {
            // Markdown 文件
            items.push({
                name: file.replace('.md', ''),
                type: 'file',
                path: relativePath,
                fullPath: fullPath.replace(/\\/g, '/')
            });
        }
    }

    // 按名称排序，目录在前
    items.sort((a, b) => {
        if (a.type === b.type) {
            return a.name.localeCompare(b.name);
        }
        return a.type === 'directory' ? -1 : 1;
    });

    return items;
}

// 解析 Markdown 链接，转换为相对路径
function resolveMarkdownLinks(content, currentFilePath) {
    // 解析当前文件目录
    const currentDir = path.dirname(currentFilePath);

    // 匹配 Markdown 链接: [text](./path.md)、[text](../path.md) 等相对路径
    return content.replace(/\[([^\]]+)\]\((\.\/[^)]+|\.\.\/[^)]+)\)/g, (match, text, linkPath) => {
        // 处理 .md 扩展名
        let resolvedPath = linkPath;
        if (!linkPath.endsWith('.md')) {
            resolvedPath += '.md';
        }

        // 解析相对路径
        const fullPath = path.resolve(currentDir, resolvedPath);
        const relativePath = path.relative(WIKI_DIR, fullPath).replace(/\\/g, '/');

        // 返回修改后的链接 - 使用未编码的路径，让前端自行处理
        return `[${text}](?file=${relativePath})`;
    });
}

// 安全获取文件路径
function getSafePath(filePath) {
    const fullPath = path.join(WIKI_DIR, filePath);
    const resolvedPath = path.resolve(fullPath);
    const resolvedWikiDir = path.resolve(WIKI_DIR);

    if (!resolvedPath.startsWith(resolvedWikiDir)) {
        return null;
    }

    return fullPath;
}

// 解析请求体
function parseBody(req) {
    return new Promise((resolve, reject) => {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            try {
                resolve(JSON.parse(body));
            } catch (e) {
                resolve({});
            }
        });
        req.on('error', reject);
    });
}

// 创建服务器
const server = http.createServer(async (req, res) => {
    const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
    const pathname = parsedUrl.pathname;
    const method = req.method;

    // 设置 CORS 头
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // 处理 OPTIONS 请求
    if (method === 'OPTIONS') {
        res.statusCode = 200;
        res.end();
        return;
    }

    // API 路由：获取目录结构
    if (pathname === '/api/wiki/tree' && method === 'GET') {
        try {
            const tree = scanDirectory(WIKI_DIR);
            res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify({ tree }));
        } catch (error) {
            console.error('Error scanning directory:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Failed to scan directory' }));
        }
        return;
    }

    // API 路由：读取文件
    if (pathname === '/api/wiki/read' && method === 'GET') {
        const filePath = parsedUrl.searchParams.get('file');

        if (!filePath) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'File parameter is required' }));
            return;
        }

        // URL 解码路径
        const decodedPath = decodeURIComponent(filePath);
        const fullPath = getSafePath(decodedPath);
        if (!fullPath) {
            res.writeHead(403, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Access denied' }));
            return;
        }

        // 检查文件是否存在
        if (!fs.existsSync(fullPath)) {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'File not found: ' + decodedPath }));
            return;
        }

        // 读取文件
        fs.readFile(fullPath, 'utf8', (err, data) => {
            if (err) {
                console.error('Error reading file:', err);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Failed to read file' }));
                return;
            }

            // 解析 Markdown 链接
            const processedContent = resolveMarkdownLinks(data, decodedPath);

            res.writeHead(200, { 'Content-Type': 'text/markdown; charset=utf-8' });
            res.end(processedContent);
        });
        return;
    }

    // API 路由：创建文件/目录
    if (pathname === '/api/wiki/create' && method === 'POST') {
        try {
            const body = await parseBody(req);
            const { type, path: itemPath, content = '', parentDir = '' } = body;

            if (!type || !itemPath) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Type and path are required' }));
                return;
            }

            // 确保文件名有 .md 扩展名
            let finalItemPath = itemPath;
            if (type === 'file' && !finalItemPath.endsWith('.md')) {
                finalItemPath += '.md';
            }

            const targetPath = parentDir ? path.join(parentDir, finalItemPath) : finalItemPath;
            const fullPath = getSafePath(targetPath);

            if (!fullPath) {
                res.writeHead(403, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Access denied' }));
                return;
            }

            if (fs.existsSync(fullPath)) {
                res.writeHead(409, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Item already exists' }));
                return;
            }

            if (type === 'directory') {
                fs.mkdirSync(fullPath, { recursive: true });
            } else if (type === 'file') {
                // 确保父目录存在
                const parentPath = path.dirname(fullPath);
                if (!fs.existsSync(parentPath)) {
                    fs.mkdirSync(parentPath, { recursive: true });
                }
                fs.writeFileSync(fullPath, content, 'utf8');
            }

            const resultPath = targetPath.replace(/\\/g, '/');
            res.writeHead(201, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify({ success: true, path: resultPath }));
        } catch (error) {
            console.error('Error creating item:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: error.message }));
        }
        return;
    }

    // API 路由：更新文件
    if (pathname === '/api/wiki/update' && method === 'PUT') {
        try {
            const body = await parseBody(req);
            const { file: filePath, content } = body;

            if (!filePath || content === undefined) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'File path and content are required' }));
                return;
            }

            const fullPath = getSafePath(filePath);
            if (!fullPath) {
                res.writeHead(403, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Access denied' }));
                return;
            }

            if (!fs.existsSync(fullPath)) {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'File not found' }));
                return;
            }

            fs.writeFileSync(fullPath, content, 'utf8');

            res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify({ success: true }));
        } catch (error) {
            console.error('Error updating file:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: error.message }));
        }
        return;
    }

    // API 路由：删除文件/目录
    if (pathname === '/api/wiki/delete' && method === 'DELETE') {
        try {
            const body = await parseBody(req);
            const { file: filePath } = body;

            if (!filePath) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'File path is required' }));
                return;
            }

            const fullPath = getSafePath(filePath);
            if (!fullPath) {
                res.writeHead(403, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Access denied' }));
                return;
            }

            if (!fs.existsSync(fullPath)) {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'File not found' }));
                return;
            }

            const stat = fs.statSync(fullPath);
            if (stat.isDirectory()) {
                fs.rmSync(fullPath, { recursive: true, force: true });
            } else {
                fs.unlinkSync(fullPath);
            }

            res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify({ success: true }));
        } catch (error) {
            console.error('Error deleting item:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: error.message }));
        }
        return;
    }

    // API 路由：重命名文件/目录
    if (pathname === '/api/wiki/rename' && method === 'PUT') {
        try {
            const body = await parseBody(req);
            const { oldPath, newPath } = body;

            if (!oldPath || !newPath) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Old path and new path are required' }));
                return;
            }

            const fullOldPath = getSafePath(oldPath);
            const fullNewPath = getSafePath(newPath);

            if (!fullOldPath || !fullNewPath) {
                res.writeHead(403, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Access denied' }));
                return;
            }

            if (!fs.existsSync(fullOldPath)) {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Source not found' }));
                return;
            }

            if (fs.existsSync(fullNewPath)) {
                res.writeHead(409, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Target already exists' }));
                return;
            }

            fs.renameSync(fullOldPath, fullNewPath);

            res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify({ success: true }));
        } catch (error) {
            console.error('Error renaming item:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: error.message }));
        }
        return;
    }

    // 静态文件服务
    if (pathname === '/' || pathname === '/index.html') {
        const indexPath = path.join(WIKI_DIR, 'index.html');

        if (fs.existsSync(indexPath)) {
            fs.readFile(indexPath, 'utf8', (err, data) => {
                if (err) {
                    res.writeHead(500, { 'Content-Type': 'text/plain' });
                    res.end('Server Error');
                    return;
                }

                res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
                res.end(data);
            });
        } else {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('index.html not found');
        }
        return;
    }

    // 404
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
});

// 启动服务器
server.listen(PORT, () => {
    console.log('Clowder AI Wiki 服务器已启动:');
    console.log(`- 本地访问: http://localhost:${PORT}`);
    console.log(`- Wiki 目录: ${WIKI_DIR}`);
    console.log('');
    console.log('按 Ctrl+C 停止服务器');
});

// 错误处理
server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
        console.error(`端口 ${PORT} 已被占用，请尝试其他端口`);
    } else {
        console.error('服务器错误:', error);
    }
    process.exit(1);
});

// 优雅关闭
process.on('SIGINT', () => {
    console.log('\n正在关闭服务器...');
    server.close(() => {
        console.log('服务器已关闭');
        process.exit(0);
    });
});