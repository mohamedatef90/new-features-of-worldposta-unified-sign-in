
# WorldPosta SSO Design System

This document outlines the design system for the WorldPosta SSO application. It is designed to ensure clarity, consistency, and efficiency across all WorldPosta services.

## 1. Design Philosophy & Principles

Our design philosophy is centered on **clarity, consistency, and efficiency**.

*   **Clarity**: The UI is designed to be intuitive and reduce cognitive load. Information is presented in a structured hierarchy, and interactive elements are clearly distinguished.
*   **Consistency**: A user should be able to predict how an element will behave, regardless of which service or page they are on. Components like buttons, cards, and forms share the same visual language.
*   **Efficiency**: Workflows are designed to be streamlined. Users can accomplish their primary tasks with minimal friction, whether it's managing users, checking invoices, or configuring a service.
*   **Scalability**: The system is built with modular components that can be reused and extended for new features and services without breaking the core design.
*   **Accessibility**: We strive to meet accessibility standards by using semantic HTML, ARIA attributes, proper color contrast, and keyboard-navigable elements.

## 2. Color Palette

The color system is designed with distinct roles for each color and supports both light and dark modes.

| Role              | Light Mode                                     | Dark Mode                                       | Usage                                                              |
| ----------------- | ---------------------------------------------- | ----------------------------------------------- | ------------------------------------------------------------------ |
| **Primary/Brand** | `#679a41` (WorldPosta Green)                    | `emerald-500` (Brighter Green)                  | Primary buttons, active navigation, links, focus rings, key icons. |
| **Secondary**     | `#293c51` (Dark Slate Blue)                    | `sky-600` (Vibrant Blue)                        | Secondary buttons, primary text, headings.                         |
| **Background**    | `fcfcfc` (Near White), `f8f8f8` (Subtle Gray)   | `1a202c` (Slate 900), `slate-800` (Lighter)     | Page backgrounds, containers, sidebars.                            |
| **Surface**       | `ffffff` (White)                               | `slate-800`                                     | Cards, Modals, Popovers.                                           |
| **Text**          | `#293c51` (Primary), `gray-500` (Secondary)     | `gray-200` (Primary), `gray-400` (Secondary)    | Body copy, labels, placeholders.                                   |
| **Borders**       | `gray-200` / `gray-300`                        | `gray-700` / `slate-700`                        | Separators, input fields, card outlines.                           |
| **Status: Danger**| `red-600` (Actions), `red-100` (Backgrounds)   | `red-500` (Actions), `red-900` (Backgrounds)    | Delete actions, error messages, critical alerts.                   |
| **Status: Success**| `green-100` (Backgrounds)                      | `green-900` (Backgrounds)                       | Success indicators, 'Active' status chips.                         |
| **Status: Warning**| `yellow-100` (Backgrounds)                     | `yellow-900` (Backgrounds)                      | 'Suspended' or 'Pending' status chips, warnings.                   |

## 3. Typography

We use a system font stack for optimal performance and a native feel across all operating systems.

*   **Font Family**: `sans-serif` (Tailwind's default: Inter, system-ui, etc.)
*   **Hierarchy**:
    *   **Page Titles (h1)**: `text-3xl font-bold`
    *   **Card/Section Titles (h2)**: `text-xl font-semibold`
    *   **Sub-headings (h3)**: `text-lg font-medium`
    *   **Body Text**: `text-sm` for most content, `text-base` for primary paragraphs.
    *   **Labels & Metadata**: `text-xs` for less critical information like timestamps or table headers.

## 4. Layout & Spacing

*   **Overall Layout**: The application uses a persistent sidebar navigation pattern. The main structure is a two-column layout: a fixed-width sidebar and a main content area that handles scrolling.
*   **Specialized Layouts**: Services like **CloudEdge** and **Posta Email services** have their own dedicated layouts. This creates a focused, "app-within-an-app" experience, reducing clutter and tailoring the navigation to the service's specific needs.
*   **Grid System**: We heavily utilize CSS Grid and Flexbox. Responsive grids (`grid-cols-1 md:grid-cols-2 lg:grid-cols-4`) are used for dashboard cards and other collections of items.
*   **Spacing**: We follow a consistent spacing scale based on Tailwind's defaults (multiples of 4px). This applies to padding (`p-6` in cards), margins, and gaps (`space-y-4`, `gap-6`).

## 5. Component System

Our UI is built from a library of reusable and consistent components.

*   **Card (`Card.tsx`)**: The primary content container. Features `rounded-xl` corners, `p-6` padding, and a subtle shadow.
*   **Button (`Button.tsx`)**: The main interactive element with clear variants:
    *   **Primary**: Solid brand color (`#679a41`) for the main call-to-action.
    *   **Outline**: Transparent background with a brand-colored border.
    *   **Ghost**: Fully transparent for tertiary actions.
    *   **Danger**: Red for destructive actions.
*   **FormField (`FormField.tsx`)**: Provides a consistent experience for all data entry with a standard border, a highlighted focus ring, and a distinct error state.
*   **Navigation**:
    *   **Sidebar (`Sidebar.tsx`)**: Collapsible on desktop, slides in as an overlay on mobile. Active links are highlighted.
    *   **Navbar (`Navbar.tsx`)**: Contains global elements like the user profile, notifications, and the **Floating App Launcher**.
*   **Modals (`Modal.tsx`)**: Used for focused tasks. Appears with a backdrop to dim the background content.
*   **Data Visualization**: Charts are designed to be clean and readable, using the application's color palette.
