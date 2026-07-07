import { Outlet } from 'react-router-dom';
import { BottomNav } from './BottomNav';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

export const AuthedLayout = () => {
    return (
        <>
            <Header />

            <div className="flex pt-16">
                <Sidebar />

                <main className="flex-1 min-w-0 p-4 pb-20">
                    <Outlet />
                </main>
            </div>

            <BottomNav />
        </>
    );
};
