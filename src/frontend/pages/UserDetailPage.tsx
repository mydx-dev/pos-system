import { UserDetail } from '@/components/user/UserDetail';
import { useParams } from 'react-router-dom';

export const UserDetailPage = () => {
    const { id } = useParams<{ id: string }>();
    return <UserDetail editable={false} id={id!} />;
};
