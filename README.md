# Multihub

**DeepWiki Page:** [https://deepwiki.com/quyenpq2904/multihub](https://deepwiki.com/quyenpq2904/multihub)

## Overview

Multihub is a real-time messaging web application built with **Next.js 16** that enables users to create conversations, send messages, and manage group chats. The platform is designed for responsiveness and global accessibility, supporting multiple languages (English and Vietnamese).

It combines:

- **REST APIs** for historical data retrieval (conversations, messages, user profiles).
- **WebSocket (Socket.IO)** for real-time bi-directional events (new messages, typing indicators).

The application is a client-side heavy web app where UI logic, state management, and real-time handling live in the browser, communicating with a separate backend API server for persistence and routing.

## Key Capabilities

- **Real-time Messaging**: Instant delivery of messages using Socket.IO.
- **Internationalization (i18n)**: Full support for English (`/en/...`) and Vietnamese (`/vi/...`) via `next-intl`.
- **Theme Support**: Built-in dark and light mode switching using `next-themes`.
- **Type Safety**: End-to-end type safety with TypeScript for API requests, responses, and internal state.
- **Hybrid Data Fetching**: Optimizes performance by using React Query for initial data loads and Sockets for live updates.

## Technology Stack

The project depends on a robust set of modern web technologies:

- **Core Framework**: [Next.js](https://nextjs.org/) (React)
- **State Management & Data Fetching**: [`@tanstack/react-query`](https://tanstack.com/query/latest)
- **Real-Time Communication**: `socket.io-client`
- **Internationalization**: `next-intl`
- **UI & Styling**: [`@heroui/react`](https://heroui.com/), `framer-motion` (animations), `tailwind` (via Next.js default)
- **Forms & Validation**: `react-hook-form`, `zod`
- **HTTP Client**: `axios`
- **Utilities**: `use-debounce`, `@iconify/react`

## Architecture

### Application Structure

The application uses a **Provider-based Global State** pattern. The root layout (`app/[locale]/layout.tsx`) nests several context providers:

1.  **QueryProvider**: Wraps the app with the React Query client.
2.  **ThemeProvider**: Manages UI theme (light/dark).
3.  **NextIntlClientProvider**: Provides translation contexts.
4.  **SocketProvider**: Manages the WebSocket connection.
5.  **AuthProvider**: Handles user authentication and sessions.

### Request Flow

- **Data Loading**: Uses REST APIs called via `axios` and managed by `react-query` to fetch initial conversation lists and messages.
- **Real-Time Updates**: Listens for Socket.IO events to push new messages to the UI without refreshing.

### Routing

All routes are namespaced under a `[locale]` dynamic segment (e.g., `/en/messenger`, `/vi/sign-in`). Changing the language automatically updates the URL and re-renders the application with new translation resources.

## Development Workflow

### Prerequisites

- Node.js (LTS recommended)
- Package manager (`npm`, `yarn`, `pnpm`, or `bun`)
- A running instance of the Multihub Backend API (usually on `http://localhost:3000` or defined in `.env`)

### Installation

```bash
npm install
# or
yarn install
# or
pnpm install
```

### Running Locally

Start the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) (or your configured port) with your browser to see the result.

### Build & Lint

- **Lint**: `npm run lint` - Runs ESLint.
- **Build**: `npm run build` - Compiles the production application.
- **Start**: `npm run start` - Serves the production build.

## Configuration

The project uses `next.config.ts` configured with the `withNextIntl()` plugin wrapper to handle internationalized routing seamlessly.
