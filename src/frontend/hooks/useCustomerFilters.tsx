import {
    parseAsBoolean,
    parseAsInteger,
    parseAsString,
    useQueryState,
} from 'nuqs';

export const useCustomerFilters = () => {
    const [name, setName] = useQueryState(
        'name',
        parseAsString.withDefault('')
    );
    const [staffId, setStaffId] = useQueryState(
        'staffId',
        parseAsString.withDefault('')
    );
    const [isStaffFixed, setIsStaffFixed] = useQueryState(
        'fixed',
        parseAsBoolean
    );
    const [birthMonth, setBirthMonth] = useQueryState(
        'birthMonth',
        parseAsInteger
    );
    const [lastVisitMonthsAgo, setLastVisitMonthsAgo] = useQueryState(
        'lastVisitMonthsAgo',
        parseAsInteger
    );
    const [sort, setSort] = useQueryState(
        'sort',
        parseAsString.withDefault('name')
    );

    const clearFilters = () => {
        setName('');
        setStaffId('');
        setIsStaffFixed(null);
        setBirthMonth(null);
        setLastVisitMonthsAgo(null);
        setSort('name');
    };

    return {
        name,
        setName,
        staffId,
        setStaffId,
        isStaffFixed,
        setIsStaffFixed,
        birthMonth,
        setBirthMonth,
        lastVisitMonthsAgo,
        setLastVisitMonthsAgo,
        sort,
        setSort,
        clearFilters,
    };
};
