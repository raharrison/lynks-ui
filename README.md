## Lynks UI - Self-hosted link and note manager

**React 19 + TypeScript 6 + Vite 8**

Frontend webapp for the Lynks project, in a browser and, through Capacitor, as an Android app. Accompanied
by [lynks-server](https://github.com/raharrison/lynks-server) which provides
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
- [Capacitor 8](https://capacitorjs.com/) - The Android shell in `android/`, wrapping the same bundle

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
- Settings: profile, Jolt token, password, two-factor auth (TOTP), single sign-on linking, active sessions, tag/collection
  management, activity log

### Dev Commands

```bash
npm run dev            # Start dev server (http://localhost:3000)
npm run build          # Type-check + production build
npm run build:android  # The above, then cap sync android
npm run lint     # ESLint
npm run preview  # Preview production build
```

### Android

```bash
npm run build:android
JAVA_HOME=<a JDK 17-21> ./android/gradlew -p android assembleDebug
# or, with a device or emulator attached
npx cap run android
```

Android Studio's bundled JDK will do; `lynks-server` needs 25, which Gradle 8.14 rejects
here. `android/local.properties` needs `sdk.dir`; it is not committed.

The app asks which server to use on first launch. From an emulator the host is
`http://10.0.2.2:8080`. Signing in with a password or single sign-on gets the app a
session token it sends as a bearer header, and the server lists it among the account's
sessions as "Lynks app on Android".

Single sign-on runs in a browser tab and returns on `net.ryanh.lynks://sso`. Testing it
needs a server the phone can reach whose provider redirects to that server's own
`redirectUri`, which `localhost` is not.

#### Release builds

```bash
keytool -genkeypair -v -keystore android/lynks-release.jks         -keyalg RSA -keysize 4096 -validity 10000 -alias lynks
```

Then `android/keystore.properties` (gitignored) with `storeFile`, `storePassword`,
`keyAlias`, `keyPassword`, and:

```bash
JAVA_HOME=<a JDK 17-21> ./android/gradlew -p android assembleRelease
```

Without that file the APK is unsigned and will not install. Keep the keystore: the
signature identifies the app, and losing it breaks upgrades. CI does not build the app.

### Deployment

No container. `npm run build` emits static files to `dist/`, which the VPS nginx
serves.

Pushing a version tag matching `version` in `package.json` (e.g. `2.1.0`) runs the
`Release` workflow, which lints, builds and copies `dist/` to
`UI_TARGET_PATH<version>/` on the host. Point the nginx root at that release.

The nginx site config lives in `lynks-server/config/nginx.conf`, since it also
proxies `/api` to the API service.
