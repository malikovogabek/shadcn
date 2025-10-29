import {
  Home,
  Plus,
  Users,
  Clock,
  AlertTriangle,
  CheckCircle,
  Trash2,
  FileText,
  TrendingUp,
  Calendar,
  Archive,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { mockEvidence } from "@/lib/mockData";

interface SidebarProps {
  isOpen: boolean;
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  activeSection,
  onSectionChange,
}) => {
  const { user, logout } = useAuth();

  // Filter evidence based on user role
  const userEvidence =
    user?.role === "tergovchi"
      ? mockEvidence.filter((e) => e.enteredBy === user.username)
      : mockEvidence;

  // Calculate statistics
  const today = new Date();

  const stats = {
    total: userEvidence.length,
    active: userEvidence.filter((e) => e.status === "active").length,
    expiring: userEvidence.filter((e) => {
      if (e.storageType === "lifetime" || e.status !== "active") return false;
      const deadline = new Date(e.storageDeadline);
      const diffTime = deadline.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 30 && diffDays > 0;
    }).length,
    expired: userEvidence.filter((e) => {
      if (e.storageType === "lifetime") return false;
      const deadline = new Date(e.storageDeadline);
      return deadline < today;
    }).length,
    completed: userEvidence.filter((e) => e.status === "completed").length,
    removed: userEvidence.filter((e) => e.status === "removed").length,
    thisMonth: userEvidence.filter((e) => {
      const createdDate = new Date(e.createdAt);
      return (
        createdDate.getMonth() === today.getMonth() &&
        createdDate.getFullYear() === today.getFullYear()
      );
    }).length,
    lifetime: userEvidence.filter((e) => e.storageType === "lifetime").length,
    today: userEvidence.filter((e) => {
      const createdDate = new Date(e.createdAt);
      return createdDate.toDateString() === today.toDateString();
    }).length,
  };

  const menuItems = [
    {
      id: "dashboard",
      label: "Bosh sahifa",
      icon: <Home className="h-5 w-5" />,
      count: null,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      id: "all",
      label: "Jami Ashyoviy dalillar",
      icon: <FileText className="h-5 w-5" />,
      count: stats.total,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      id: "active",
      label: "Faol Ashyoviy dalillar",
      icon: <TrendingUp className="h-5 w-5" />,
      count: stats.active,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      id: "expiring",
      label: "Muddati Tugayotganlar",
      icon: <Clock className="h-5 w-5" />,
      count: stats.expiring,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
    },
    {
      id: "expired",
      label: "Muddati Tugaganlar",
      icon: <AlertTriangle className="h-5 w-5" />,
      count: stats.expired,
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
    {
      id: "completed",
      label: "Tugallangan Ashyoviy dalillar",
      icon: <CheckCircle className="h-5 w-5" />,
      count: stats.completed,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      id: "removed",
      label: "Chiqarilgan Ashyoviy dalillar",
      icon: <Trash2 className="h-5 w-5" />,
      count: stats.removed,
      color: "text-gray-600",
      bgColor: "bg-gray-50",
    },
    {
      id: "month",
      label: "Bu Oy Qo'shilgan",
      icon: <Calendar className="h-5 w-5" />,
      count: stats.thisMonth,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      id: "lifetime",
      label: "Umrbod Saqlanadigan",
      icon: <Archive className="h-5 w-5" />,
      count: stats.lifetime,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      id: "today",
      label: "Bugun Qo'shilgan",
      icon: <FileText className="h-5 w-5" />,
      count: stats.today,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
  ];

  // Add "Add Evidence" and "User Management" items for appropriate roles
  if (user?.role !== "prokuror") {
    menuItems.splice(1, 0, {
      id: "add",
      label: "Ashyoviy dalil qo'shish",
      icon: <Plus className="h-5 w-5" />,
      count: null,
      color: "text-green-600",
      bgColor: "bg-green-50",
    });
  }

  if (user?.role === "admin") {
    menuItems.push({
      id: "users",
      label: "Foydalanuvchilar",
      icon: <Users className="h-5 w-5" />,
      count: null,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
    });
  }

  const handleLogout = () => {
    if (window.confirm("Tizimdan chiqmoqchimisiz?")) {
      logout();
    }
  };

  return (
    <div
      className={`bg-white border-r border-gray-200 transition-all duration-300 flex flex-col ${
        isOpen ? "w-64" : "w-20"
      }`}>
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="space-y-1 px-2">
          {menuItems.map((item) => (
            <Button
              key={item.id}
              variant={activeSection === item.id ? "default" : "ghost"}
              className={`w-full justify-start ${
                isOpen ? "px-4" : "px-2 justify-center"
              } ${
                activeSection === item.id
                  ? `${item.bgColor} ${item.color} hover:${item.bgColor}`
                  : "hover:bg-gray-100"
              }`}
              onClick={() => onSectionChange(item.id)}>
              <div
                className={`flex items-center ${
                  isOpen ? "space-x-3" : ""
                } w-full`}>
                <span
                  className={
                    activeSection === item.id ? item.color : "text-gray-600"
                  }>
                  {item.icon}
                </span>
                {isOpen && (
                  <>
                    <span className="flex-1 text-left">{item.label}</span>
                    {item.count !== null && (
                      <Badge
                        variant="secondary"
                        className={
                          activeSection === item.id
                            ? `${item.bgColor} ${item.color}`
                            : ""
                        }>
                        {item.count}
                      </Badge>
                    )}
                  </>
                )}
              </div>
            </Button>
          ))}
        </nav>
      </div>

      {/* Logout Button at the bottom */}
      <div className="border-t border-gray-200 p-2">
        <Button
          variant="ghost"
          className={`w-full justify-start ${
            isOpen ? "px-4" : "px-2 justify-center"
          } text-red-600 hover:bg-red-50 hover:text-red-700`}
          onClick={handleLogout}>
          <div
            className={`flex items-center ${isOpen ? "space-x-3" : ""} w-full`}>
            <LogOut className="h-5 w-5" />
            {isOpen && <span className="flex-1 text-left">Chiqish</span>}
          </div>
        </Button>
      </div>
    </div>
  );
};
