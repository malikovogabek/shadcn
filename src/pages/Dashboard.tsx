import { useEffect, useState } from "react";
import { AppBar } from "@/components/Layout/AppBar";
import { Sidebar } from "@/components/Layout/Sidebar";
import { StatsHeader } from "@/components/Layout/StatsHeader";
import { EvidenceTable } from "@/components/Evidence/EvidenceTable";
import { AddEvidenceForm } from "@/components/Evidence/AddEvidenceForm";
import { UserManagement } from "@/components/Users/UserManagement";
import { useAuth } from "@/contexts/AuthContext";

import { evidenceApi } from "@/api/evidence";
import { Evidence } from "@/types";

export default function Dashboard() {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeSection, setActiveSection] = useState("dashboard");
  const [backendEvidence, setBackendEvidence] = useState<Evidence[] | null>(
    null
  );

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

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Filter evidence based on user role
  const sourceEvidence = backendEvidence ?? [];
  const userEvidence =
    user?.role === "tergovchi"
      ? sourceEvidence.filter(
          (e) => !e.enteredBy || e.enteredBy === user.username
        )
      : sourceEvidence;

  // Filter evidence based on active section
  const getFilteredEvidence = () => {
    const today = new Date();

    switch (activeSection) {
      case "all":
        return userEvidence;
      case "active":
        return userEvidence.filter((e) => e.status === "active");
      case "expiring":
        return userEvidence.filter((e) => {
          if (e.storageType === "lifetime" || e.status !== "active")
            return false;
          const deadline = new Date(e.storageDeadline);
          const diffTime = deadline.getTime() - today.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          return diffDays <= 30 && diffDays > 0;
        });
      case "expired":
        return userEvidence.filter((e) => {
          if (e.storageType === "lifetime") return false;
          const deadline = new Date(e.storageDeadline);
          return deadline < today;
        });
      case "completed":
        return userEvidence.filter((e) => e.status === "completed");
      case "removed":
        return userEvidence.filter((e) => e.status === "removed");
      case "month":
        return userEvidence.filter((e) => {
          const createdDate = new Date(e.createdAt);
          return (
            createdDate.getMonth() === today.getMonth() &&
            createdDate.getFullYear() === today.getFullYear()
          );
        });
      case "lifetime":
        return userEvidence.filter((e) => e.storageType === "lifetime");
      case "today":
        return userEvidence.filter((e) => {
          const createdDate = new Date(e.createdAt);
          return createdDate.toDateString() === today.toDateString();
        });
      default:
        return userEvidence;
    }
  };

  const getSectionTitle = () => {
    switch (activeSection) {
      case "all":
        return "Jami Ashyoviy dalillar";
      case "active":
        return "Faol Ashyoviy dalillar";
      case "expiring":
        return "Muddati Tugayotgan Ashyoviy dalillar";
      case "expired":
        return "Muddati Tugagan Ashyoviy dalillar";
      case "completed":
        return "Tugallangan Ashyoviy dalillar";
      case "removed":
        return "Chiqarilgan Ashyoviy dalillar";
      case "month":
        return "Bu Oy Qo'shilgan Ashyoviy dalillar";
      case "lifetime":
        return "Umrbod Saqlanadigan Ashyoviy dalillar";
      case "today":
        return "Bugun Qo'shilgan Ashyoviy dalillar";
      default:
        return "Ashyoviy Dalillar";
    }
  };

  const renderContent = () => {
    if (activeSection === "add") {
      return <AddEvidenceForm />;
    }

    if (activeSection === "users" && user?.role === "admin") {
      return <UserManagement />;
    }

    if (activeSection === "dashboard") {
      return (
        <div className="space-y-6">
          <EvidenceTable
            evidenceList={userEvidence}
            showActions={true}
            title="Barcha Ashyoviy Dalillar"
            showFilters={true}
          />
        </div>
      );
    }

    return (
      <EvidenceTable
        evidenceList={getFilteredEvidence()}
        showActions={true}
        title={getSectionTitle()}
        showFilters={true}
      />
    );
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <AppBar onMenuClick={toggleSidebar} />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          isOpen={sidebarOpen}
          activeSection={activeSection}
          onSectionChange={setActiveSection}
        />

        <div className="flex-1 overflow-y-auto">
          <StatsHeader />

          <div className="p-6">{renderContent()}</div>
        </div>
      </div>
    </div>
  );
}
