import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { evidenceApi } from "@/api/evidence";
import { Evidence } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Calendar,
  User,
  MapPin,
  DollarSign,
  Printer,
} from "lucide-react";

export default function EvidenceView() {
  const { id } = useParams<{ id: string }>();
  const [evidence, setEvidence] = useState<Evidence | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      if (!id) return;
      try {
        const data = await evidenceApi.getById(id);
        const payload = data as { data?: unknown } | unknown;
        const raw = (payload as { data?: unknown }).data ?? payload;
        if (raw) {
          const it = raw as Record<string, unknown>;
          const mapped: Evidence = {
            id: String(it.id ?? id),
            evidenceNumber: (it.name as string) ?? "",
            eMaterialNumber: (it.caseNumber as string) ?? "",
            eventDetails: (it.description as string) ?? "",
            belongsTo: "-",
            items: "-",
            value: "mavjud emas",
            receivedDate: "",
            receivedBy: "",
            storageLocation: (it.location as string) ?? "-",
            enteredBy: "",
            images: [],
            storageDeadline: (it.expiryDate as string) ?? "",
            storageType: "specific_date",
            status:
              (it.status as string) === "COMPLETED"
                ? "completed"
                : (it.status as string) === "REMOVED"
                ? "removed"
                : "active",
            createdAt: (it.createdAt as string) ?? new Date().toISOString(),
          };
          setEvidence(mapped);
        }
      } catch (err) {
        console.error("Error loading evidence:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("uz-UZ", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-gray-600">Yuklanmoqda...</p>
      </div>
    );
  }

  if (!evidence) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="text-center py-8">
            <h2 className="text-xl font-semibold text-gray-600 mb-4">
              Ashyoviy dalil topilmadi
            </h2>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white print:bg-white">
      {/* Print uchun yashirin tugma */}
      <div className="print:hidden fixed top-4 right-4 z-50">
        <Button onClick={handlePrint} className="flex items-center">
          <Printer className="h-4 w-4 mr-2" />
          Print qilish
        </Button>
      </div>

      <div className="max-w-4xl mx-auto p-8 print:p-6">
        {/* Header */}
        <div className="mb-8 print:mb-6 border-b-2 border-gray-300 pb-6 print:pb-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 print:text-2xl">
                Ashyoviy Dalil Ma'lumotlari
              </h1>
              <p className="text-lg text-gray-600 mt-2 print:text-base">
                Raqam: {evidence.evidenceNumber}
              </p>
            </div>
            <Badge
              variant={
                evidence.status === "completed"
                  ? "default"
                  : evidence.status === "removed"
                  ? "destructive"
                  : "secondary"
              }
              className="text-sm px-4 py-2 print:text-xs">
              {evidence.status === "completed"
                ? "Tugallangan"
                : evidence.status === "removed"
                ? "Chiqarilgan"
                : "Faol"}
            </Badge>
          </div>
        </div>

        {/* Asosiy Ma'lumotlar */}
        <Card className="mb-6 print:mb-4 print:border print:shadow-none">
          <CardHeader className="print:pb-2">
            <CardTitle className="flex items-center text-xl print:text-lg">
              <FileText className="h-5 w-5 mr-2" />
              Asosiy Ma'lumotlar
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 print:space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 print:gap-3">
              <div>
                <Label className="text-sm font-semibold text-gray-700 print:text-xs">
                  Ashyoviy dalil raqami
                </Label>
                <p className="mt-1 text-base font-medium print:text-sm">
                  {evidence.evidenceNumber}
                </p>
              </div>
              <div>
                <Label className="text-sm font-semibold text-gray-700 print:text-xs">
                  E-material raqami
                </Label>
                <p className="mt-1 text-base font-medium print:text-sm">
                  {evidence.eMaterialNumber || "-"}
                </p>
              </div>
              <div>
                <Label className="text-sm font-semibold text-gray-700 print:text-xs">
                  Kimga tegishli
                </Label>
                <p className="mt-1 text-base font-medium print:text-sm">
                  {evidence.belongsTo}
                </p>
              </div>
            </div>

            <div>
              <Label className="text-sm font-semibold text-gray-700 print:text-xs">
                Voqea tafsilotlari
              </Label>
              <p className="mt-2 p-3 bg-gray-50 rounded-lg text-base print:text-sm print:p-2 print:bg-transparent print:border print:border-gray-200">
                {evidence.eventDetails}
              </p>
            </div>

            <div>
              <Label className="text-sm font-semibold text-gray-700 print:text-xs">
                Olib qo'yilgan buyumlar
              </Label>
              <p className="mt-2 p-3 bg-gray-50 rounded-lg text-base print:text-sm print:p-2 print:bg-transparent print:border print:border-gray-200">
                {evidence.items}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 print:gap-3">
              <div>
                <Label className="text-sm font-semibold text-gray-700 flex items-center print:text-xs">
                  <DollarSign className="h-4 w-4 mr-1" />
                  Bahosi
                </Label>
                <p className="mt-1 font-medium text-base print:text-sm">
                  {evidence.value}
                </p>
              </div>
              <div>
                <Label className="text-sm font-semibold text-gray-700 flex items-center print:text-xs">
                  <Calendar className="h-4 w-4 mr-1" />
                  Qabul qilingan sana
                </Label>
                <p className="mt-1 font-medium text-base print:text-sm">
                  {evidence.receivedDate || "-"}
                </p>
              </div>
              <div>
                <Label className="text-sm font-semibold text-gray-700 flex items-center print:text-xs">
                  <User className="h-4 w-4 mr-1" />
                  Qabul qilgan
                </Label>
                <p className="mt-1 font-medium text-base print:text-sm">
                  {evidence.receivedBy || "-"}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 print:gap-3">
              <div>
                <Label className="text-sm font-semibold text-gray-700 flex items-center print:text-xs">
                  <MapPin className="h-4 w-4 mr-1" />
                  Saqlash joyi
                </Label>
                <p className="mt-1 font-medium text-base print:text-sm">
                  {evidence.storageLocation}
                </p>
              </div>
              <div>
                <Label className="text-sm font-semibold text-gray-700 print:text-xs">
                  Kiritgan
                </Label>
                <p className="mt-1 font-medium text-base print:text-sm">
                  {evidence.enteredBy || "-"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Saqlash Ma'lumotlari */}
        <Card className="mb-6 print:mb-4 print:border print:shadow-none">
          <CardHeader className="print:pb-2">
            <CardTitle className="flex items-center text-xl print:text-lg">
              <Calendar className="h-5 w-5 mr-2" />
              Saqlash Ma'lumotlari
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 print:gap-3">
              <div>
                <Label className="text-sm font-semibold text-gray-700 print:text-xs">
                  Saqlash turi
                </Label>
                <p className="mt-1 font-medium text-base print:text-sm">
                  {evidence.storageType === "lifetime"
                    ? "Umrbod"
                    : "Muayyan muddat"}
                </p>
              </div>
              <div>
                <Label className="text-sm font-semibold text-gray-700 print:text-xs">
                  Saqlash muddati
                </Label>
                <p className="mt-1 font-medium text-base print:text-sm">
                  {evidence.storageDeadline || "-"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-8 print:mt-6 pt-6 print:pt-4 border-t-2 border-gray-300 text-center text-sm text-gray-600 print:text-xs">
          <p>Yaratilgan: {formatDate(evidence.createdAt)}</p>
          <p className="mt-2">
            Ushbu hujjat QR code orqali olingan ma'lumotlardan tayyorlangan
          </p>
        </div>
      </div>

      {/* Print uchun CSS */}
      <style>{`
        @media print {
          @page {
            margin: 1cm;
          }
          body {
            background: white;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:bg-white {
            background: white !important;
          }
          .print\\:border {
            border: 1px solid #e5e7eb !important;
          }
          .print\\:shadow-none {
            box-shadow: none !important;
          }
          .print\\:p-6 {
            padding: 1.5rem !important;
          }
          .print\\:p-2 {
            padding: 0.5rem !important;
          }
          .print\\:pb-2 {
            padding-bottom: 0.5rem !important;
          }
          .print\\:mb-4 {
            margin-bottom: 1rem !important;
          }
          .print\\:mb-6 {
            margin-bottom: 1.5rem !important;
          }
          .print\\:mt-6 {
            margin-top: 1.5rem !important;
          }
          .print\\:pt-4 {
            padding-top: 1rem !important;
          }
          .print\\:text-2xl {
            font-size: 1.5rem !important;
          }
          .print\\:text-lg {
            font-size: 1.125rem !important;
          }
          .print\\:text-base {
            font-size: 1rem !important;
          }
          .print\\:text-sm {
            font-size: 0.875rem !important;
          }
          .print\\:text-xs {
            font-size: 0.75rem !important;
          }
          .print\\:gap-3 {
            gap: 0.75rem !important;
          }
          .print\\:space-y-3 > * + * {
            margin-top: 0.75rem !important;
          }
        }
      `}</style>
    </div>
  );
}
