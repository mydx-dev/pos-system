import { Outlet } from 'react-router-dom';
import { icon, systemName } from '../../../shared/config';

export const GuestLayout = () => {
    return (
        <div className="font-body text-on-surface min-h-screen flex flex-col items-center justify-center p-6">
            {/* Brand Header */}
            <header className="mb-12 flex flex-col items-center">
                <div className="mb-6 bg-primary-container p-4 rounded-full flex items-center justify-center">
                    <span
                        className="material-symbols-outlined text-tertiary-fixed text-4xl"
                        data-icon="account_tree"
                    >
                        {icon}
                    </span>
                </div>
                <h1 className="font-headline text-2xl tracking-tighter text-primary">
                    {systemName}
                </h1>
            </header>
            {/* Main Login Card */}
            <main className="w-full max-w-xl">
                <Outlet />
            </main>
            {/* Footer Branding/Policy */}
            <footer className="mt-16 text-center">
                <p className="text-outline text-[10px] font-medium tracking-widest uppercase">
                    © 2026 {systemName}. All rights reserved.
                </p>
            </footer>
            {/* Background Decoration Images (Abstract Shapes for Premium Feel) */}
            <div className="fixed top-0 left-0 -z-10 w-full h-full opacity-40 pointer-events-none">
                <img
                    className="w-full h-full object-cover"
                    data-alt="A sophisticated abstract background featuring soft fluid shapes in shades of deep navy blue and pale mint green. The scene is illuminated by gentle, diffused lighting creating a professional and calm business atmosphere. The aesthetic is clean, minimalist, and perfectly aligned with a high-end corporate digital interface, emphasizing depth through subtle color transitions and tonal layering."
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCk_1NsvabtnJ0Dy-Pqv69kcddhtqN43Vzyq9h-MAN1XU27nsOqYrQ_uUelfHVqcox0NZrO8PiGyh9R_y0DZdv8QLjosB8TbiV_Fa_7espkl3mm4LZbJQ8QRyh8RKJaS8YkxQISmBQaMICjLYmmDNEWPzCMfHoR_7YSs1QTR7xyckVdBMUmGA02wFLMcJ7JOYs8WSwp4HxweQWXLX8ex00uEWmL5j3efLq0T7y6FcsWhs1ZDgBwfzhf81wPBbVwYRGPU_82S6ZFXeN-"
                />
            </div>
        </div>
    );
};
