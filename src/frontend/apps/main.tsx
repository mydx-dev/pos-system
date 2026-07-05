import { AuthProvider } from '@/context/AuthContext';
import { InitializeProvider } from '@/context/InitializeContext';
import { RegisterTerminalAuthProvider } from '@/context/RegisterTerminalAuthContext';
import { AdminGuard } from '@/guards/AdminGuard';
import { AuthGuard } from '@/guards/AuthGuard';
import { InitializeGuard } from '@/guards/InitializeGuard';
import { RegisterGuard } from '@/guards/RegisterGuard';
import { RegisterLayout } from '@/layouts/register/RegisterLayout';
import { CreateCustomerPage } from '@/pages/CreateCustomerPage';
import { CreateEmployeePage } from '@/pages/CreateEmployeePage';
import { CreateTreatmentPage } from '@/pages/CreateTreatmentPage';
import { CreateUserPage } from '@/pages/CreateUserPage';
import { CustomerListPage } from '@/pages/CustomerListPage';
import { EmployeeDetailPage } from '@/pages/EmployeeDetailPage';
import { EmployeeListPage } from '@/pages/EmployeeListPage';
import { ForgotPasswordPage } from '@/pages/ForgotPasswordPage';
import { LoginPage } from '@/pages/LoginPage';
import { MenuCategoryListModal } from '@/pages/MenuCategoryListModal';
import { MenuListPage } from '@/pages/MenuListPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { RegisterTerminalListPage } from '@/pages/RegisterTerminalListPage';
import { RegisterTerminalLoginPage } from '@/pages/RegisterTerminalLoginPage';
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
                                <RegisterTerminalAuthProvider>
                                    <Routes>
                                        <Route element={<GuestLayout />}>
                                            <Route
                                                path={routes.system.initialize}
                                                element={<InitializePage />}
                                            />
                                            <Route
                                                path={
                                                    routes.user.forgotPassword
                                                }
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
                                                            to={
                                                                routes.user
                                                                    .login
                                                            }
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
                                            <Route
                                                path={routes.register.login}
                                                element={
                                                    <RegisterTerminalLoginPage />
                                                }
                                            />
                                            <Route element={<RegisterGuard />}>
                                                <Route
                                                    element={<RegisterLayout />}
                                                >
                                                    <Route
                                                        path={
                                                            routes.register
                                                                .cashier
                                                        }
                                                        element={<></>}
                                                    />
                                                </Route>
                                            </Route>
                                            <Route element={<AuthGuard />}>
                                                {/* 認証が必要なルート */}
                                                <Route
                                                    element={<AuthedLayout />}
                                                >
                                                    <Route
                                                        path={
                                                            routes.user.profile
                                                        }
                                                        element={
                                                            <ProfilePage />
                                                        }
                                                    />
                                                    <Route
                                                        path={routes.user.list}
                                                        element={
                                                            <UserListPage />
                                                        }
                                                    />
                                                    <Route
                                                        path={
                                                            routes.user.detail
                                                                .path
                                                        }
                                                        element={
                                                            <UserDetailPage />
                                                        }
                                                    />
                                                    <Route
                                                        path={
                                                            routes.user.edit
                                                                .path
                                                        }
                                                        element={
                                                            <UserEditPage />
                                                        }
                                                    />
                                                    <Route
                                                        path={
                                                            routes.customer.list
                                                        }
                                                        element={
                                                            <CustomerListPage />
                                                        }
                                                    />
                                                    <Route
                                                        path={
                                                            routes.customer
                                                                .create
                                                        }
                                                        element={
                                                            <CreateCustomerPage />
                                                        }
                                                    />
                                                    <Route
                                                        path={
                                                            routes.treatment
                                                                .create
                                                        }
                                                        element={
                                                            <CreateTreatmentPage />
                                                        }
                                                    />
                                                    <Route
                                                        element={<AdminGuard />}
                                                    >
                                                        <Route
                                                            path={
                                                                routes.employee
                                                                    .create
                                                            }
                                                            element={
                                                                <CreateEmployeePage />
                                                            }
                                                        />
                                                        <Route
                                                            path={
                                                                routes.employee
                                                                    .list
                                                            }
                                                            element={
                                                                <EmployeeListPage />
                                                            }
                                                        />
                                                        <Route
                                                            path={
                                                                routes.employee
                                                                    .detail.path
                                                            }
                                                            element={
                                                                <EmployeeDetailPage />
                                                            }
                                                        />
                                                        <Route
                                                            path={
                                                                routes.menu.list
                                                            }
                                                            element={
                                                                <MenuListPage />
                                                            }
                                                        />
                                                        <Route
                                                            path={
                                                                routes
                                                                    .registerTerminal
                                                                    .list
                                                            }
                                                            element={
                                                                <RegisterTerminalListPage />
                                                            }
                                                        />
                                                        <Route
                                                            path={
                                                                routes.menu
                                                                    .categories
                                                            }
                                                            element={
                                                                <MenuCategoryListModal />
                                                            }
                                                        />
                                                    </Route>
                                                </Route>
                                            </Route>
                                        </Route>
                                    </Routes>
                                </RegisterTerminalAuthProvider>
                            </AuthProvider>
                        </HashNuqsAdapter>
                    </HashRouter>
                </InitializeProvider>
                <Toaster />
            </QueryClientProvider>
        </AppsScriptRouter>
    </StrictMode>
);
