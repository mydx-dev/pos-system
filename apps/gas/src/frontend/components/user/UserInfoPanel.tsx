export const UserInfoPanel = ({
    title,
    children,
}: {
    title: string;
    children: React.ReactNode;
}) => {
    return (
        <div className="bg-surface-container-lowest p-8 rounded-full shadow-sm w-full">
            <h3 className="text-xs font-label font-bold text-primary-container uppercase tracking-widest mb-6">
                {title}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {children}
            </div>
        </div>
    );
};
