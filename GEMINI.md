
# Gemini Project Overview: ChickAPI

## Project Summary

ChickAPI is a visual API flow designer for creating, testing, and managing API workflows. It features a node-based interface built with ReactFlow, allowing users to construct complex API interactions visually. The application can be run as a standalone desktop application using Electron or as a web application powered by Next.js. The core logic is written in TypeScript and includes features like a workflow executor, API discovery, and environment management.

## Key Technologies

- **Frontend:** React, Next.js, ReactFlow, Tailwind CSS
- **Backend (Web):** Next.js API Routes
- **Desktop:** Electron
- **Language:** TypeScript
- **Database:** MongoDB (with Prisma as an ORM)
- **Linting:** ESLint
- **Testing:** Jest

## Core Directories

- `app/`: Contains the Next.js web application, including pages and API routes.
- `src/`: Contains the source code for the Electron application.
- `lib/`: Houses the core application logic, shared between the web and desktop versions. This includes:
    - `lib/discovery/`: API discovery and analysis tools.
    - `lib/node-palette/`: Defines the available nodes for the visual editor.
    - `lib/WorkflowExecutor.ts`: The engine for running the visual workflows.
- `components/`: Shared React components used in the Next.js application.
- `prisma/`: Prisma schema and database-related files.

## Important Commands

- `npm install`: Install dependencies.
- `npm run dev`: Run the Electron app in development mode.
- `npm run dev:next`: Run the Next.js web app in development mode.
- `npm run build`: Build the Electron app.
- `npm run build:next`: Build the Next.js web app.
- `npm test`: Run tests with Jest.
- `npm run lint`: Lint the codebase with ESLint.

## File Overview

- `app/page.tsx`: The main entry point for the Next.js application's UI.
- `app/api/discovery/jobs/route.ts`: API route for managing discovery jobs.
- `lib/WorkflowExecutor.ts`: Contains the logic for executing the workflows created in the visual editor.
- `lib/discovery/DiscoveryOrchestrator.ts`: Manages the API discovery process.
- `components/reactflow/ReactFlowCanvas.tsx`: The main component for the visual workflow canvas.
- `prisma/schema.prisma`: The database schema for the application.
