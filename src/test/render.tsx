import {createContext, type ReactElement, type ReactNode, useContext} from 'react';
import {render, renderHook} from '@testing-library/react';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {App as AntApp} from 'antd';
import {createMemoryRouter, type RouteObject, RouterProvider} from 'react-router-dom';

export function createTestQueryClient() {
    return new QueryClient({
        defaultOptions: {
            queries: {retry: false, gcTime: Infinity, staleTime: Infinity},
            mutations: {retry: false},
        },
    });
}

interface Options {
    route?: string;
    /** Route pattern the element is mounted at, when it reads params. Other paths render nothing. */
    path?: string;
    queryClient?: QueryClient;
}

// The router is built once per render, so the element under test is fed through context to follow rerenders
const Slot = createContext<ReactNode>(null);

function SlotOutlet() {
    return <>{useContext(Slot)}</>;
}

function makeWrapper({route = '/', path = '*', queryClient = createTestQueryClient()}: Options) {
    const routes: RouteObject[] = [{path, element: <SlotOutlet/>}];
    if (path !== '*') routes.push({path: '*', element: null});
    // A data router, because useBlocker refuses to run under a plain MemoryRouter
    const router = createMemoryRouter(routes, {initialEntries: [route]});

    function Wrapper({children}: { children: ReactNode }) {
        return (
            <QueryClientProvider client={queryClient}>
                <AntApp>
                    <Slot.Provider value={children}>
                        <RouterProvider router={router}/>
                    </Slot.Provider>
                </AntApp>
            </QueryClientProvider>
        );
    }

    return {Wrapper, queryClient, router};
}

/** Renders inside the same providers the app uses, and exposes the router for navigation assertions. */
export function renderWithProviders(ui: ReactElement, options: Options = {}) {
    const {Wrapper, queryClient, router} = makeWrapper(options);
    const result = render(ui, {wrapper: Wrapper});
    return {...result, queryClient, router, location: () => router.state.location};
}

export function renderHookWithProviders<T>(hook: () => T, options: Options = {}) {
    const {Wrapper, queryClient, router} = makeWrapper(options);
    const result = renderHook(hook, {wrapper: Wrapper});
    return {...result, queryClient, router, location: () => router.state.location};
}
