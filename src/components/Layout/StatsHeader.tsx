import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { evidenceApi } from "@/api/evidence";
import { Evidence } from "@/types";
import { statisticsApi } from "@/api/statistics";
import { ExpiringEvidenceWidget } from "./ExpiringEvidenceWidget";
import {
  FileText,
  Clock,
  AlertTriangle,
  CheckCircle,
  Trash2,
  Calendar,
  Archive,
  Users,
  TrendingUp,
} from "lucide-react";

interface StatCardProps {
  title: string;
  count: number;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  count,
  icon,
  color,
  bgColor,
}) => {
  return (
    <Card
      className={`${bgColor} border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div
              className={`p-2 rounded-lg ${
                color === "text-blue-600"
                  ? "bg-blue-100"
                  : color === "text-yellow-600"
                  ? "bg-yellow-100"
                  : color === "text-red-600"
                  ? "bg-red-100"
                  : color === "text-green-600"
                  ? "bg-green-100"
                  : color === "text-gray-600"
                  ? "bg-gray-100"
                  : color === "text-purple-600"
                  ? "bg-purple-100"
                  : color === "text-orange-600"
                  ? "bg-orange-100"
                  : "bg-gray-100"
              }`}>
              <div className={color}>{icon}</div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">{title}</p>
              <p className={`text-2xl font-bold ${color}`}>{count}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export const StatsHeader: React.FC = () => {
  const { user } = useAuth();
  const [backendEvidence, setBackendEvidence] = useState<Evidence[] | null>(
    null
  );
  const [backendCounts, setBackendCounts] = useState<{
    total?: number;
    active?: number;
    completed?: number;
    removed?: number;
    expiring?: number;
    expired?: number;
    thisMonth?: number;
    lifetime?: number;
    today?: number;
  } | null>(null);

  useEffect(() => {
    (async () => {
      const data = await evidenceApi.list();
      if (!data) return;
      const maybeObj = data as unknown as
        | { data?: unknown[]; items?: unknown[] }
        | unknown;
      const items: unknown[] = Array.isArray(
        (maybeObj as { data?: unknown[] }).data
      )
        ? ((maybeObj as { data?: unknown[] }).data as unknown[])
        : Array.isArray((maybeObj as { items?: unknown[] }).items)
        ? ((maybeObj as { items?: unknown[] }).items as unknown[])
        : Array.isArray(maybeObj)
        ? (maybeObj as unknown[])
        : [];
      const mapped: Evidence[] = items.map((raw, idx: number) => {
        const it = raw as Record<string, unknown>;
        return {
          id: String(it.id ?? idx + 1),
          evidenceNumber:
            (it.name as string) ?? (it.caseNumber as string) ?? `EV-${idx + 1}`,
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
          storageType:
            (it.category as string) === "LIFETIME"
              ? "lifetime"
              : "specific_date",
          status: "active",
          createdAt: new Date().toISOString(),
        };
      });
      setBackendEvidence(mapped);
    })();
  }, [user?.username]);

  useEffect(() => {
    (async () => {
      const res = await statisticsApi.dashboard();
      const payload = (res as { data?: unknown }).data ?? res;
      if (!payload) return;
      const obj = payload as Record<string, unknown>;
      setBackendCounts({
        total: (obj.total as number) ?? undefined,
        active: (obj.active as number) ?? undefined,
        completed: (obj.completed as number) ?? undefined,
        removed: (obj.removed as number) ?? undefined,
        expiring: (obj.expiring as number) ?? undefined,
        expired: (obj.expired as number) ?? undefined,
        thisMonth: (obj.thisMonth as number) ?? undefined,
        lifetime: (obj.lifetime as number) ?? undefined,
        today: (obj.today as number) ?? undefined,
      });

      // If user is investigator, prefer per-user stats
      if (user?.id && user.role === "tergovchi") {
        const userRes = await statisticsApi.user(user.id);
        const userPayload = (userRes as { data?: unknown }).data ?? userRes;
        if (userPayload) {
          const u = userPayload as Record<string, unknown>;
          setBackendCounts({
            total: (u.total as number) ?? undefined,
            active: (u.active as number) ?? undefined,
            completed: (u.completed as number) ?? undefined,
            removed: (u.removed as number) ?? undefined,
            expiring: (u.expiring as number) ?? undefined,
            expired: (u.expired as number) ?? undefined,
            thisMonth: (u.thisMonth as number) ?? undefined,
            lifetime: (u.lifetime as number) ?? undefined,
            today: (u.today as number) ?? undefined,
          });
        }
      }
    })();
  }, [user?.id, user?.role]);

  // Filter evidence based on user role
  const sourceEvidence = backendEvidence ?? [];
  const userEvidence =
    user?.role === "tergovchi"
      ? sourceEvidence.filter(
          (e) => !e.enteredBy || e.enteredBy === user.username
        )
      : sourceEvidence;

  // Calculate statistics
  const totalEvidence = backendCounts?.total ?? userEvidence.length;
  const activeEvidence =
    backendCounts?.active ??
    userEvidence.filter((e) => e.status === "active").length;
  const completedEvidence =
    backendCounts?.completed ??
    userEvidence.filter((e) => e.status === "completed").length;
  const removedEvidence =
    backendCounts?.removed ??
    userEvidence.filter((e) => e.status === "removed").length;

  // Calculate expiring and expired evidence
  const today = new Date();
  const expiringEvidence =
    backendCounts?.expiring ??
    userEvidence.filter((e) => {
      if (e.storageType === "lifetime") return false;
      const deadline = new Date(e.storageDeadline);
      const diffTime = deadline.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 30 && diffDays > 0;
    }).length;

  const expiredEvidence =
    backendCounts?.expired ??
    userEvidence.filter((e) => {
      if (e.storageType === "lifetime") return false;
      const deadline = new Date(e.storageDeadline);
      return deadline < today;
    }).length;

  // Calculate evidence added this month
  const thisMonth =
    backendCounts?.thisMonth ??
    userEvidence.filter((e) => {
      const createdDate = new Date(e.createdAt);
      const currentMonth = today.getMonth();
      const currentYear = today.getFullYear();
      return (
        createdDate.getMonth() === currentMonth &&
        createdDate.getFullYear() === currentYear
      );
    }).length;

  // Calculate evidence with lifetime storage
  const lifetimeEvidence =
    backendCounts?.lifetime ??
    userEvidence.filter((e) => e.storageType === "lifetime").length;

  // Calculate evidence added today
  const todayEvidence =
    backendCounts?.today ??
    userEvidence.filter((e) => {
      const createdDate = new Date(e.createdAt);
      return createdDate.toDateString() === today.toDateString();
    }).length;

  const stats = [
    {
      title: "Jami Ashyoviy dalillar",
      count: totalEvidence,
      icon: <FileText className="h-5 w-5" />,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Faol Ashyoviy dalillar",
      count: activeEvidence,
      icon: <TrendingUp className="h-5 w-5" />,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Muddati Tugayotganlar",
      count: expiringEvidence,
      icon: <Clock className="h-5 w-5" />,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
    },
    {
      title: "Muddati Tugaganlar",
      count: expiredEvidence,
      icon: <AlertTriangle className="h-5 w-5" />,
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
    {
      title: "Tugallangan Ashyoviy dalillar",
      count: completedEvidence,
      icon: <CheckCircle className="h-5 w-5" />,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Chiqarilgan Ashyoviy dalillar",
      count: removedEvidence,
      icon: <Trash2 className="h-5 w-5" />,
      color: "text-gray-600",
      bgColor: "bg-gray-50",
    },
    {
      title: "Bu Oy Qo'shilgan",
      count: thisMonth,
      icon: <Calendar className="h-5 w-5" />,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Umrbod Saqlanadigan",
      count: lifetimeEvidence,
      icon: <Archive className="h-5 w-5" />,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      title: "Bugun Qo'shilgan",
      count: todayEvidence,
      icon: <Users className="h-5 w-5" />,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
  ];

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4 space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">
          {user?.role === "tergovchi"
            ? "Mening Statistikam"
            : "Umumiy Statistika"}
        </h2>
        <p className="text-sm text-gray-600">
          Ashyoviy dalillar bo'yicha umumiy ma'lumotlar
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {stats.map((stat, index) => (
          <StatCard
            key={index}
            title={stat.title}
            count={stat.count}
            icon={stat.icon}
            color={stat.color}
            bgColor={stat.bgColor}
          />
        ))}
      </div>

      {/* Expiring Evidence Widget */}
      <ExpiringEvidenceWidget />
    </div>
  );
};
