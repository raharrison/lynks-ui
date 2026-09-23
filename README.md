## Lynks UI - Self-hosted link and note manager

**React 19 + TypeScript 6 + Vite 8**

Frontend webapp for the Lynks project. Accompanied by [lynks-server](https://github.com/raharrison/lynks-server) which provides
the backend API.

### Tech Stack

- [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) - UI framework
- [Vite 8](https://vite.dev/) - Build tool and dev server (port 3000, proxies `/api` to `localhost:8080`)
- [Ant Design 6](https://ant.design/) - Component library
- [TanStack React Query](https://tanstack.com/query) - Server state and caching
- [React Router 7](https://reactrouter.com/) - Client-side routing
- [Zustand](https://zustand.docs.pmnd.rs/) - Client state (auth, sidebar, theme)
- [Milkdown 7](https://milkdown.dev/) - Markdown-native rich text editing (Crepe)
- [Axios](https://axios-http.com/) - HTTP client with session cookie auth

### Features

- Browse, search and manage **links, notes, snippets and files**
- Tag and collection management with hierarchy support
- Full-text search with live filtering
- Rich entry detail view - readable content, screenshots, discussions, comments and reminders
- Inline **Markdown editor** with Milkdown: slash menu, drag handles, CodeMirror
  code blocks, and `@` mentions that link entries
- **Syntax highlighting** for code snippets
- Light and dark theme
- Notifications, polled every minute, with a toast when new ones arrive
- One-time and recurring **reminders**, with a schedule builder for intervals,
  weekdays, nth weekdays and days of the month, managed per entry or from the
  Reminders page
- A warning when a link being saved already exists
- **Weekly digest** page of unread links, regenerated on a schedule
- Settings: profile, Jolt token, password, two-factor auth (TOTP), tag/collection management, activity log

### Dev Commands

```bash
npm run dev      # Start dev server (http://localhost:3000)
npm run build    # Type-check + production build
npm run lint     # ESLint
npm run preview  # Preview production build
```

### Deployment

No container. `npm run build` emits static files to `dist/`, which the VPS nginx
serves.

Pushing a version tag matching `version` in `package.json` (e.g. `2.1.0`) runs the
`Release` workflow, which lints, builds and copies `dist/` to
`UI_TARGET_PATH<version>/` on the host. Point the nginx root at that release.

The nginx site config lives in `lynks-server/config/nginx.conf`, since it also
proxies `/api` to the API service.
