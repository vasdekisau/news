# CONVENTIONS.md - Coding Conventions

## TypeScript
- Strict mode enabled
- No `any` type usage visible
- Interfaces for data types

## React/Next.js
- App Router structure (`page.tsx`, `layout.tsx`)
- Client components for interactivity
- Tailwind for styling (dark mode via `next-themes`)

## Hono/Workers
- Route handlers in separate files
- JSON response patterns
- Zod for request validation (referenced in AGENTS.md)

## CSS/Tailwind
- Mobile-first approach (mentioned in AGENTS.md)
- Dark mode support
- Utility classes

## Patterns Observed
- Device-based preferences (localStorage + API)
- API-first approach
- No authentication (public app)

## File Organization
- Routes grouped by feature
- Components in `/components`
- Pages in `/app` (App Router)
