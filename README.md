## Lynks UI - Self-hosted link and note manager

**React 19 + TypeScript + Vite 8**

Frontend webapp for the Lynks project. Accompanied by [lynks-server](https://github.com/raharrison/lynks-server) which provides
the backend API.

### Tech Stack

- [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) - UI framework
- [Vite 8](https://vite.dev/) - Build tool and dev server (port 3000, proxies `/api` to `localhost:8080`)
- [Ant Design 6](https://ant.design/) - Component library
- [TanStack React Query](https://tanstack.com/query) - Server state and caching
- [React Router 7](https://reactrouter.com/) - Client-side routing
- [Zustand](https://zustand.docs.pmnd.rs/) - Client state (auth, sidebar, theme)
- [Tiptap 3](https://tiptap.dev/) - Rich text editing
- [Axios](https://axios-http.com/) - HTTP client with session cookie auth

### Features

- Browse, search and manage **links, notes, snippets and files**
- Tag and collection management with hierarchy support
- Full-text search with live filtering
- Rich entry detail view - readable content, screenshots, discussions, comments and reminders
- Inline **rich text / Markdown editor** with Tiptap
- **Syntax highlighting** for code snippets
- Light and dark theme
- Notifications and scheduled reminder management
- Settings: profile, password, two-factor auth (TOTP), tag/collection management, activity log

### Dev Commands

```bash
npm run dev      # Start dev server (http://localhost:3000)
npm run build    # Type-check + production build
npm run lint     # ESLint
npm run preview  # Preview production build
```
