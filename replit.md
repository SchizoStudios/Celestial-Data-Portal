# replit.md

## Overview

This is a full-stack astronomical data portal application built for calculating, monitoring, and analyzing astrological and astronomical events. The system provides natal chart calculations, aspect monitoring, and ephemeris data tracking. It's designed as a comprehensive platform for astronomical intelligence focused on core astrological functionality.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query for server state management
- **UI Framework**: Radix UI components with shadcn/ui design system
- **Styling**: Tailwind CSS with custom celestial theme variables
- **Build Tool**: Vite with custom aliases and development plugins

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **Authentication**: Replit Auth with OpenID Connect
- **Session Management**: PostgreSQL-backed sessions with connect-pg-simple
- **API**: RESTful endpoints with JSON responses
- **External Services**: OpenAI API for content generation

### Project Structure
```
├── client/          # Frontend React application
├── server/          # Backend Express server
├── shared/          # Shared TypeScript schemas and types
└── migrations/      # Database migration files
```

## Key Components

### Database Schema (Drizzle)
- **Users**: User profiles with Replit Auth integration
- **Sessions**: PostgreSQL-backed session storage for authentication
- **Natal Charts**: Store birth data, calculated positions, aspects, and AI interpretations
- **Aspect Monitors**: Track specific astrological aspects with notification preferences
- **Ephemeris Data**: Astronomical position data for specific dates/locations

### Astronomical Services
- **AstronomicalService**: Calculates planetary positions, aspects, and chart data
- **GeminiService**: Generates astrological interpretations using Google Gemini 2.5 Flash/Pro
- **AstrologyDataService**: Integrates comprehensive astrology data from user's vault for enhanced interpretations
- **Chart Renderer**: SVG-based natal chart visualization system

### Storage Layer
- **IStorage Interface**: Abstraction layer for data operations
- **MemStorage**: In-memory implementation for development
- **Database integration**: PostgreSQL via Drizzle ORM for production

## Data Flow

1. **Authentication**: Replit Auth handles user login/logout with session management
2. **User Input**: Birth data and monitoring preferences
3. **Calculation**: Astronomical calculations for planetary positions and aspects
4. **Storage**: Persistent storage of charts and monitors
5. **AI Enhancement**: Google Gemini integration for astrological interpretations
6. **Visualization**: SVG chart rendering and responsive UI components

## External Dependencies

### Core Technologies
- **@neondatabase/serverless**: Serverless PostgreSQL connection
- **drizzle-orm**: Type-safe database ORM
- **@tanstack/react-query**: Server state management
- **openai**: AI content generation
- **@radix-ui/***: Headless UI components
- **openid-client**: OpenID Connect client for Replit Auth
- **passport**: Authentication middleware
- **express-session**: Session management
- **connect-pg-simple**: PostgreSQL session store

### Development Tools
- **Vite**: Build tool with HMR and development server
- **tsx**: TypeScript execution for development
- **esbuild**: Production bundling
- **@replit/vite-plugin-cartographer**: Replit integration

### Optional Features
- **connect-pg-simple**: PostgreSQL session store
- **embla-carousel-react**: Carousel components
- **date-fns**: Date manipulation utilities

## Deployment Strategy

### Development
- **Command**: `npm run dev`
- **Server**: tsx with hot reload
- **Client**: Vite dev server with HMR
- **Database**: Drizzle push for schema updates

### Production
- **Build**: `npm run build` - Creates optimized bundles
- **Server**: Node.js with compiled TypeScript
- **Client**: Static files served by Express
- **Database**: PostgreSQL with connection pooling

### Environment Variables
- `DATABASE_URL`: PostgreSQL connection string
- `GEMINI_API_KEY`: Google Gemini API authentication
- `SESSION_SECRET`: Secret key for session encryption
- `REPL_ID`: Replit application ID for authentication
- `REPLIT_DOMAINS`: Comma-separated list of authorized domains
- `ISSUER_URL`: OpenID Connect issuer URL (defaults to replit.com/oidc)
- `NODE_ENV`: Environment mode (development/production)

## Changelog
```
Changelog:
- July 07, 2025: Initial setup
- July 07, 2025: Switched from OpenAI to Google Gemini 2.5 Flash/Pro for AI interpretations
- July 07, 2025: Integrated comprehensive astrology data from user's "Astrology Arith(m)etic Vault"
- July 07, 2025: Enhanced storage layer with proper type handling
- July 07, 2025: Implemented comprehensive aspect system with 26 aspects across 5 categories (Major, Minor, Harmonic, Septile, Novile)
- July 07, 2025: Fixed dashboard custom location functionality with proper coordinate mapping
- July 07, 2025: Implemented comprehensive location services using OpenStreetMap Nominatim API for worldwide geocoding
- July 07, 2025: Added natal chart editing functionality with validation and error handling
- July 07, 2025: Created aspect interpretation tooltips with caching using Astrology Arith(m)etic Vault data
- July 07, 2025: Implemented dashboard settings with persistent location, time management, zodiac systems, and house calculation systems
- July 07, 2025: Added View Full Ephemeris functionality and comprehensive dashboard customization
- July 07, 2025: Integrated Replit Auth with OpenID Connect for secure user authentication and session management
- July 07, 2025: Fixed aspect tooltip functionality on dashboard - switched from hover tooltips to click-based popovers for better mobile interaction
- July 07, 2025: Corrected aspect data path in AstrologyDataService to use proper vault structure (/Definitions/Aspects/ with categorized folders)
- July 07, 2025: Fixed sunrise/sunset calculation algorithm - now shows accurate times (e.g., NYC July: sunrise ~5:40 AM, sunset ~8:00 PM)
- July 07, 2025: Implemented Progressive Web App (PWA) functionality with offline capabilities - added manifest.json, service worker, and IndexedDB offline storage
- July 07, 2025: Added PWA installer component for native app-like experience on iPhone, Android, and Linux platforms
- July 07, 2025: Created comprehensive offline storage system using IndexedDB for natal charts, ephemeris data, and user preferences
- July 07, 2025: Improved mobile portrait display responsiveness across dashboard and admin interfaces with flexible layouts
- July 07, 2025: Removed admin tools for podcast creation - simplified application to focus on core astrological functionality including natal charts, aspect monitoring, and ephemeris data
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```