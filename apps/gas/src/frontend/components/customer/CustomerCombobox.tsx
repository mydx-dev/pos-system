import { Customer } from '@/../shared/domain/entity/Customer';
import { routes } from '@/../shared/routes';
import {
    Combobox,
    ComboboxContent,
    ComboboxInput,
    ComboboxItem,
    ComboboxList,
    ComboboxSeparator,
} from '@/components/ui/combobox';
import { Plus, UserRound } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

type CustomerComboboxProps = {
    customers: Customer[];
    value: string;
    onValueChange: (value: string) => void;
    onCustomerChange: (customerId: string) => void;
};

const createCustomerLabel = '新規顧客を登録';

const customerLabel = (customer: Customer) =>
    customer.phoneNumber
        ? `${customer.name} / ${customer.phoneNumber}`
        : customer.name;

export const CustomerCombobox = ({
    customers,
    value,
    onValueChange,
    onCustomerChange,
}: CustomerComboboxProps) => {
    const navigate = useNavigate();

    return (
        <Combobox
            value={value}
            onValueChange={(nextValue) => {
                if (nextValue === createCustomerLabel) {
                    navigate(routes.customer.create);
                    return;
                }

                const label = nextValue ?? '';
                const customer = customers.find(
                    (customer) => customerLabel(customer) === label
                );

                onValueChange(label);
                onCustomerChange(customer?.id ?? '');
            }}
        >
            <ComboboxInput placeholder="顧客を選択してください" showClear />
            <ComboboxContent>
                <ComboboxList>
                    <ComboboxItem
                        value={createCustomerLabel}
                        className="font-semibold text-primary"
                    >
                        <Plus className="size-4" />
                        {createCustomerLabel}
                    </ComboboxItem>
                    <ComboboxSeparator />
                    {customers.map((customer) => (
                        <ComboboxItem
                            key={customer.id}
                            value={customerLabel(customer)}
                        >
                            <UserRound className="size-4 text-on-surface-variant" />
                            <span>{customerLabel(customer)}</span>
                        </ComboboxItem>
                    ))}
                </ComboboxList>
            </ComboboxContent>
        </Combobox>
    );
};
