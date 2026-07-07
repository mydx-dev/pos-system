import { Checkbox } from '@/components/ui/checkbox';
import { Field, FieldGroup, FieldLabel, FieldSet } from '@/components/ui/field';
import { useUserFilters } from '../../hooks/useUserFilter';

export const UserStatusFilter = () => {
    const { statuses, setStatuses } = useUserFilters();
    const toggleStatus = (value: boolean, checked: boolean) => {
        if (checked) {
            setStatuses([...statuses, value]);
            return;
        }

        setStatuses(statuses.filter((s) => s !== value));
    };
    return (
        <FieldSet className="mt-4 flex flex-col gap-3">
            <FieldLabel className="font-['Inter'] font-semibold text-[10px] uppercase tracking-wider text-outline block">
                ステータス
            </FieldLabel>

            <FieldGroup className="flex gap-4">
                <Field
                    orientation="horizontal"
                    className="flex items-center gap-3 flex-1 px-4 py-3 bg-surface-container-low rounded-xl cursor-pointer active:scale-95 transition-transform"
                >
                    <Checkbox
                        checked={statuses.includes(true)}
                        onCheckedChange={(checked) =>
                            toggleStatus(true, checked === true)
                        }
                        id="active-user-checkbox"
                    />

                    <FieldLabel htmlFor="active-user-checkbox">有効</FieldLabel>
                </Field>

                <Field
                    orientation="horizontal"
                    className="flex items-center gap-3 flex-1 px-4 py-3 bg-surface-container-low rounded-xl cursor-pointer active:scale-95 transition-transform"
                >
                    <Checkbox
                        checked={statuses.includes(false)}
                        onCheckedChange={(checked) =>
                            toggleStatus(false, checked === true)
                        }
                        id="inactive-user-checkbox"
                    />

                    <FieldLabel htmlFor="inactive-user-checkbox">
                        無効
                    </FieldLabel>
                </Field>
            </FieldGroup>
        </FieldSet>
    );
};
