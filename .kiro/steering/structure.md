# Project Structure & Organization

## Root Level Files

- `App.tsx` - Main application component with routing and layout logic
- `index.tsx` - Application entry point with React root mounting
- `types.ts` - Centralized TypeScript type definitions
- `data.ts` - Mock data for development and testing
- `context.tsx` - React context providers (Auth, Theme, AppLayout)
- `ui.tsx` - UI utilities and helpers
- `views.tsx` - View-related utilities

## Directory Structure

```
├── components/ui/          # Reusable UI components
│   ├── index.ts           # Barrel export for all components
│   ├── Button.tsx         # Primary interactive elements
│   ├── Card.tsx           # Content containers
│   ├── Modal.tsx          # Overlay dialogs
│   ├── Navbar.tsx         # Top navigation
│   ├── Sidebar.tsx        # Side navigation
│   └── ...                # Other UI components
├── pages/                 # Page components organized by feature
│   ├── auth/              # Authentication pages
│   ├── admin/             # Admin-specific pages
│   ├── billing/           # Billing and subscription pages
│   ├── customer/          # Customer management pages
│   ├── dashboard/         # Dashboard pages by role
│   ├── pricing/           # Pricing pages
│   ├── products/          # Product-specific pages
│   ├── reseller/          # Reseller-specific pages
│   └── settings/          # User settings pages
└── .kiro/steering/        # AI assistant steering rules
```

## Naming Conventions

- **Components**: PascalCase (e.g., `UserManagementPage.tsx`)
- **Files**: PascalCase for components, camelCase for utilities
- **Directories**: kebab-case or camelCase depending on context
- **Types**: PascalCase interfaces (e.g., `User`, `AuthContextType`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `MOCK_USERS`)

## Component Organization

- **Pages**: Feature-specific page components in `pages/` subdirectories
- **UI Components**: Reusable components in `components/ui/`
- **Layouts**: Specialized layouts for different services (CloudEdge, Email Admin Suite)
- **Context**: Global state management through React Context

## Route Structure

- `/` - Landing page
- `/login`, `/signup` - Authentication
- `/app/*` - Protected application routes
  - Role-based dashboard redirects
  - Nested routes for features (billing, settings, etc.)
  - Service-specific routes (cloud-edge, email-admin-suite)

## Import Patterns

- Use `@/` path alias for imports from project root
- Barrel exports from `components/ui/index.ts`
- Centralized type imports from `types.ts`
- Mock data imports from `data.ts`