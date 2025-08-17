# Technology Stack & Build System

## Core Technologies

- **Frontend Framework**: React 19.1.0 with TypeScript 5.8.2
- **Routing**: React Router DOM 7.6.2 with HashRouter
- **Build Tool**: Vite 6.2.0 (ES modules, fast HMR)
- **Styling**: Tailwind CSS (utility-first CSS framework)
- **AI Integration**: Google Gemini AI (@google/genai 1.11.0)

## Project Configuration

- **Module System**: ES modules (`"type": "module"`)
- **TypeScript Config**: 
  - Target: ES2022
  - JSX: react-jsx
  - Path aliases: `@/*` maps to project root
  - Experimental decorators enabled
- **Environment**: Uses `.env.local` for API keys (GEMINI_API_KEY)

## Common Commands

```bash
# Install dependencies
npm install

# Development server (with hot reload)
npm run dev

# Production build
npm run build

# Preview production build
npm run preview
```

## Architecture Patterns

- **Component-based**: Modular UI components in `components/ui/`
- **Context Providers**: AuthProvider, ThemeProvider for global state
- **Protected Routes**: Role-based route protection with ProtectedRoute component
- **Layout System**: Specialized layouts for different services (CloudEdge, Email Admin Suite)
- **Mock Data**: Comprehensive mock data system in `data.ts` for development

## Code Organization

- Components use TypeScript React (.tsx)
- Centralized type definitions in `types.ts`
- UI components exported through barrel exports (`components/ui/index.ts`)
- Page components organized by feature in `pages/` directory
- Context and providers in `context.tsx`