import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export const TopBar: React.FC = () => {
  const { user } = useAuth();

  const getRoleColor = () => {
    switch (user?.role) {
      case 'administrator': return 'bg-blue-100 text-blue-800';
      case 'tergovchi': return 'bg-green-100 text-green-800';
      case 'rahbariyat': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleLabel = () => {
    switch (user?.role) {
      case 'administrator': return 'Administrator';
      case 'tergovchi': return 'Tergovchi';
      case 'rahbariyat': return 'Rahbariyat';
      default: return 'Foydalanuvchi';
    }
  };

  return (
    <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">
          Ashyoviy Dalillar Hisobi Tizimi
        </h1>
      </div>
      
      <div className="flex items-center space-x-4">
        <Badge className={cn(getRoleColor())}>
          {getRoleLabel()}
        </Badge>
        <div className="text-sm text-gray-600">
          {user?.name}
        </div>
      </div>
    </div>
  );
};