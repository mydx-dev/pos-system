export interface Task {
    title: string;
    description: React.ReactNode;
    moreInfo?: React.ReactNode;
    onComplete: () => void;
    checked: boolean;
}

export const SetupTask = ({ task }: { task: Task }) => {
    return (
        <div
            className={
                'group relative flex gap-6 p-5 rounded-xl border border-transparent hover:bg-surface-container-low transition-all duration-300' +
                (task.checked ? ' opacity-60' : '')
            }
        >
            <div className="flex-shrink-0">
                <button
                    className={
                        'w-7 h-7 rounded-lg border-2 border-outline flex items-center justify-center transition-all' +
                        (task.checked
                            ? ' bg-tertiary-fixed border-tertiary-fixed task-completed'
                            : '')
                    }
                    onClick={task.onComplete}
                >
                    <span className="material-symbols-outlined text-white text-sm hidden">
                        check
                    </span>
                </button>
            </div>

            <div className="flex-grow">
                <h3 className="font-bold text-primary mb-1">{task.title}</h3>

                <p className="text-sm text-on-surface-variant leading-relaxed">
                    {task.description}
                </p>

                {task.moreInfo}
            </div>
        </div>
    );
};
