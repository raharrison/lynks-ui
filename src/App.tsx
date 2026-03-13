import {useEffect} from 'react';
import './App.css';
import {createBrowserRouter, Navigate, Outlet, RouterProvider, useLocation, useNavigate} from 'react-router-dom';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {App as AntApp, ConfigProvider, Spin, theme as antTheme} from 'antd';
import {useAuthStore} from '@/stores/authStore';
import {useThemeStore} from '@/stores/themeStore';
import {checkCurrentUser} from '@/api/user';
import AppLayout from '@/components/layout/AppLayout';
import EntryListPage from '@/pages/EntryListPage';
import EntryDetailPage from '@/pages/EntryDetailPage';
import CreateEntryPage from '@/pages/CreateEntryPage';
import EditEntryPage from '@/pages/EditEntryPage';
import NotificationsPage from '@/pages/NotificationsPage';
import ResourceViewerPage from '@/pages/ResourceViewerPage';
import SettingsPage from '@/pages/SettingsPage';
import LoginPage from '@/pages/LoginPage';
import ErrorBoundary from '@/components/common/ErrorBoundary';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
      refetchOnWindowFocus: false,
    },
  },
});

function AuthGate() {
  const { user, checked, loading, setUser, setChecked, setLoading } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    checkCurrentUser().then((currentUser) => {
      if (cancelled) return;
      setUser(currentUser);
      setChecked(true);
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, [setChecked, setLoading, setUser]);

  useEffect(() => {
    if (!checked) return;
    if (!user && location.pathname !== '/login') {
      navigate('/login', { replace: true });
    } else if (user && location.pathname === '/login') {
      navigate('/', { replace: true });
    }
  }, [checked, user, location.pathname, navigate]);

  if (loading && !checked) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (checked && !user && location.pathname !== '/login') {
    return <Navigate to="/login" replace />;
  }

  if (checked && user && location.pathname === '/login') {
    return <Navigate to="/" replace />;
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
          { path: '/', element: <EntryListPage /> },
          { path: '/links', element: <EntryListPage /> },
          { path: '/notes', element: <EntryListPage /> },
          { path: '/snippets', element: <EntryListPage /> },
          { path: '/files', element: <EntryListPage /> },
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
          { path: '/notifications', element: <NotificationsPage /> },
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

  const themeConfig = {
    algorithm: resolved === 'dark' ? antTheme.darkAlgorithm : antTheme.defaultAlgorithm,
    token: {
      colorPrimary: '#4f6ef7',
      borderRadius: 10,
      fontSize: 14,
      colorBgContainer: resolved === 'dark' ? '#1a1a2e' : '#ffffff',
      colorBgElevated: resolved === 'dark' ? '#1f1f3a' : '#ffffff',
      colorBgLayout: resolved === 'dark' ? '#0f0f1e' : '#f0f2f5',
      colorBorder: resolved === 'dark' ? '#2d2d4a' : '#e8e8e8',
      colorBorderSecondary: resolved === 'dark' ? '#252542' : '#f0f0f0',
    },
    components: {
      Layout: {
        headerBg: resolved === 'dark' ? '#141428' : '#ffffff',
        siderBg: resolved === 'dark' ? '#141428' : '#ffffff',
        bodyBg: resolved === 'dark' ? '#0f0f1e' : '#f0f2f5',
      },
      Card: {
        colorBgContainer: resolved === 'dark' ? '#1a1a2e' : '#ffffff',
      },
      Menu: {
        itemBg: 'transparent',
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
