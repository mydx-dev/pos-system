import { AuthProvider } from '@/context/AuthContext';
import { InitializeProvider } from '@/context/InitializeContext';
import { AuthGuard } from '@/guards/AuthGuard';
import { InitializeGuard } from '@/guards/InitializeGuard';
import { CreateUserPage } from '@/pages/CreateUserPage';
import { ForgotPasswordPage } from '@/pages/ForgotPasswordPage';
import { LoginPage } from '@/pages/LoginPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { ResetPasswordPage } from '@/pages/ResetPasswordPage';
import { UserDetailPage } from '@/pages/UserDetailPage';
import { UserEditPage } from '@/pages/UserEditPage';
import { UserListPage } from '@/pages/UserListPage';
import {
    AppsScriptRouter,
    HashNuqsAdapter,
} from '@mydx-dev/gas-boost-react-apps-script';
import { QueryClientProvider } from '@tanstack/react-query';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Toaster } from 'sonner';
import { routes } from '../../shared/routes';
import { AuthedLayout } from '../layouts/authed/AuthedLayout';
import { GuestLayout } from '../layouts/guest/GuestLayout';
import { queryClient } from '../lib/QueryClient';
import { InitializePage } from '../pages/InitializePage';
import { NotFoundPage } from '../pages/NotFoundPage';
import './index.css';

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <AppsScriptRouter>
            <QueryClientProvider client={queryClient}>
                <InitializeProvider>
                    <HashRouter>
                        <HashNuqsAdapter>
                            <AuthProvider>
                                <Routes>
                                    <Route element={<GuestLayout />}>
                                        <Route
                                            path={routes.system.initialize}
                                            element={<InitializePage />}
                                        />
                                        <Route
                                            path={routes.user.forgotPassword}
                                            element={<ForgotPasswordPage />}
                                        />
                                        <Route
                                            path={routes.user.resetPassword}
                                            element={<ResetPasswordPage />}
                                        />
                                        <Route
                                            path={routes.system.notFound}
                                            element={<NotFoundPage />}
                                        />
                                    </Route>
                                    <Route element={<InitializeGuard />}>
                                        <Route element={<GuestLayout />}>
                                            <Route
                                                index
                                                element={
                                                    <Navigate
                                                        to={routes.user.login}
                                                        replace
                                                    />
                                                }
                                            />
                                            <Route
                                                path={routes.user.create}
                                                element={<CreateUserPage />}
                                            />
                                            <Route
                                                path={routes.user.login}
                                                element={<LoginPage />}
                                            />
                                        </Route>
                                        <Route element={<AuthGuard />}>
                                            {/* 認証が必要なルート */}
                                            <Route element={<AuthedLayout />}>
                                                <Route
                                                    path={routes.user.profile}
                                                    element={<ProfilePage />}
                                                />
                                                <Route
                                                    path={routes.user.list}
                                                    element={<UserListPage />}
                                                />
                                                <Route
                                                    path={
                                                        routes.user.detail.path
                                                    }
                                                    element={<UserDetailPage />}
                                                />
                                                <Route
                                                    path={routes.user.edit.path}
                                                    element={<UserEditPage />}
                                                />
                                            </Route>
                                        </Route>
                                    </Route>
                                </Routes>
                            </AuthProvider>
                        </HashNuqsAdapter>
                    </HashRouter>
                </InitializeProvider>
                <Toaster />
            </QueryClientProvider>
        </AppsScriptRouter>
    </StrictMode>
);
