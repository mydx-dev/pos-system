import { useNavigate } from 'react-router-dom';
import { routes } from '../../shared/routes';

export const NotFoundPage = () => {
    const navigate = useNavigate();
    return (
        <>
            <div className="relative z-10 max-w-2xl w-full text-center">
                {/* Asymmetric Hero Section */}
                <div className="mb-8 inline-block relative">
                    <h1 className="font-display font-extrabold text-[12rem] leading-none tracking-tighter text-primary/10 select-none">
                        404
                    </h1>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="font-display font-black text-8xl md:text-9xl text-primary text-glow">
                            404
                        </span>
                    </div>
                </div>
                <div className="space-y-6">
                    <h2 className="font-headline font-bold text-3xl md:text-4xl text-on-background tracking-tight">
                        ページが見つかりません
                    </h2>
                    <p className="font-body text-on-surface-variant text-lg max-w-md mx-auto leading-relaxed">
                        申し訳ありません。お探しのページは削除されたか、URLが変更された可能性があります。
                    </p>
                    <div className="pt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                        <a
                            onClick={() => navigate(routes.user.login)}
                            className="px-8 py-4 text-primary font-headline font-semibold hover:bg-surface-container-low rounded-xl transition-colors flex items-center gap-2 cursor-pointer"
                        >
                            <span className="material-symbols-outlined">
                                login
                            </span>
                            ログイン画面へ
                        </a>
                    </div>
                </div>
            </div>
        </>
    );
};
