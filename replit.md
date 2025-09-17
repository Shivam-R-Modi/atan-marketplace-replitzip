# ATAN - Adaptive Task Automation Network

## Overview

ATAN is a production-ready marketplace platform that allows businesses to rent specialized AI agents for micro-tasks using a pay-as-you-go pricing model. The platform features three core AI agents (Invoice Processor, Email Sorter, and Data Entry) with task-based and token-based pricing, volume discounts, real-time analytics, and comprehensive cost tracking with department/project allocation.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Backend Architecture
- **Node.js + Express**: RESTful API server with middleware for authentication, usage tracking, and error handling
- **Authentication**: JWT-based sessions with Passport.js and express-session
- **Database Layer**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Real-time Communication**: WebSocket server for live updates and notifications
- **Modular Services**: Separated business logic into dedicated services (pricing, analytics, AI processing, token counting)

### Frontend Architecture
- **React 18**: Modern functional components with hooks and context for state management
- **Routing**: Wouter for lightweight client-side routing
- **Data Fetching**: TanStack Query for server state management, caching, and synchronization
- **UI Components**: Radix UI primitives with Tailwind CSS for responsive design
- **Charts**: Recharts for analytics visualizations and real-time usage graphs

### Database Design
- **Users**: Account management with credits balance, auto-top-up settings, and monthly budgets
- **Agents**: AI agent definitions with pricing tiers and capabilities
- **Tasks**: Task execution records with token usage, costs, and department/project tracking
- **Transactions**: Financial transaction history for billing and audit trails
- **Usage Metrics**: Aggregated usage data for analytics and cost predictions
- **API Keys**: Authentication keys for programmatic access

### AI Agent System
- **Modular Agent Design**: Three specialized agents with individual pricing models and capabilities
- **Token-based Pricing**: Dual pricing structure combining per-task and per-token costs
- **Volume Discounts**: Automatic discounts based on daily task volume (5%, 10%, 20%)
- **Processing Simulation**: Mock AI processing with realistic delays and token counting

### Pricing Engine
- **Dynamic Cost Calculation**: Real-time cost computation based on task complexity and token usage
- **Volume Discount Application**: Automatic discount calculation based on usage patterns
- **Predictive Analytics**: Cost projections for daily, monthly, and yearly usage with discount scenarios

### Real-time Features
- **WebSocket Integration**: Live task status updates and cost tracking
- **Usage Monitoring**: Real-time analytics dashboard with live charts and metrics
- **Automatic Notifications**: Budget alerts and usage threshold notifications

## External Dependencies

### Database
- **PostgreSQL**: Primary database with Neon serverless hosting
- **Drizzle ORM**: Type-safe database operations and migrations

### Authentication
- **Passport.js**: Authentication middleware with local strategy
- **express-session**: Session management with PostgreSQL store
- **JWT**: Secure token-based authentication

### UI Framework
- **Radix UI**: Accessible component primitives for dialogs, dropdowns, and form controls
- **Tailwind CSS**: Utility-first CSS framework with custom design system
- **Recharts**: React charting library for analytics visualizations

### Development Tools
- **Vite**: Fast build tool with hot module replacement
- **TypeScript**: Type safety across the entire application
- **ESBuild**: Fast JavaScript bundler for production builds

### External API Integration Points
- **Mistral AI**: Placeholder for text processing and analysis (API endpoint: https://api.mistral.ai)
- **AIML API**: Placeholder for document OCR and data extraction (API endpoint: https://api.aimlapi.com)

### Real-time Communication
- **WebSocket**: Native WebSocket implementation for live updates
- **Server-Sent Events**: Alternative real-time communication method for analytics

The architecture emphasizes modularity, type safety, and real-time capabilities while maintaining a clean separation between frontend presentation, backend business logic, and data persistence layers.