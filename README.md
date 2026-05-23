# 🗺️ Map Planner

> **Interactive Systems Visualizer** — Plan, orchestrate, and map out your dev workflows, systems architecture, and project pipelines with gorgeous interactive flowcharts.

![Map Planner](https://img.shields.io/badge/Status-Live-brightgreen?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)
![Node](https://img.shields.io/badge/Node.js-20+-339933?style=flat-square&logo=node.js&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)
![Koa](https://img.shields.io/badge/Koa.js-2.x-33333D?style=flat-square)
![SQLite](https://img.shields.io/badge/SQLite-3-003B57?style=flat-square&logo=sqlite&logoColor=white)

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Features](#-features)
- [Flowchart Symbols](#-flowchart-symbols)
- [Getting Started](#-getting-started)
- [Development Mode](#-development-mode)
- [Production Mode](#-production-mode)
- [API Reference](#-api-reference)
- [Database Schema](#-database-schema)
- [Usage Guide](#-usage-guide)

---

## 🌟 Overview

**Map Planner** is a monolithic full-stack web application that lets users create visual project planning workspaces. Each project gets its own interactive flowchart canvas where steps, processes, cloud services, and deployments can be mapped out visually using drag-and-drop symbols connected by animated Bezier lines.

The app ships with a **pre-populate button** that instantly generates the classic 5-step DevOps pipeline:

```
Code Encryption → Push to GitHub → Pull in AWS → Instance Installation → Hosting
```

All maps are persisted to a local **SQLite database** — no cloud storage, no auth, no fuss.

---

## 🛠️ Tech Stack

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| **React** | 18.x | UI component framework |
| **Vite** | 5.x | Lightning-fast dev server & bundler |
| **Lucide React** | 0.378+ | Premium SVG icon library |
| **Canvas Confetti** | 1.9.x | Confetti celebration on save |
| **Inter / Outfit** | Google Fonts | Premium typography |
| **Vanilla CSS** | — | Custom glassmorphism design system |

### Backend
| Technology | Version | Purpose |
|---|---|---|
| **Koa.js** | 2.x | Lightweight, async-first web server |
| **@koa/router** | 12.x | Modular route mounting |
| **@koa/cors** | 5.x | Cross-Origin Resource Sharing |
| **koa-bodyparser** | 4.x | JSON request body parsing |
| **koa-static** | 5.x | Static file serving (production) |
| **sqlite3** | 5.x | Native SQLite driver |
| **sqlite** | 5.x | Promise-based SQLite wrapper |
| **Nodemon** | 3.x | Hot-reloading in development |

### Tooling
| Technology | Purpose |
|---|---|
| **concurrently** | Run frontend + backend together in dev |
| **cross-env** | Cross-platform environment variable setting |
| **ESModules** | Modern `import/export` syntax throughout |

---

## 📁 Project Structure

```
Map-Planner/
│
├── package.json                  ← Root scripts (dev, build, start)
│
├── backend/
│   ├── package.json              ← Koa dependencies
│   ├── server.js                 ← 🚀 Main Koa server entry point
│   ├── db.js                     ← SQLite connection & schema init
│   ├── database.db               ← SQLite database file (auto-generated)
│   └── subservers/
│       ├── InitialPage.js        ← Dashboard API routes (/api/projects)
│       └── MapPage.js            ← Flowchart API routes (/api/projects/:id/map)
│
└── frontend/
    ├── package.json              ← Vite + React dependencies
    ├── vite.config.js            ← Vite config with dev proxy to Koa
    ├── index.html                ← HTML entry with Google Fonts
    └── src/
        ├── main.jsx              ← React DOM mount
        ├── App.jsx               ← Root component with page routing
        ├── index.css             ← Global design system & glassmorphism styles
        ├── components/
        │   ├── FlowchartCanvas.jsx   ← 🎨 Core interactive canvas engine
        │   └── SymbolSidebar.jsx     ← Drag-and-drop symbols palette
        └── pages/
            ├── InitialPage.jsx   ← Dashboard: create/list/delete projects
            └── MapPage.jsx       ← Map editor: toolbar, canvas, save/load
```

---

## ✨ Features

### 🏠 Dashboard (`InitialPage`)
- **Create Projects** via an animated slide-up glassmorphic modal
- **Project Cards** grid with color-coded borders, creation dates, and descriptions
- **Delete Projects** with cascade deletion of all associated flowchart data
- **Empty State** with an elegant call-to-action

### 🗺️ Map Editor (`MapPage`)
- **Drag & Drop** symbol templates from the sidebar onto the infinite canvas
- **Move Nodes** freely anywhere on the dot-grid canvas
- **Connect Nodes** by dragging from anchor ports (top / bottom / left / right) to other nodes
- **Bezier Curves** — smooth, animated connector lines between symbols
- **Click Connection to Delete** — click any connector line to remove it
- **Double-Click to Edit** — rename any node inline with a focused dark input
- **Delete Nodes** — select a node and click the ❌ button
- **Pre-populate Example** — one-click spawns the complete 5-step DevOps workflow
- **Clear Canvas** — wipe all nodes and connectors
- **Save to SQLite** — persists your entire map (nodes + connections) to the database
- **Confetti on Save** — a multi-color confetti burst triggers on successful save 🎉
- **Persistent Loading** — maps reload exactly as they were saved on revisit

### 🎨 Design System
- Deep space dark theme (`#0b0f19` base)
- Glassmorphism panels with `backdrop-filter: blur(16px)`
- Neon glowing color palette: Cyan, Purple, Amber, Blue, Emerald, Rose
- Premium typography: **Outfit** (headings) + **Inter** (body)
- Smooth CSS micro-animations and hover transitions
- Custom dot-grid canvas background
- Custom styled scrollbars

---

## 🔷 Flowchart Symbols

| Symbol | Shape | Color | Best Used For |
|---|---|---|---|
| **Start / End** | Pill (rounded) | 🔵 Cyan | Project start and termination points |
| **Process Block** | Rectangle | 🟣 Purple | Coding steps, scripts, builds |
| **Decision Point** | Diamond | 🟡 Amber | Conditions, branching logic |
| **DB / Storage** | Rounded Rectangle | 💙 Blue | Databases, storage layers |
| **Cloud / Server** | Cloud-top shape | 🟢 Emerald | AWS, APIs, GitHub repos |
| **Hosting / Web** | Rectangle | 🌸 Rose | Hosting platforms, live web apps |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18 or higher
- **npm** v9 or higher

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/yourusername/Map-Planner.git
cd Map-Planner

# 2. Install all dependencies (root + backend + frontend)
npm run install:all
```

---

## 💻 Development Mode

In development, **Vite** runs on port `3000` with hot-module replacement, and **Koa** runs on port `5000` as the API server. Vite proxies all `/api/*` requests to Koa automatically.

```bash
npm run dev
```

| Service | URL |
|---|---|
| Frontend (Vite HMR) | http://localhost:3000 |
| Backend API (Koa) | http://localhost:5000 |

---

## 🏭 Production Mode

In production, the React app is compiled into a static bundle and served directly by the Koa server — a single monolithic process on one port.

```bash
# Build frontend + start Koa server
npm run production

# OR step-by-step:
npm run build:frontend  # Compiles React to frontend/dist/
npm start               # Starts Koa on port 3000
```

| Service | URL |
|---|---|
| Full Application (Koa + React) | http://localhost:3000 |
| API Endpoints | http://localhost:3000/api |

---

## 📡 API Reference

### Dashboard Routes — `/api/projects`
> Handled by `backend/subservers/InitialPage.js`

| Method | Endpoint | Description | Body |
|---|---|---|---|
| `GET` | `/api/projects` | List all projects | — |
| `POST` | `/api/projects` | Create a new project | `{ title, description }` |
| `DELETE` | `/api/projects/:id` | Delete project + map data | — |

**Example — Create Project:**
```bash
curl -X POST http://localhost:3000/api/projects \
  -H "Content-Type: application/json" \
  -d '{"title": "My Pipeline", "description": "End-to-end DevOps flow"}'
```

---

### Map Routes — `/api/projects/:id/map`
> Handled by `backend/subservers/MapPage.js`

| Method | Endpoint | Description | Body |
|---|---|---|---|
| `GET` | `/api/projects/:id/map` | Load project details + map elements | — |
| `POST` | `/api/projects/:id/map` | Save nodes and links to SQLite | `{ nodes: [...], links: [...] }` |

**Example — Save Map:**
```bash
curl -X POST http://localhost:3000/api/projects/<project-id>/map \
  -H "Content-Type: application/json" \
  -d '{
    "nodes": [{ "id": "abc", "type": "start", "label": "Code Encryption", "x": 40, "y": 200 }],
    "links": []
  }'
```

---

## 🗄️ Database Schema

SQLite database auto-created at `backend/database.db` on first server start.

### `projects` table
```sql
CREATE TABLE IF NOT EXISTS projects (
  id          TEXT PRIMARY KEY,       -- UUID v4
  title       TEXT NOT NULL,
  description TEXT,
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### `map_elements` table
```sql
CREATE TABLE IF NOT EXISTS map_elements (
  project_id  TEXT PRIMARY KEY,
  nodes       TEXT,                   -- JSON array of node objects
  links       TEXT,                   -- JSON array of connection objects
  FOREIGN KEY(project_id) REFERENCES projects(id) ON DELETE CASCADE
);
```

> Foreign key cascade ensures that deleting a project also removes all its flowchart data.

---

## 📖 Usage Guide

### Creating Your First Plan

1. Open **http://localhost:3000**
2. Click **"Create Project"**
3. Enter a title (e.g. _"Production Deployment Pipeline"_) and description
4. Click **"Create Project"** — you'll be taken straight to the map workspace

### Building a Flowchart

1. **Drag** a symbol from the left sidebar onto the canvas
2. **Double-click** any symbol to rename it inline
3. **Hover** over a node to reveal its 4 connection ports (white circles)
4. **Drag from a port** to another node's port to draw a connector line
5. **Click a connector line** to delete it
6. **Drag nodes** to rearrange your layout freely

### Loading the 5-Step DevOps Example

Click **"Pre-populate Map"** (green button in the toolbar) to instantly generate:

```
[1st: Code Encryption] ──→ [2nd: Code Push in GitHub] ──→ [3rd: Code Pull in AWS]
                                                                        │
                                                                        ▼
                                                        [5th: Hosting Web App!] ←── [4th: Instance Installation]
```

### Saving Your Map

Click **"Save Flowchart"** (purple button) — your entire canvas state is saved to SQLite. A 🎉 confetti burst confirms success!

---

## 📄 License

MIT — free to use, modify, and distribute.

---

> Built with ❤️ using React, Vite, Koa.js, and SQLite.
