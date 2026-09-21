# lynks-ui

React SPA for Lynks. This file is how to change it; `README.md` is how to run and
deploy it.

## Tech Stack

- **React 19** with **TypeScript 6** (strict mode)
- **Vite 8** - dev server on port 3000, proxies `/api` to `http://localhost:8080`
- **Ant Design 6** - primary component library
- **Zustand** - client state (auth, sidebar, theme)
- **TanStack React Query** - server state, caching, mutations
- **React Router 7** - client-side routing
- **Tiptap 3** - rich text editing
- **Axios** - HTTP client with session cookie auth

## Directory Structure

```
src/
├── api/          # Axios API client modules (one file per domain)
├── components/   # Reusable UI components
│   ├── common/   # Shared components (editor, markdown, group chips)
│   ├── entries/  # Entry-specific components and forms
│   ├── layout/   # AppHeader, AppLayout, AppSidebar
│   ├── comments/
│   ├── groups/
│   └── reminders/
├── hooks/        # Custom React Query hooks (queries + mutations)
├── pages/        # Route-level page components
│   └── settings/ # Settings sub-pages
├── stores/       # Zustand stores (authStore, sidebarStore, themeStore)
├── types/        # index.ts - all domain TypeScript interfaces
└── utils/        # apiError, constants, format, queryKeys
```

## Key Conventions

- Path alias `@` maps to `src/` - use `@/components/...` not relative paths
- All React Query cache keys are defined in `src/utils/queryKeys.ts`
- API modules in `src/api/` are plain async functions; hooks in `src/hooks/` wrap them with React Query
- Entry types: `link`, `note`, `snippet`, `file`
- Dark/light theme toggled via Zustand `themeStore`; applied as `data-theme` attribute.
  `index.html` sets it before React mounts so a dark session does not flash white
- Brand is ink + lime. `src/theme.ts` holds the palette because Ant Design derives
  its ramps from literal colours and cannot read CSS variables; the `:root` and
  `[data-theme="dark"]` blocks in `src/index.css` mirror it by hand, so the two
  have to move together
- Lime is too light for white text, so filled buttons and switches use `--accent-ink`.
  Light mode drops to lime-700 for anything read as text or a border
- Chips never pass Ant Design's `color` prop. Use the `lynks-chip` classes in
  `index.css`: neutral by default, `-clickable` for hover, `-accent` for selected
  and unread, `-danger`, and `-type-*` for entry types, which are the only
  decorative colour left. Those rules are qualified with `:root` because Ant
  Design injects its styles after this file and would otherwise win the cascade
- `src/types/index.ts` mirrors the server's models by hand; an API shape change has
  to be made here too
- Notification methods are `push` and `jolt`; enums cross the wire lowercased
- `public/favicon.svg` is the source every other icon is generated from. It needs
  its `<g id="tile">` and `<g id="glyph">` sections, which `npm run icons` pulls apart
  to build the full-bleed maskable and apple-touch variants

## Dev Commands

```bash
npm run dev      # Start dev server (http://localhost:3000)
npm run build    # Type-check + production build
npm run lint     # ESLint
npm run preview  # Preview production build
npm run icons    # Regenerate public/*.png and favicon.ico from favicon.svg
```

## Auth

- Session-based (cookies), axios client has `withCredentials: true`
- 401 responses auto-redirect to `/login` via response interceptor in `src/api/client.ts`
- Auth state stored in `src/stores/authStore.ts`
