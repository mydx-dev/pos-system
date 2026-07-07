import {
    parseAsArrayOf,
    parseAsBoolean,
    parseAsString,
    useQueryState,
} from 'nuqs';

export const useUserFilters = () => {
    const [name, setName] = useQueryState(
        'name',
        parseAsString.withDefault('')
    );

    const [statuses, setStatuses] = useQueryState(
        'status',
        parseAsArrayOf(parseAsBoolean).withDefault([true, false])
    );

    return {
        name,
        setName,
        statuses,
        setStatuses,
    };
};
