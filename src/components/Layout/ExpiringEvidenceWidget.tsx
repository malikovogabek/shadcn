import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { mockEvidence } from '@/lib/mockData';
import { useAuth } from '@/contexts/AuthContext';
import { AlertTriangle, Calendar } from 'lucide-react';

export const ExpiringEvidenceWidget: React.FC = () => {
  const { user } = useAuth();

  // Filter evidence based on user role
  const userEvidence = user?.role === 'tergovchi' 
    ? mockEvidence.filter(e => e.enteredBy === user.username)
    : mockEvidence;

  // Get evidence expiring in the next 6 days
  const today = new Date();
  const expiringInSixDays = userEvidence.filter(e => {
    if (e.storageType === 'lifetime' || e.status !== 'active') return false;
    const deadline = new Date(e.storageDeadline);
    const diffTime = deadline.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 6;
  }).sort((a, b) => {
    const deadlineA = new Date(a.storageDeadline).getTime();
    const deadlineB = new Date(b.storageDeadline).getTime();
    return deadlineA - deadlineB;
  });

  const calculateRemainingDays = (deadline: string) => {
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  if (expiringInSixDays.length === 0) {
    return null;
  }

  return (
    <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center space-x-2 text-orange-700">
          <img src="/assets/expiring-soon.png" alt="Muddati tugayotgan" className="h-6 w-6" />
          <span>Muddati Yaqinlashayotgan Dalillar</span>
          <Badge variant="destructive" className="ml-2">
            {expiringInSixDays.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {expiringInSixDays.map((evidence) => {
            const remainingDays = calculateRemainingDays(evidence.storageDeadline);
            return (
              <div 
                key={evidence.id} 
                className="flex items-center justify-between p-3 bg-white rounded-lg border border-yellow-200 hover:shadow-md transition-shadow"
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="h-4 w-4 text-orange-500" />
                    <span className="font-medium text-gray-900">{evidence.evidenceNumber}</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1 truncate max-w-md">
                    {evidence.eventDetails}
                  </p>
                  <div className="flex items-center space-x-2 mt-1 text-xs text-gray-500">
                    <Calendar className="h-3 w-3" />
                    <span>Saqlash muddati: {evidence.storageDeadline}</span>
                  </div>
                </div>
                <div className="ml-4">
                  <Badge 
                    variant="destructive"
                    className={
                      remainingDays === 0 ? 'bg-red-600' :
                      remainingDays <= 2 ? 'bg-orange-600' :
                      'bg-yellow-600'
                    }
                  >
                    {remainingDays === 0 ? 'Bugun tugaydi!' : `${remainingDays} kun qoldi`}
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};