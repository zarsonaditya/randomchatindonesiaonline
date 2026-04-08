# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Realtime**: Socket.IO (server + client)

## Artifacts

### RandomChat Indonesia (`artifacts/randomchat`)
- React + Vite frontend at `/`
- Random chat realtime website with login (username, age, gender)
- Pages: LoginPage, WaitingPage, ChatPage
- Socket.IO client integration for realtime messaging
- Blue-purple gradient design

### API Server (`artifacts/api-server`)
- Express 5 backend at `/api`
- Socket.IO server at `/api/socket.io`
- In-memory matchmaking queue (pairs users randomly)
- Real-time: waiting, matched, message, typing, leave events
- REST: GET /api/chat/stats

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.

## Socket.IO Events

### Client → Server
- `join` (profile) — join matchmaking queue
- `message` ({text}) — send chat message
- `typing` (bool) — typing indicator
- `leave_room` — leave current chat room
- `find_new` (profile) — leave and find a new stranger

### Server → Client
- `waiting` — put in waiting queue
- `matched` ({roomId, stranger}) — matched with another user
- `message` ({text, from, timestamp}) — incoming message
- `typing` (bool) — stranger typing state
- `stranger_left` — stranger disconnected or left
