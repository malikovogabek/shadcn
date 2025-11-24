import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { AlertTriangle, Calendar } from "lucide-react";
import { useEffect, useState } from "react";
import { evidenceApi } from "@/api/evidence";
import { Evidence } from "@/types";

export const ExpiringEvidenceWidget: React.FC = () => {
  const { user } = useAuth();
  const [expiringInSixDays, setExpiringInSixDays] = useState<Evidence[]>([]);

  useEffect(() => {
    (async () => {
      const data = await evidenceApi.expiring(6);
      if (!data) return;
      const maybeObj = data as unknown as { data?: unknown[] } | unknown[];
      const items: unknown[] = Array.isArray(
        (maybeObj as { data?: unknown[] }).data
      )
        ? ((maybeObj as { data?: unknown[] }).data as unknown[])
        : Array.isArray(maybeObj)
        ? (maybeObj as unknown[])
        : [];
      const mapped: Evidence[] = items
        .map((raw, idx) => {
          const it = raw as Record<string, unknown>;
          return {
            id: String(it.id ?? idx + 1),
            evidenceNumber: (it.name as string) ?? `EV-${idx + 1}`,
            eMaterialNumber: (it.caseNumber as string) ?? "",
            eventDetails: (it.description as string) ?? "",
            belongsTo: "-",
            items: "-",
            value: "mavjud emas",
            receivedDate: "",
            receivedBy: "",
            storageLocation: (it.location as string) ?? "-",
            enteredBy: user?.username ?? "",
            images: [],
            storageDeadline: (it.expiryDate as string) ?? "",
            storageType: "specific_date",
            status: "active",
            createdAt: new Date().toISOString(),
          };
        })
        .sort(
          (a, b) =>
            new Date(a.storageDeadline).getTime() -
            new Date(b.storageDeadline).getTime()
        );
      setExpiringInSixDays(mapped);
    })();
  }, [user?.username]);

  const calculateRemainingDays = (deadline: string) => {
    const deadlineDate = new Date(deadline);
    const today = new Date();
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
          <img
            src="/assets/expiring-soon.png"
            alt="Muddati tugayotgan"
            className="h-6 w-6"
          />
          <span>Muddati Yaqinlashayotgan Dalillar</span>
          <Badge variant="destructive" className="ml-2">
            {expiringInSixDays.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {expiringInSixDays.map((evidence) => {
            const remainingDays = calculateRemainingDays(
              evidence.storageDeadline
            );
            return (
              <div
                key={evidence.id}
                className="flex items-center justify-between p-3 bg-white rounded-lg border border-yellow-200 hover:shadow-md transition-shadow">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="h-4 w-4 text-orange-500" />
                    <span className="font-medium text-gray-900">
                      {evidence.evidenceNumber}
                    </span>
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
                      remainingDays === 0
                        ? "bg-red-600"
                        : remainingDays <= 2
                        ? "bg-orange-600"
                        : "bg-yellow-600"
                    }>
                    {remainingDays === 0
                      ? "Bugun tugaydi!"
                      : `${remainingDays} kun qoldi`}
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
