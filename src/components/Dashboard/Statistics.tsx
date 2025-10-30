import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, FileText, CheckCircle, AlertTriangle } from 'lucide-react';
import { usersApi } from '@/api/users';
import { evidenceApi } from '@/api/evidence';
import { useEffect, useState } from 'react';

export const Statistics: React.FC = () => {
  const [counts, setCounts] = useState({ totalUsers: 0, totalEvidence: 0, active: 0, completed: 0, expiring: 0 });

  useEffect(() => {
    (async () => {
      try {
        const ur = await usersApi.list();
        const users = Array.isArray((ur as any)?.data) ? (ur as any).data : (Array.isArray(ur) ? ur : []);
        const er = await evidenceApi.list();
        const ev = Array.isArray((er as any)?.data) ? (er as any).data : (Array.isArray(er) ? er : []);
        const active = ev.filter((e: any) => (e.status ?? 'ACTIVE') === 'ACTIVE').length;
        const completed = ev.filter((e: any) => (e.status ?? '') === 'COMPLETED').length;
        const expiring = ev.filter((e: any) => {
          const storageType = (e.category as string) === 'LIFETIME' ? 'lifetime' : 'specific_date';
          if (storageType === 'lifetime') return false;
          const deadlineDate = new Date(e.expiryDate ?? e.storageDeadline ?? '');
          const today = new Date();
          const diffTime = deadlineDate.getTime() - today.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          return diffDays <= 30 && diffDays > 0;
        }).length;
        setCounts({ totalUsers: users.length, totalEvidence: ev.length, active, completed, expiring });
      } catch {}
    })();
  }, []);

  const stats = [
    {
      title: 'Jami Foydalanuvchilar',
      value: counts.totalUsers,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Jami Dalillar',
      value: counts.totalEvidence,
      icon: FileText,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Faol Ishlar',
      value: counts.active,
      icon: CheckCircle,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100'
    },
    {
      title: 'Muddati Tugayotganlar',
      value: counts.expiring,
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-100'
    }
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-blue-700">Statistika</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-full ${stat.bgColor}`}>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Rollar bo'yicha Foydalanuvchilar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {['administrator', 'tergovchi', 'rahbariyat'].map(role => {
                const count = 0; // Backenddan kerak bo'lsa role bo'yicha alohida endpoint bilan to'ldiriladi
                const roleLabel = role === 'administrator' ? 'Administrator' : 
                                role === 'tergovchi' ? 'Tergovchi' : 'Rahbariyat';
                return (
                  <div key={role} className="flex justify-between items-center">
                    <span className="text-sm font-medium">{roleLabel}</span>
                    <span className="text-sm text-gray-600">{count} ta</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Dalillar Holati</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Faol dalillar</span>
                <span className="text-sm text-green-600">{activeEvidence} ta</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Tugallangan dalillar</span>
                <span className="text-sm text-blue-600">{completedEvidence} ta</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Muddati tugayotganlar</span>
                <span className="text-sm text-red-600">{expiringEvidence} ta</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};