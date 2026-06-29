import { NavLink } from 'react-router-dom';

export const ForgotPasswordPage = () => {
    return (
        <>
            {/* Reset Password Card */}
            <section className="w-full bg-surface-container-lowest rounded-xl shadow-[0_12px_32px_-4px_rgba(0,32,69,0.08)] p-8 relative overflow-hidden">
                {/* Subtle accent top line */}
                <header className="mb-8">
                    <h2 className="font-headline font-bold text-xl text-primary mb-3">
                        パスワードの再設定
                    </h2>
                    <p className="font-body text-sm text-on-secondary-container leading-relaxed">
                        登録済みのメールアドレスを入力してください。パスワード再設定用のリンクをお送りします。
                    </p>
                </header>
                <form className="space-y-6">
                    {/* Input Field Group */}
                    <div className="space-y-2">
                        <label
                            className="font-label text-xs font-bold text-on-surface-variant uppercase tracking-wider block"
                            htmlFor="email"
                        >
                            メールアドレス
                        </label>
                        <div className="relative">
                            <span
                                className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline text-lg"
                                data-icon="mail"
                            >
                                mail
                            </span>
                            <input
                                className="w-full pl-12 pr-4 py-4 bg-surface-container-high border-none rounded-xl text-on-background placeholder:text-outline focus:ring-2 focus:ring-surface-tint focus:bg-surface-container-lowest transition-all outline-none font-body text-sm"
                                id="email"
                                name="email"
                                placeholder="example@pipelinepro.com"
                                type="email"
                            />
                        </div>
                    </div>
                    {/* Primary Action Button */}
                    <button
                        className="w-full bg-gradient-to-br from-primary to-primary-container text-on-primary font-bold font-headline font-bold py-4 rounded-xl shadow-lg hover:shadow-xl active:scale-[0.98] transition-all flex items-center justify-center space-x-2"
                        onClick={(e) => {
                            e.preventDefault();
                        }}
                    >
                        <span>再設定メールを送信</span>
                        <span
                            className="material-symbols-outlined text-xl"
                            data-icon="send"
                        >
                            send
                        </span>
                    </button>
                </form>
                {/* Navigation Links */}
                <footer className="mt-8 pt-6 border-t border-outline-variant/15 text-center">
                    <NavLink
                        className="inline-flex items-center text-sm font-semibold text-primary hover:text-on-primary-fixed-variant transition-colors group"
                        to="/login"
                    >
                        <span
                            className="material-symbols-outlined text-lg mr-1 transition-transform group-hover:-translate-x-1"
                            data-icon="arrow_back"
                        >
                            arrow_back
                        </span>
                        <span>ログイン画面に戻る</span>
                    </NavLink>
                </footer>
            </section>
        </>
    );
};
