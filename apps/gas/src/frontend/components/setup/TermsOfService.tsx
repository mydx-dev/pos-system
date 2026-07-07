import { Terms } from '@/../shared/domain/valueObject/Terms';
import { useInitialize } from '@/hooks/useInitialize';
import { server } from '@/lib/AppsScriptClient';
import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { routes } from '../../../shared/routes';

export const TermsOfService = () => {
    const [agreed, setAgreed] = useState(false);
    const terms = new Terms();
    const { acceptTerms } = useInitialize();
    const navigate = useNavigate();
    const { isPending, mutate } = useMutation({
        mutationFn: () => server.acceptTerms(),
        onSuccess: () => {
            acceptTerms();
            navigate(routes.user.login);
        },
        onError: () => {
            toast.error('利用規約の同意に失敗しました。再度お試しください。');
        },
    });

    return (
        <>
            <div className="p-6 lg:p-12">
                <div className="flex-1 min-h-[240px] bg-surface-container-low rounded-xl p-6 overflow-y-auto custom-scrollbar border border-outline-variant/10">
                    <h3 className="font-headline font-bold text-xl text-primary">
                        利用規約の確認
                    </h3>
                    <p className="text-on-surface-variant text-sm mb-4">
                        本システムをご利用いただく前に、以下の利用規約をご一読ください。
                    </p>
                    {/* Scrollable Terms Box */}
                    <div className="space-y-2 max-h-[420px] overflow-y-auto custom-scrollbar px-2 py-4 border border-outline-variant/20 rounded-lg bg-surface-container-high">
                        <article className="prose prose-sm max-w-none text-on-surface-variant space-y-4">
                            {terms.articles.map((article) => (
                                <>
                                    <h4 className="font-bold text-primary">
                                        {article.title}
                                    </h4>
                                    <p>{article.body}</p>
                                </>
                            ))}
                        </article>
                    </div>
                    {/* Agreement Checkbox */}
                    <label className="flex items-center space-x-3 cursor-pointer group p-3 rounded-lg hover:bg-surface-container-low transition-colors">
                        <div className="relative flex items-center">
                            <input
                                className="peer h-5 w-5 appearance-none rounded border border-outline-variant checked:bg-primary-container checked:border-primary-container focus:ring-primary focus:ring-offset-0 transition-all"
                                id="agreeCheckbox"
                                type="checkbox"
                                checked={agreed}
                                onChange={(e) => setAgreed(e.target.checked)}
                            />
                            <span className="material-symbols-outlined absolute text-white text-sm left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 scale-0 peer-checked:scale-100 transition-transform">
                                check
                            </span>
                        </div>
                        <span className="font-label font-medium text-sm text-on-surface select-none">
                            利用規約に同意します
                        </span>
                    </label>
                </div>
                {/* Footer Actions */}
                <div className="mt-10 pt-6 border-t border-outline-variant/10 flex items-center justify-between">
                    <button
                        className="px-10 py-3 bg-primary-container text-white rounded-lg font-bold text-sm shadow-lg shadow-primary-container/20 hover:shadow-primary-container/30 active:scale-95 transition-all disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed flex items-center space-x-2"
                        disabled={!agreed || isPending}
                        onClick={() => mutate()}
                    >
                        <span>次へ</span>
                        <span className="material-symbols-outlined text-lg">
                            arrow_forward
                        </span>
                    </button>
                </div>
            </div>
        </>
    );
};
