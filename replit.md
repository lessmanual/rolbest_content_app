# Overview

This project is a content management dashboard that interfaces with Google Sheets as its primary data source. The application allows users to review, edit, and publish blog posts and social media content. The system is designed as a full-stack web application with a React frontend and Express.js backend, featuring real-time content editing capabilities and webhook integration for publishing workflows.

The application follows a post-review workflow where content with "DO_SPRAWDZENIA" (to review) status can be edited and then published via webhook triggers. It maintains a history of published content and provides a clean interface for managing blog posts, Facebook content, and Instagram content with associated images.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety and modern development practices
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management and caching
- **UI Framework**: Shadcn/ui components built on Radix UI primitives for accessible, customizable components
- **Styling**: Tailwind CSS with CSS variables for theming and responsive design
- **Build Tool**: Vite for fast development and optimized production builds

## Backend Architecture
- **Runtime**: Node.js with TypeScript for server-side development
- **Framework**: Express.js for REST API endpoints and middleware handling
- **Database Layer**: Dual storage approach with Google Sheets as primary data source and in-memory fallback storage
- **Schema Validation**: Zod for runtime type checking and API request validation
- **Database ORM**: Drizzle ORM configured for PostgreSQL (ready for future database integration)

## Data Storage Solutions
- **Primary Storage**: Google Sheets API integration for content management
- **Fallback Storage**: In-memory storage implementation for development and offline scenarios
- **Future Database**: PostgreSQL configured via Drizzle ORM for potential migration from Google Sheets
- **Session Management**: Connect-pg-simple for PostgreSQL-based session storage

## Authentication and Authorization
- **Google Sheets Authentication**: Service account credentials via environment variables
- **API Security**: Basic request validation and error handling middleware
- **Environment-based Configuration**: Secrets management through environment variables

## External Dependencies
- **Google Sheets API**: Primary data source using googleapis library with service account authentication
- **Neon Database**: PostgreSQL hosting service configured for future database needs
- **Make.com Webhook**: External automation platform for publishing workflows
- **React Query**: Client-side caching and synchronization with server state
- **Radix UI**: Accessible component primitives for consistent user interface
- **Tailwind CSS**: Utility-first CSS framework for rapid UI development
- **Zod**: Runtime schema validation for type-safe API communication

## API Design
The system exposes four main endpoints:
- `GET /api/post`: Retrieves current post awaiting review
- `POST /api/post/update`: Updates specific content fields
- `POST /api/publish`: Triggers webhook for content publishing
- `GET /api/posts/published`: Returns publication history

## Development Infrastructure
- **Development Server**: Vite development server with HMR and React plugins
- **Error Handling**: Runtime error overlay for development debugging
- **Type Safety**: Full TypeScript coverage across frontend and backend
- **Path Aliases**: Configured import aliases for clean code organization
- **Build Process**: Separate frontend (Vite) and backend (esbuild) build pipelines