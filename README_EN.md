# Shelf

> Lightweight personal knowledge base Wiki system based on Markdown file system, zero database dependency. The name is inspired by the bookshelf — your directory structure is your shelf, each document is a book on it.

[中文](README.md)

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Quick Start](#quick-start)
- [Architecture](#architecture)
- [API Reference](#api-reference)
- [Project Structure](#project-structure)
- [Tech Stack](#tech-stack)
- [Development Journey](#development-journey)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)

## Overview

A lightweight personal knowledge base Wiki system built with a frontend-backend separated architecture. No database required — all content is stored as Markdown files and managed through a web interface.

### Why File System Storage?

- **Zero config**: No database setup, clone and run
- **Git friendly**: Full version control for your knowledge
- **Portable**: Your entire wiki is just a folder
- **Universal**: Any text editor can open Markdown files
- **Easy migration**: Copy the folder to migrate

## Features

### Core Features
- **Hierarchical directory structure**: Unlimited nesting levels
- **Markdown rendering**: Full Markdown support (tables, code blocks, quotes, lists)
- **Syntax highlighting**: Multi-language code highlighting
- **CRUD operations**: Create, Read, Update, Delete documents
- **Internal links**: Navigate between documents via relative paths
- **Visual link insertion**: Graphically select target files in the editor

### UI Features
- **Tree navigation**: Expandable/collapsible directory tree
- **Light/Dark theme**: CSS variables approach, one-click toggle
- **Responsive design**: Desktop and mobile ready
- **Editor toolbar**: Quick Markdown format insertion
- **Context menu**: Right-click to rename/delete

### Technical Features
- **Zero database**: Pure file system storage
- **Zero backend dependencies**: Node.js native modules only
- **Frontend-backend separation**: RESTful API design
- **Security**: Path traversal attack protection

## Quick Start

### Requirements

- Node.js >= 14.x

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/winterszyb/personal_wiki-Shelf.git
cd knowledge-wiki

# 2. Start the server
node server.js

# 3. Open browser
# Visit http://localhost:3000
```

### Change Port

Edit line 7 in `server.js`:

```javascript
const PORT = 3000;  // Change to your desired port
```

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Browser (Frontend)                     │
│  ┌──────────┐  ┌──────────────┐  ┌─────────────────┐   │
│  │ Tree Nav │  │ Markdown View│  │    Editor        │   │
│  └──────────┘  └──────────────┘  └─────────────────┘   │
└───────────────────────┬─────────────────────────────────┘
                        │ HTTP REST API
┌───────────────────────┼─────────────────────────────────┐
│               Node.js Server (Backend)                    │
│  ┌────────────────────────────────────────────────────┐ │
│  │ API Routes                                          │ │
│  │ GET /api/wiki/tree    → Scan directory tree         │ │
│  │ GET /api/wiki/read    → Read file                   │ │
│  │ POST /api/wiki/create → Create file/directory        │ │
│  │ PUT /api/wiki/update  → Update file                 │ │
│  │ DELETE /api/wiki/delete → Delete file/directory      │ │
│  │ PUT /api/wiki/rename  → Rename                      │ │
│  └────────────────────────────────────────────────────┘ │
│                     ↕ File System                        │
│            ┌──────────────────────┐                     │
│            │  Markdown Storage     │                     │
│            │  knowledge-base/      │                     │
│            │    └── topics/        │                     │
│            │          └── *.md     │                     │
│            └──────────────────────┘                     │
└─────────────────────────────────────────────────────────┘
```

## API Reference

| Method | Path | Body | Description |
|--------|------|------|-------------|
| GET | `/api/wiki/tree` | - | Get full directory tree |
| GET | `/api/wiki/read?file={path}` | - | Read file content |
| POST | `/api/wiki/create` | `{type, path, parentDir, content}` | Create file/directory |
| PUT | `/api/wiki/update` | `{file, content}` | Update file content |
| DELETE | `/api/wiki/delete` | `{file}` | Delete file/directory |
| PUT | `/api/wiki/rename` | `{oldPath, newPath}` | Rename |

### Get Directory Tree

```
GET /api/wiki/tree
```

Response:
```json
{
  "tree": [
    {
      "name": "knowledge-base",
      "type": "directory",
      "path": "knowledge-base",
      "children": [...]
    }
  ]
}
```

### Create File

```
POST /api/wiki/create
Content-Type: application/json

{
  "type": "file",
  "path": "new-doc.md",
  "parentDir": "knowledge-base",
  "content": "# Title\n\nContent..."
}
```

### Update File

```
PUT /api/wiki/update
Content-Type: application/json

{
  "file": "knowledge-base/doc.md",
  "content": "# New Content"
}
```

## Project Structure

```
knowledge-wiki/
├── README.md            # Project description (Chinese)
├── README_EN.md         # Project description (English)
├── server.js            # Node.js server (core)
├── index.html           # Frontend interface (core)
├── package.json         # Project config
├── LICENSE              # License
├── .gitignore           # Git ignore rules
└── 知识库/              # Sample knowledge base content
    ├── README.md
    └── ...
```

## Tech Stack

| Layer | Technology | Notes |
|-------|-----------|-------|
| **Frontend** | Vanilla HTML/CSS/JS | No framework, runs in browser |
| | Marked.js (CDN) | Markdown parsing & rendering |
| | Highlight.js (CDN) | Code syntax highlighting |
| **Backend** | Node.js | Runtime |
| | http module | HTTP server (zero deps) |
| | fs module | File system operations |
| | path module | Path handling |
| **Storage** | File System | Markdown files |

## Development Journey

The project went through 8 development phases:

1. **Foundation**: Server + frontend + Markdown rendering + code highlighting
2. **Hierarchy**: Recursive tree navigation + expand/collapse + icon system
3. **Content Management**: CRUD operations + auto directory positioning
4. **Internal Links**: Link conversion + visual insertion + relative path calculation
5. **Editor Enhancement**: Toolbar + quick insert + save & preview
6. **Theme System**: CSS variables + light/dark toggle + persistence
7. **Polish**: Context menu + keyboard shortcuts + responsive design
8. **Documentation**: Multi-level docs + API docs + issue tracking

## Roadmap

- [ ] Full-text search
- [ ] Image upload support
- [ ] Split-pane live preview
- [ ] Export to PDF / HTML
- [ ] Tag categorization system
- [ ] Git-integrated version history
- [ ] TypeScript migration
- [ ] Unit test coverage

## Contributing

Issues and Pull Requests are welcome!

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Create a Pull Request

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.

---

## Knowledge Base Content

This repository includes the following sample knowledge base content:

- **Clowder AI Architecture Wiki**: Multi-agent collaboration platform technical documentation
- **Wiki System Introduction**: The system's own architecture design and implementation docs

You can freely organize your own content under the `知识库/` directory.

---

<p align="center">
  <sub>Built with ❤️ by <a href="https://github.com/winterszyb">winterszyb</a></sub>
</p>