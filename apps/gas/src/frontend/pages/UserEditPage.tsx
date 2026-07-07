import { UserDetail } from '@/components/user/UserDetail';
import { useParams } from 'react-router-dom';

export const UserEditPage = () => {
    const { id } = useParams<{ id: string }>();
    return <UserDetail editable={true} id={id!} />;
};
