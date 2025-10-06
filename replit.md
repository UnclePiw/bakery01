# Bakery Management Dashboard

## Overview

This is a comprehensive bakery management system designed for real-time inventory tracking, production planning, and demand forecasting. The application serves bakery staff with an intuitive dashboard for managing ingredients, monitoring product stock, conducting hourly checks, and importing AI-generated demand forecasts. Built with a modern tech stack, it emphasizes operational efficiency with Thai language support and mobile-first design for bakery floor usage.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build System**
- React 18 with TypeScript for type-safe component development
- Vite as the build tool and dev server for fast HMR and optimized production builds
- Wouter for lightweight client-side routing

**UI Component System**
- Radix UI primitives for accessible, unstyled components
- shadcn/ui component library (New York style variant) with Material Design 3 influences
- Tailwind CSS for utility-first styling with custom design tokens
- CSS variables for theming with light/dark mode support

**State Management & Data Fetching**
- TanStack Query (React Query) for server state management, caching, and real-time updates
- WebSocket (Socket.IO) integration for live stock updates and notifications
- Local state with React hooks for UI-specific state

**Design System**
- Enterprise dashboard optimized for data-dense displays
- Custom color palette with HSL variables for semantic colors (success, warning, critical)
- Thai language typography using 'Noto Sans Thai' and 'Inter' fonts
- Monospace 'JetBrains Mono' for numerical data display
- Touch-optimized controls for tablet/mobile use in bakery environments

### Backend Architecture

**Server Framework**
- Express.js with TypeScript for REST API endpoints
- HTTP server with Socket.IO for real-time bidirectional communication
- Middleware for request logging, JSON parsing, and error handling

**API Design Pattern**
- RESTful endpoints organized by resource (`/api/branches`, `/api/ingredients`, `/api/products`, etc.)
- WebSocket rooms for branch-specific real-time updates
- Zod schemas for request validation

**Database Layer**
- Drizzle ORM for type-safe database operations
- PostgreSQL via Neon serverless with connection pooling
- Schema-first design with shared TypeScript types between client and server

**Real-time Features**
- Socket.IO event system for:
  - Stock level updates (`stock-updated`, `product-stock-updated`)
  - Hourly check reminders
  - Branch-specific rooms for targeted updates

### Data Storage Solutions

**Database Schema (PostgreSQL)**
- `users` - Authentication and user management
- `branches` - Store location data
- `ingredients` - Master ingredient catalog with units and images
- `ingredient_stock` - Per-branch ingredient inventory with expiry tracking
- `bakery_products` - Product catalog with shelf life specifications
- `product_stock` - Real-time product inventory by branch
- `hourly_checks` - Historical stock count records
- `demand_forecasts` - AI-generated demand predictions (hourly)
- `branch_forecasts` - Branch-level forecast aggregations
- `product_forecasts` - Product-specific forecast details with accuracy metrics

**Key Features**
- Batch number tracking for ingredients
- Expiry date monitoring with "days until expiry" calculations
- Production timestamp tracking for shelf-life management
- Yesterday/today stock differentiation for opening inventory

### External Dependencies

**Core Libraries**
- `@neondatabase/serverless` - Serverless PostgreSQL client for Neon
- `drizzle-orm` - Type-safe ORM with PostgreSQL dialect
- `drizzle-kit` - Database migration and schema management tools
- `socket.io` & `socket.io-client` - Real-time WebSocket communication
- `ws` - WebSocket library for Neon serverless compatibility

**UI Component Libraries**
- `@radix-ui/*` - 20+ accessible component primitives (dialogs, dropdowns, etc.)
- `recharts` - Data visualization for forecast charts
- `date-fns` - Date manipulation with Thai locale support
- `lucide-react` - Icon library
- `class-variance-authority` - Type-safe component variants
- `tailwind-merge` & `clsx` - Conditional className utilities

**Form & Validation**
- `react-hook-form` - Performant form state management
- `@hookform/resolvers` - Form validation resolvers
- `zod` - Schema validation for forms and API requests
- `drizzle-zod` - Automatic Zod schema generation from Drizzle schemas

**Developer Tools**
- `@replit/vite-plugin-*` - Replit-specific development plugins
- `tsx` - TypeScript execution for development
- `esbuild` - Fast bundler for production server code

**Third-party Integrations**
- Neon Database - Serverless PostgreSQL hosting
- Web Notifications API - Browser push notifications for hourly check reminders
- Session management via `connect-pg-simple` for PostgreSQL-backed sessions

**Forecast System**
- External Python-based hybrid forecasting model (ARIMA + LSTM + Prophet)
- JSON import endpoint for batch forecast data
- Accuracy tracking and model type attribution per prediction