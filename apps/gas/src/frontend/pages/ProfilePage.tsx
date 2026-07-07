import { UserDetail } from '@/components/user/UserDetail';
import { useAuth } from '../hooks/useAuth';

export const ProfilePage = () => {
    const { userId } = useAuth();
    return <UserDetail editable={true} id={userId!} />;
};
