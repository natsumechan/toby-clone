# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Toby tab manager clone - a browser extension/web app for organizing and managing browser tabs. It's built with:
- **Next.js 14** (React 19) with App Router
- **TypeScript** for type safety
- **Tailwind CSS** + **shadcn/ui** components for styling
- **Radix UI** primitives for accessible components

## Architecture

### Core Structure
- `/toby/` - Main Next.js application directory
- `/toby/app/` - Next.js App Router pages and layouts
- `/toby/components/ui/` - Reusable shadcn/ui components
- `/toby/lib/` - Utility functions (mainly `utils.ts` for className merging)

### Key Components
- `app/page.tsx` - Main dashboard component containing tab and collection management
- `app/layout.tsx` - Root layout with Geist font configuration and dark theme
- `components/ui/` - shadcn/ui component library (button, card, dialog, etc.)

### Data Models
The app manages two main entities:
- **Tab**: `{ id, title, url, favicon, collection, created, order, thumbnail? }`
- **Collection**: `{ id, name, starred, expanded, order }`

## Development Commands

```bash
# Development server
npm run dev

# Production build
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

## Configuration

### Import Aliases
All configured in `tsconfig.json` and `components.json`:
- `@/` - Root directory
- `@/components` - Components directory
- `@/lib` - Library/utilities
- `@/components/ui` - shadcn/ui components

### Styling
- **shadcn/ui** configuration in `components.json` (New York style)
- **Tailwind** with CSS variables for theming
- Dark mode enabled by default in layout
- Custom CSS variables defined in `app/globals.css`

## Code Patterns

### Component Structure
- Use `"use client"` directive for interactive components
- TypeScript interfaces defined inline with components
- shadcn/ui components imported from `@/components/ui/`
- Lucide React icons for UI elements

### State Management
- React hooks (`useState`, `useEffect`) for local state
- No external state management library currently used
- Tab and collection data stored in component state

## Development Notes

- No test framework currently configured
- ESLint configured with Next.js and TypeScript rules
- Uses Geist font family (sans and mono variants)
- All components are client-side rendered (uses "use client")