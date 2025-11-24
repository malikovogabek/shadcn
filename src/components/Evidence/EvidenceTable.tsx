import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Evidence } from "@/types";
import { Eye, AlertTriangle, Search, Filter, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { evidenceApi } from "@/api/evidence";
import { formatStorageDeadline } from "@/lib/utils";

interface EvidenceTableProps {
  evidenceList?: Evidence[];
  showActions?: boolean;
  title?: string;
  showFilters?: boolean;
}

export const EvidenceTable: React.FC<EvidenceTableProps> = ({
  evidenceList = [],
  showActions = true,
  title = "Ashyoviy Dalillar",
  showFilters = false,
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [loadingEvidenceId, setLoadingEvidenceId] = useState<string | null>(
    null
  );
  const [showLoadingDialog, setShowLoadingDialog] = useState(false);
  const [showNotFoundDialog, setShowNotFoundDialog] = useState(false);

  const isExpiringSoon = (deadline: string) => {
    const deadlineDate = new Date(deadline);
    const today = new Date();
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 30 && diffDays > 0;
  };

  const isExpired = (deadline: string) => {
    const deadlineDate = new Date(deadline);
    const today = new Date();
    return deadlineDate < today;
  };

  const handleViewEvidence = async (evidenceId: string) => {
    setLoadingEvidenceId(evidenceId);
    setShowLoadingDialog(true);

    try {
      // 5 soniya timeout bilan ma'lumotni yuklashga urinamiz
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Timeout")), 5000)
      );

      // Ma'lumotni yuklash
      const dataPromise = evidenceApi.getById(evidenceId);

      // Ikki promisening birini kutamiz (ma'lumot yoki timeout)
      const data = await Promise.race([dataPromise, timeoutPromise]);

      // Ma'lumot topildi, tekshiramiz
      const payload = data as { data?: unknown } | unknown;
      const raw = (payload as { data?: unknown }).data ?? payload;

      if (raw) {
        // Ma'lumot topildi, dialog yopamiz va navigate qilamiz
        setShowLoadingDialog(false);
        navigate(`/evidence/${evidenceId}`);
      } else {
        // Ma'lumot topilmadi, lekin 5 soniya o'tmagan, shunchaki navigate qilamiz
        // EvidenceDetails sahifasida o'zi "topilmadi" ko'rsatadi
        setShowLoadingDialog(false);
        navigate(`/evidence/${evidenceId}`);
      }
    } catch (err) {
      // Xatolik yoki timeout bo'lsa (5 soniyadan oshib ketsa)
      setShowLoadingDialog(false);
      setShowNotFoundDialog(true);
    } finally {
      setLoadingEvidenceId(null);
    }
  };

  // Filter evidence based on user role and filters
  let filteredEvidence =
    user?.role === "tergovchi"
      ? evidenceList.filter((e) => e.enteredBy === user.username)
      : evidenceList;

  // Apply search filter
  if (searchTerm) {
    filteredEvidence = filteredEvidence.filter(
      (e) =>
        e.evidenceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.eventDetails.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.belongsTo.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  // Apply status filter
  if (statusFilter !== "all") {
    filteredEvidence = filteredEvidence.filter(
      (e) => e.status === statusFilter
    );
  }

  // Apply date filter
  if (dateFilter !== "all") {
    const today = new Date();
    filteredEvidence = filteredEvidence.filter((e) => {
      const createdDate = new Date(e.createdAt);
      const diffTime = today.getTime() - createdDate.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      switch (dateFilter) {
        case "today":
          return diffDays <= 1;
        case "week":
          return diffDays <= 7;
        case "month":
          return diffDays <= 30;
        default:
          return true;
      }
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          {title}
          <Badge variant="secondary">
            {filteredEvidence.length} ta ashyoviy dalil
          </Badge>
        </CardTitle>

        {showFilters && (
          <div className="flex flex-wrap gap-4 mt-4">
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-gray-500" />
              <Input
                placeholder="Qidiruv..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Barcha holatlar</SelectItem>
                  <SelectItem value="active">Faol</SelectItem>
                  <SelectItem value="completed">Tugallangan</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Barcha sanalar</SelectItem>
                  <SelectItem value="today">Bugun</SelectItem>
                  <SelectItem value="week">Bu hafta</SelectItem>
                  <SelectItem value="month">Bu oy</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Ashyoviy dalil raqami</TableHead>
              <TableHead>Tavsif</TableHead>
              <TableHead>Saqlash muddati</TableHead>
              <TableHead>Holat</TableHead>
              {showActions && <TableHead>Amallar</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEvidence.map((evidence) => (
              <TableRow key={evidence.id}>
                <TableCell>{evidence.id}</TableCell>
                <TableCell className="font-medium">
                  {evidence.evidenceNumber}
                </TableCell>
                <TableCell className="max-w-xs truncate">
                  {evidence.eventDetails}
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <span>
                      {evidence.storageType === "lifetime"
                        ? "Umrbod"
                        : formatStorageDeadline(evidence.storageDeadline)}
                    </span>
                    {evidence.storageType === "specific_date" && (
                      <>
                        {isExpired(evidence.storageDeadline) && (
                          <AlertTriangle className="h-4 w-4 text-red-500" />
                        )}
                        {isExpiringSoon(evidence.storageDeadline) &&
                          !isExpired(evidence.storageDeadline) && (
                            <AlertTriangle className="h-4 w-4 text-yellow-500" />
                          )}
                      </>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      evidence.status === "completed" ? "default" : "secondary"
                    }
                  >
                    {evidence.status === "completed" ? "Tugallangan" : "Faol"}
                  </Badge>
                </TableCell>
                {showActions && (
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewEvidence(evidence.id)}
                      disabled={loadingEvidenceId === evidence.id}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Ko'rish
                    </Button>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {filteredEvidence.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Hech qanday ashyoviy dalil topilmadi
          </div>
        )}
      </CardContent>

      {/* Loading dialog */}
      <Dialog open={showLoadingDialog} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Ma'lumotlar yuklanmoqda</DialogTitle>
          </DialogHeader>
          <div className="py-8 flex flex-col items-center justify-center space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
            <p className="text-gray-600 text-center">Iltimos, kuting...</p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Ma'lumot topilmadi dialog - faqat 5 soniyadan oshib ketganda */}
      <Dialog open={showNotFoundDialog} onOpenChange={setShowNotFoundDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ma'lumot topilmadi</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-gray-600">
              Ashyoviy dalil ma'lumotlari yuklash vaqti tugadi. Iltimos, qayta
              urinib ko'ring.
            </p>
          </div>
          <div className="flex justify-end">
            <Button onClick={() => setShowNotFoundDialog(false)}>Yopish</Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};
