# Chess Battle Arena

## Overview

Chess Battle Arena is a web application that enables AI language models to compete against each other in chess matches. The system orchestrates games between different LLM providers (OpenAI GPT, Google Gemini, Anthropic Claude, xAI Grok, DeepSeek, and Kimi/Moonshot), displaying real-time gameplay with move notation, timers, and match scoring. The application provides a clean, functional interface focused on game clarity and strategic observation.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React with TypeScript using Vite as the build tool and development server.

**UI Component System**: Radix UI primitives with shadcn/ui component library following Material Design principles. The design emphasizes clarity, information hierarchy, and minimal distraction as outlined in the design guidelines. Components are built with the "new-york" style variant and use Tailwind CSS with custom HSL color variables for theming.

**State Management**: React hooks for local component state. TanStack Query (React Query) handles server state management with custom API request utilities.

**Routing**: Wouter provides lightweight client-side routing with a single main route to the chess game page.

**Chess Logic**: chess.js library manages game rules, move validation, board state (FEN notation), and legal move generation.

**Layout Structure**: Three-column layout with move notation panels flanking a central chess board (20%-60%-20% width distribution). Player selection and game controls appear above the board, with scorecard and rules sections below.

### Backend Architecture

**Server Framework**: Express.js with TypeScript running on Node.js.

**AI Integration Layer**: Multiple LLM provider clients integrated through a unified interface:
- OpenAI SDK for GPT models (including GPT-5)
- Anthropic SDK for Claude models
- Google GenAI SDK for Gemini models
- OpenAI-compatible clients for xAI Grok, DeepSeek, and Kimi (using different base URLs)

**Chess AI Endpoint**: `/api/chess/move` accepts game state (FEN, legal moves, move history) and player ID, returns the selected move from the appropriate LLM provider. The system handles move parsing, validation, and error recovery.

**API Architecture**: RESTful JSON API with a single POST endpoint for move generation. The backend validates requests, delegates to the appropriate LLM client based on player ID, and returns structured move responses.

**Build Process**: Custom esbuild configuration bundles server code with selective dependency bundling (allowlist approach) to optimize cold start times by reducing file system calls.

### Data Storage

**Database**: PostgreSQL via Neon serverless driver with Drizzle ORM for schema management and type-safe queries.

**Schema**: Minimal user table defined in `shared/schema.ts` with username/password fields and UUID primary keys. Uses Drizzle's schema-first approach with Zod integration for validation.

**In-Memory Storage**: MemStorage class provides fallback implementation of user CRUD operations for development/testing scenarios.

**Session Management**: The infrastructure supports session-based authentication (connect-pg-simple for session store), though user authentication is not currently active in the chess game flow.

### External Dependencies

**LLM Providers**:
- OpenAI API (GPT-4o, GPT-5)
- Anthropic API (Claude 3.5 Sonnet)
- Google Gemini API (Gemini 2.5 Pro)
- xAI API (Grok 4)
- DeepSeek API (DeepSeek-V3)
- Moonshot AI API (Kimi K2)

All providers require API keys configured via environment variables (OPENAI_API_KEY, ANTHROPIC_API_KEY, GEMINI_API_KEY, XAI_API_KEY, DEEPSEEK_API_KEY, KIMI_API_KEY).

**Database Service**: Neon serverless PostgreSQL accessed via DATABASE_URL environment variable.

**Development Tools**:
- Replit-specific Vite plugins (cartographer, dev-banner, runtime-error-modal) for enhanced development experience
- Drizzle Kit for database migrations and schema management

**Font Services**: Google Fonts CDN provides Inter (primary), DM Sans, Architects Daughter, Fira Code, and Geist Mono typefaces.

**Component Libraries**:
- Radix UI primitives (dialogs, dropdowns, selects, tooltips, etc.)
- Lucide React for iconography
- class-variance-authority and clsx/tailwind-merge for dynamic styling