export const CategoryItem = ({
    value,
    onChange,
    onDelete,
}: {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onDelete: () => void;
}) => {
    return (
        <div className="category-row group flex items-center gap-md p-sm bg-surface rounded-lg border border-transparent hover:border-outline-variant transition-all">
            <input
                className="flex-1 pl-10 py-2 bg-transparent border-none font-body-md text-body-md text-primary"
                type="text"
                value={value}
                onChange={onChange}
            />
            <button
                className="delete-btn opacity-0 group-hover:opacity-100 p-xs text-on-surface-variant hover:text-error transition-all active:scale-90"
                onClick={onDelete}
            >
                <span className="material-symbols-outlined" data-icon="delete">
                    delete
                </span>
            </button>
        </div>
    );
};
