import {useEffect} from 'react';
import './App.css';
import {createBrowserRouter, Navigate, Outlet, RouterProvider, useLocation, useNavigate} from 'react-router-dom';
import {QueryClientProvider, useQuery} from '@tanstack/react-query';
import {queryClient} from '@/lib/queryClient';
import {App as AntApp, ConfigProvider, Spin, theme as antTheme} from 'antd';
import {useAuthStore} from '@/stores/authStore';
import {useThemeStore} from '@/stores/themeStore';
import {LIME, LIME_ACTIVE, LIME_HOVER, LIME_INK, PALETTE} from '@/theme';
import {checkCurrentUser} from '@/api/user';
import {QK} from '@/utils/queryKeys';
import {loginPath, safeReturnTo} from '@/utils/returnTo';
import AppLayout from '@/components/layout/AppLayout';
import EntryListPage from '@/pages/EntryListPage';
import EntryDetailPage from '@/pages/EntryDetailPage';
import CreateEntryPage from '@/pages/CreateEntryPage';
import EditEntryPage from '@/pages/EditEntryPage';
import DigestPage from '@/pages/DigestPage';
import NotificationsPage from '@/pages/NotificationsPage';
import RemindersPage from '@/pages/RemindersPage';
import ResourceViewerPage from '@/pages/ResourceViewerPage';
import SettingsPage from '@/pages/SettingsPage';
import LoginPage from '@/pages/LoginPage';
import ErrorBoundary from '@/components/common/ErrorBoundary';


function AuthGate() {
  const setUser = useAuthStore((s) => s.setUser);
  const navigate = useNavigate();
  const location = useLocation();

    // useQuery deduplicates concurrent requests - safe under React StrictMode double-mount
  const {data: user, isPending} = useQuery({
    queryKey: QK.user(),
    queryFn: checkCurrentUser,
    retry: false,
    staleTime: Infinity,
  });

  // Populate Zustand store for components that read user (AppHeader etc.)
  useEffect(() => {
    setUser(user ?? null);
  }, [user, setUser]);

    const here = location.pathname + location.search;
    const loginTarget = loginPath(here);
    const returnTarget = safeReturnTo(new URLSearchParams(location.search).get('returnTo'));

  useEffect(() => {
    if (isPending) return;
    if (!user && location.pathname !== '/login') {
        navigate(loginTarget, {replace: true});
    } else if (user && location.pathname === '/login') {
        navigate(returnTarget, {replace: true});
    }
  }, [isPending, user, location.pathname, loginTarget, returnTarget, navigate]);

  if (isPending) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!user && location.pathname !== '/login') {
      return <Navigate to={loginTarget} replace/>;
  }

  if (user && location.pathname === '/login') {
      return <Navigate to={returnTarget} replace/>;
  }

  return <Outlet />;
}

const router = createBrowserRouter([
  {
    element: <AuthGate />,
    children: [
      { path: '/login', element: <LoginPage /> },
      {
        element: <ErrorBoundary><AppLayout /></ErrorBoundary>,
        children: [
          {path: '/:entryType?', element: <EntryListPage/>},
          // Typed detail routes
          { path: '/links/:id', element: <EntryDetailPage /> },
          { path: '/notes/:id', element: <EntryDetailPage /> },
          { path: '/snippets/:id', element: <EntryDetailPage /> },
          { path: '/files/:id', element: <EntryDetailPage /> },
          // Create
          { path: '/links/create', element: <CreateEntryPage type="link" /> },
          { path: '/notes/create', element: <CreateEntryPage type="note" /> },
          { path: '/snippets/create', element: <CreateEntryPage type="snippet" /> },
          { path: '/files/create', element: <CreateEntryPage type="file" /> },
          // Edit
          { path: '/links/:id/edit', element: <EditEntryPage /> },
          { path: '/notes/:id/edit', element: <EditEntryPage /> },
          { path: '/snippets/:id/edit', element: <EditEntryPage /> },
          { path: '/files/:id/edit', element: <EditEntryPage /> },
          // Resource viewer
          { path: '/links/:entryId/resource/:resourceId', element: <ResourceViewerPage /> },
          { path: '/notes/:entryId/resource/:resourceId', element: <ResourceViewerPage /> },
          { path: '/snippets/:entryId/resource/:resourceId', element: <ResourceViewerPage /> },
          { path: '/files/:entryId/resource/:resourceId', element: <ResourceViewerPage /> },
          // Backward-compat alias
          { path: '/entry/:id', element: <EntryDetailPage /> },
          {path: '/digest', element: <DigestPage/>},
          { path: '/notifications', element: <NotificationsPage /> },
          {path: '/reminders', element: <RemindersPage/>},
          { path: '/settings', element: <SettingsPage /> },
        ],
      },
    ],
  },
]);

function ThemedApp() {
  const resolved = useThemeStore((s) => s.resolved);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', resolved);
  }, [resolved]);

  const palette = PALETTE[resolved];

  const themeConfig = {
    algorithm: resolved === 'dark' ? antTheme.darkAlgorithm : antTheme.defaultAlgorithm,
    token: {
      colorPrimary: palette.accent,
      colorPrimaryBg: palette.accentBg,
      colorPrimaryBgHover: palette.accentBgHover,
      colorLink: palette.accent,
      colorLinkHover: palette.accentHover,
      borderRadius: 10,
      fontSize: 14,
      colorBgContainer: palette.bgContainer,
      colorBgElevated: palette.bgElevated,
      colorBgLayout: palette.bgLayout,
      colorBorder: palette.border,
      colorBorderSecondary: palette.borderSecondary,
    },
    components: {
      Layout: {
        headerBg: palette.bgHeader,
        siderBg: palette.bgHeader,
        bodyBg: palette.bgLayout,
      },
      Card: {
        colorBgContainer: palette.bgContainer,
      },
      Menu: {
        itemBg: 'transparent',
      },
      Switch: {
        colorPrimary: LIME,
        colorPrimaryHover: LIME_HOVER,
      },
      // Filled buttons keep the brand lime in both themes, which is why their
      // label is ink rather than Ant Design's default white.
      Button: {
        colorPrimary: LIME,
        colorPrimaryHover: LIME_HOVER,
        colorPrimaryActive: LIME_ACTIVE,
        primaryColor: LIME_INK,
        solidTextColor: LIME_INK,
        primaryShadow: 'none',
      },
    },
  };

  return (
    <ConfigProvider theme={themeConfig}>
      <AntApp>
        <RouterProvider router={router} />
      </AntApp>
    </ConfigProvider>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemedApp />
    </QueryClientProvider>
  );
}
