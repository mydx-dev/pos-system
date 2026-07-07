import { Employee } from '@mydx-pos/shared/domain/entity/Employee';
import {
    Combobox,
    ComboboxContent,
    ComboboxInput,
    ComboboxItem,
    ComboboxList,
} from '@/components/ui/combobox';
import { BadgeCheck } from 'lucide-react';

type StaffComboboxProps = {
    employees: Employee[];
    value: string;
    onValueChange: (value: string) => void;
    onStaffChange: (staffId: string) => void;
};

const staffLabel = (employee: Employee) =>
    employee.user?.name ?? employee.userId;

export const StaffCombobox = ({
    employees,
    value,
    onValueChange,
    onStaffChange,
}: StaffComboboxProps) => {
    return (
        <Combobox
            value={value}
            onValueChange={(nextValue) => {
                const label = nextValue ?? '';
                const employee = employees.find(
                    (employee) => staffLabel(employee) === label
                );

                onValueChange(label);
                onStaffChange(employee?.userId ?? '');
            }}
        >
            <ComboboxInput placeholder="スタッフを選択してください" />
            <ComboboxContent>
                <ComboboxList>
                    {employees.map((employee) => (
                        <ComboboxItem
                            key={employee.userId}
                            value={staffLabel(employee)}
                        >
                            <BadgeCheck className="size-4 text-on-surface-variant" />
                            <span>{staffLabel(employee)}</span>
                        </ComboboxItem>
                    ))}
                </ComboboxList>
            </ComboboxContent>
        </Combobox>
    );
};
