# Umbrella Lending System

## Overview

This is a React-based umbrella lending system designed for schools, built with a modern full-stack architecture. The application enables students to borrow and return umbrellas with real-time status tracking using Firebase Realtime Database. The system includes form validation, mobile-responsive design, and QR code scanning capabilities.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

The application is now a **Firebase-only static React application** optimized for Netlify deployment:

- **Frontend**: React with Vite for fast development and static builds
- **Database**: Firebase Realtime Database (PostgreSQL removed for static deployment)
- **Architecture**: Pure client-side with direct Firebase SDK integration
- **UI Framework**: Tailwind CSS with shadcn/ui components for consistent design
- **Build Tool**: Vite for optimized static bundling
- **Deployment**: Netlify-ready with `netlify.toml` configuration

## Key Components

### Frontend Architecture
- **React with TypeScript**: Modern component-based architecture using functional components and hooks
- **Routing**: Wouter for lightweight client-side routing with role-based access control
- **State Management**: React hooks with TanStack Query for server state management
- **Form Management**: React Hook Form with Zod validation schemas
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Role-Based Interface**: Separate dashboards for general users and administrators

### Database Layer
- **Firebase Realtime Database**: Complete data persistence and real-time synchronization
- **Direct SDK Integration**: Client-side Firebase SDK for optimal performance
- **Schema Design**: 
  - `umbrellas/{number}`: Individual umbrella status, borrower info, timestamps
  - `activities/{id}`: Complete borrow/return transaction history with real-time updates

### Core Features
- **FormBorrow**: Student registration form with validation (nickname, phone, umbrella selection, location)
- **FormReturn**: Return processing with location tracking
- **UmbrellaStatus**: Real-time dashboard showing all umbrella statuses
- **QRScanner**: Camera-based QR code scanning for umbrella identification

### Interface Separation (January 2025)
- **RoleSelection**: Landing page for choosing user type (general user vs admin)
- **UserDashboard**: Streamlined interface for students/staff with borrow/return functions
- **AdminDashboard**: Comprehensive management interface with statistics, activity logs, and database controls
- **Authentication**: Simple password-based admin access with session management
- **Navigation**: Dedicated navigation bars for each user type with role switching capabilities

## Data Flow

1. **User Interaction**: Students interact with borrow/return forms
2. **Form Validation**: Client-side validation using Zod schemas
3. **Firebase Operations**: Real-time database updates using Firebase SDK
4. **State Synchronization**: Automatic UI updates via Firebase listeners
5. **Activity Logging**: All transactions recorded with timestamps

The system uses Firebase's `onValue` listeners to maintain real-time synchronization between the database and UI components.

## External Dependencies

### Primary Dependencies
- **Firebase**: Real-time database and hosting
- **React Ecosystem**: React 18, React Hook Form, TanStack Query
- **UI Libraries**: Radix UI components, Tailwind CSS
- **Validation**: Zod for schema validation
- **Build Tools**: Vite, TypeScript, ESBuild

### Development Tools
- **Drizzle Kit**: Database migration tools (PostgreSQL ready)
- **Express.js**: Server framework for future API expansion
- **Replit Integration**: Development environment optimizations

## Deployment Strategy

The application is **deployment-ready** for static hosting platforms:

1. **Netlify**: Primary deployment target (configured and tested)
2. **Vercel**: Alternative hosting with optimized React builds  
3. **Firebase Hosting**: Static hosting option
4. **Replit**: Development and quick deployment environment

### Build Process
- Development: `npm run dev` (Vite dev server + Express.js)
- Production: `npm run build` (Vite build + ESBuild server compilation)
- Database: `npm run db:push` (Drizzle schema updates)

### Environment Configuration
- Firebase configuration via environment variables
- Fallback to hardcoded values for development
- Type-safe environment handling with Vite

The architecture prioritizes real-time functionality, mobile responsiveness, and ease of deployment while maintaining the flexibility to scale with additional features like authentication, reporting, or integration with school systems.