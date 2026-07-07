import { Field, FieldLabel } from '@/components/ui/field';
import {
    InputGroup,
    InputGroupAddon,
    InputGroupInput,
} from '@/components/ui/input-group';
import { Search } from 'lucide-react';
import { useUserFilters } from '../../hooks/useUserFilter';

export const UserNameFilter = () => {
    const { name, setName } = useUserFilters();

    return (
        <Field orientation="vertical">
            <FieldLabel className="font-['Inter'] font-semibold text-[10px] uppercase tracking-wider text-outline block">
                ユーザー名
            </FieldLabel>
            <InputGroup>
                <InputGroupAddon align="inline-start">
                    <Search className="size-4 text-outline" />
                </InputGroupAddon>
                <InputGroupInput
                    type="text"
                    value={name || ''}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="ユーザー名を入力"
                />
            </InputGroup>
        </Field>
    );
};
