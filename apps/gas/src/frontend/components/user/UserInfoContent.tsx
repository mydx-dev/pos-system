export const UserInfoContent = ({
    children,
}: {
    children: React.ReactNode;
}) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            <div className="md:col-span-12 space-y-8">{children}</div>
        </div>
    );
};
