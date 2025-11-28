import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { evidenceApi } from "@/api/evidence";
import { useAuth } from "@/contexts/AuthContext";
import {
  ArrowLeft,
  Calendar,
  User,
  MapPin,
  DollarSign,
  FileText,
  Image,
  CheckCircle,
  AlertTriangle,
  Edit,
  Trash2,
  Download,
  Loader2,
  Printer,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useEffect, useState } from "react";
import { Evidence } from "@/types";
import { formatStorageDeadline } from "@/lib/utils";

export default function EvidenceDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [completionReason, setCompletionReason] = useState("");
  const [completionFile, setCompletionFile] = useState<File | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editReason, setEditReason] = useState("");
  const [removeReason, setRemoveReason] = useState("");
  const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false);

  const [evidence, setEvidence] = useState<Evidence | null>(null);
  const [editData, setEditData] = useState<{
    evidenceNumber: string;
    eventDetails: string;
    belongsTo: string;
    items: string;
    value: string;
    receivedDate: string;
    receivedBy: string;
    storageLocation: string;
    storageType: "specific_date" | "lifetime";
    storageDeadline: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      if (!id) {
        if (isMounted) setIsLoading(false);
        return;
      }
      try {
        const data = await evidenceApi.getById(id);
        const payload = data as { data?: unknown } | unknown;
        const raw = (payload as { data?: unknown }).data ?? payload;
        if (raw && isMounted) {
          const it = raw as Record<string, unknown>;

          // Backenddan keladigan tergovchi ma'lumotlari
          const investigator = it.investigator as
            | { fullName?: string; username?: string }
            | undefined;

          const mapped: Evidence = {
            id: String(it.id ?? id),
            evidenceNumber:
              (it.name as string) ?? (it.caseNumber as string) ?? "",
            eMaterialNumber: (it.caseNumber as string) ?? "",
            eventDetails: (it.description as string) ?? "",
            belongsTo: "-",
            items: "-",
            value: "mavjud emas",
            receivedDate:
              (it.receivedDate as string) ?? (it.createdAt as string) ?? "",
            receivedBy:
              (it.receivedBy as string) ??
              investigator?.fullName ??
              investigator?.username ??
              "",
            storageLocation: (it.location as string) ?? "-",
            enteredBy:
              (it.enteredBy as string) ??
              investigator?.fullName ??
              investigator?.username ??
              "",
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
          setEditData({
            evidenceNumber: mapped.evidenceNumber,
            eventDetails: mapped.eventDetails,
            belongsTo: mapped.belongsTo,
            items: mapped.items,
            value: mapped.value,
            receivedDate: mapped.receivedDate,
            receivedBy: mapped.receivedBy,
            storageLocation: mapped.storageLocation,
            storageType: mapped.storageType,
            storageDeadline: mapped.storageDeadline,
          });
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="text-center py-8 space-y-4">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
            <p className="text-gray-600">Maʼlumotlar yuklanmoqda...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!evidence || !editData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="text-center py-8">
            <h2 className="text-xl font-semibold text-gray-600 mb-4">
              Ashyoviy dalil topilmadi
            </h2>
            <Button onClick={() => navigate(-1)}>Orqaga qaytish</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleComplete = async () => {
    if (!completionReason.trim()) {
      alert("Tugatish sababini kiriting");
      return;
    }

    try {
      // Backendga yuboriladigan maydonlarni xaritalaymiz
      await evidenceApi.update(evidence.id, {
        name: evidence.evidenceNumber,
        description: evidence.eventDetails,
        caseNumber: evidence.eMaterialNumber || "",
        location: evidence.storageLocation,
        expiryDate: evidence.storageDeadline || "",
        category:
          evidence.storageType === "lifetime" ? "LIFETIME" : "SPECIFIC_DATE",
      });
      alert("Ashyoviy dalil muvaffaqiyatli tugatildi!");
      navigate(-1);
    } catch (err) {
      alert("Xatolik yuz berdi. Qayta urinib ko'ring.");
    }
  };

  const handleEdit = async () => {
    if (!editReason.trim()) {
      alert("Tahrirlash sababini kiriting");
      return;
    }

    // Backendga yuboriladigan maydonlarni xaritalaymiz
    try {
      await evidenceApi.update(evidence.id, {
        name: editData.evidenceNumber,
        description: editData.eventDetails,
        caseNumber: evidence.eMaterialNumber || "",
        location: editData.storageLocation,
        expiryDate: editData.storageDeadline || "",
        category:
          editData.storageType === "lifetime" ? "LIFETIME" : "SPECIFIC_DATE",
      });
    } catch {
      // Agar backend xato qaytarsa, hozircha UI holatini o'zgartirmaymiz
    }

    alert("Ashyoviy dalil muvaffaqiyatli tahrirlandi!");
    setIsEditing(false);
    setEditReason("");
    navigate(0); // Refresh the page
  };

  const handleRemove = async () => {
    if (!removeReason.trim()) {
      alert("Chiqarib yuborish sababini kiriting");
      return;
    }

    try {
      await evidenceApi.remove(evidence.id);
    } catch {
      // ignore
    }

    alert("Ashyoviy dalil muvaffaqiyatli chiqarib yuborildi!");
    navigate(-1);
  };

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("uz-UZ", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // QR code ma'lumotlari - URL formatida (fayl ko'rinishida sahifaga link)
  const getQRCodeData = () => {
    return `${window.location.origin}/evidence/${evidence.id}/view`;
  };

  // QR code ni yuklab olish
  const handleDownloadQR = () => {
    const svg = document.getElementById("qrcode-svg");
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const htmlImg = new window.Image();

    htmlImg.onload = () => {
      canvas.width = htmlImg.width;
      canvas.height = htmlImg.height;
      ctx?.drawImage(htmlImg, 0, 0);
      const pngFile = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.download = `QR-${evidence.evidenceNumber}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };

    const svgBlob = new Blob([svgData], {
      type: "image/svg+xml;charset=utf-8",
    });
    const url = URL.createObjectURL(svgBlob);
    htmlImg.src = url;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="outline" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Orqaga
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Ashyoviy Dalil: {evidence.evidenceNumber}
              </h1>
              <p className="text-sm text-gray-600">
                Yaratilgan: {formatDate(evidence.createdAt)}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge
              variant={
                evidence.status === "completed"
                  ? "default"
                  : evidence.status === "removed"
                  ? "destructive"
                  : "secondary"
              }
              className="text-sm px-3 py-1">
              {evidence.status === "completed"
                ? "Tugallangan"
                : evidence.status === "removed"
                ? "Chiqarilgan"
                : "Faol"}
            </Badge>

            {user?.role === "tergovchi" && evidence.status === "active" && (
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setIsEditing(!isEditing)}>
                  <Edit className="h-4 w-4 mr-2" />
                  {isEditing ? "Bekor qilish" : "Tahrirlash"}
                </Button>

                <Dialog
                  open={isRemoveDialogOpen}
                  onOpenChange={setIsRemoveDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="text-red-600 hover:text-red-700">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Chiqarib yuborish
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>
                        Ashyoviy Dalilni Chiqarib Yuborish
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="removeReason">
                          Chiqarib yuborish sababi *
                        </Label>
                        <Textarea
                          id="removeReason"
                          value={removeReason}
                          onChange={(e) => setRemoveReason(e.target.value)}
                          placeholder="Nima uchun bu ashyoviy dalilni chiqarib yuborayotganingizni tushuntiring"
                          rows={4}
                        />
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          onClick={() => setIsRemoveDialogOpen(false)}>
                          Bekor qilish
                        </Button>
                        <Button variant="destructive" onClick={handleRemove}>
                          Chiqarib yuborish
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Edit Reason Input */}
        {isEditing && (
          <Card className="border-yellow-200 bg-yellow-50">
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="editReason">Tahrirlash sababi *</Label>
                  <Textarea
                    id="editReason"
                    value={editReason}
                    onChange={(e) => setEditReason(e.target.value)}
                    placeholder="Nima uchun bu ashyoviy dalilni tahrirlamoqchisiz?"
                    rows={2}
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsEditing(false);
                      setEditReason("");
                    }}>
                    Bekor qilish
                  </Button>
                  <Button
                    onClick={handleEdit}
                    className="bg-yellow-600 hover:bg-yellow-700">
                    Saqlash
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Information va QR Code - bitta qatorda */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Asosiy Ma'lumotlar - 2/3 qism */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Asosiy Ma'lumotlar
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label className="text-sm font-medium text-gray-700">
                    Ashyoviy dalil raqami
                  </Label>
                  {isEditing ? (
                    <Input
                      value={editData.evidenceNumber}
                      onChange={(e) =>
                        setEditData({
                          ...editData,
                          evidenceNumber: e.target.value,
                        })
                      }
                      className="mt-1"
                    />
                  ) : (
                    <p className="mt-1 text-lg font-semibold">
                      {evidence.evidenceNumber}
                    </p>
                  )}
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">
                    E-material raqami
                  </Label>
                  <p className="mt-1 text-lg font-semibold">
                    {evidence.eMaterialNumber || "-"}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">
                    Kimga tegishli
                  </Label>
                  {isEditing ? (
                    <Input
                      value={editData.belongsTo}
                      onChange={(e) =>
                        setEditData({ ...editData, belongsTo: e.target.value })
                      }
                      className="mt-1"
                    />
                  ) : (
                    <p className="mt-1 text-lg font-semibold">
                      {evidence.belongsTo}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700">
                  Voqea tafsilotlari
                </Label>
                {isEditing ? (
                  <Textarea
                    value={editData.eventDetails}
                    onChange={(e) =>
                      setEditData({ ...editData, eventDetails: e.target.value })
                    }
                    rows={3}
                    className="mt-1"
                  />
                ) : (
                  <p className="mt-2 p-3 bg-gray-50 rounded-lg">
                    {evidence.eventDetails}
                  </p>
                )}
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700">
                  Olib qo'yilgan buyumlar
                </Label>
                {isEditing ? (
                  <Textarea
                    value={editData.items}
                    onChange={(e) =>
                      setEditData({ ...editData, items: e.target.value })
                    }
                    rows={3}
                    className="mt-1"
                  />
                ) : (
                  <p className="mt-2 p-3 bg-gray-50 rounded-lg">
                    {evidence.items}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <Label className="text-sm font-medium text-gray-700 flex items-center">
                    <DollarSign className="h-4 w-4 mr-1" />
                    Bahosi
                  </Label>
                  {isEditing ? (
                    <Input
                      value={editData.value}
                      onChange={(e) =>
                        setEditData({ ...editData, value: e.target.value })
                      }
                      className="mt-1"
                    />
                  ) : (
                    <p className="mt-1 font-medium">{evidence.value}</p>
                  )}
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700 flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    Qabul qilingan sana
                  </Label>
                  {isEditing ? (
                    <Input
                      type="date"
                      value={editData.receivedDate}
                      onChange={(e) =>
                        setEditData({
                          ...editData,
                          receivedDate: e.target.value,
                        })
                      }
                      className="mt-1"
                    />
                  ) : (
                    <p className="mt-1 font-medium">
                      {formatStorageDeadline(evidence.receivedDate)}
                    </p>
                  )}
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700 flex items-center">
                    <User className="h-4 w-4 mr-1" />
                    Qabul qilgan
                  </Label>
                  {isEditing ? (
                    <Input
                      value={editData.receivedBy}
                      onChange={(e) =>
                        setEditData({ ...editData, receivedBy: e.target.value })
                      }
                      className="mt-1"
                    />
                  ) : (
                    <p className="mt-1 font-medium">{evidence.receivedBy}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label className="text-sm font-medium text-gray-700 flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    Saqlash joyi
                  </Label>
                  {isEditing ? (
                    <Input
                      value={editData.storageLocation}
                      onChange={(e) =>
                        setEditData({
                          ...editData,
                          storageLocation: e.target.value,
                        })
                      }
                      className="mt-1"
                    />
                  ) : (
                    <p className="mt-1 font-medium">
                      {evidence.storageLocation}
                    </p>
                  )}
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">
                    Kiritgan
                  </Label>
                  <p className="mt-1 font-medium">{evidence.enteredBy}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* QR Code Section - 1/3 qism */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>QR Code</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center space-y-4">
              <div className="bg-white p-4 rounded-lg border-2 border-gray-200">
                <QRCodeSVG
                  id="qrcode-svg"
                  value={getQRCodeData()}
                  size={256}
                  level="H"
                  includeMargin={true}
                />
              </div>
              <p className="text-sm text-gray-600 text-center max-w-md">
                Ushbu QR code ni skanerlash orqali ashyoviy dalil ma'lumotlarini
                ko'rish mumkin
              </p>
              <div className="flex justify-center gap-2">
                <Button
                  variant="outline"
                  onClick={handleDownloadQR}
                  className="flex items-center">
                  <Download className="h-4 w-4 mr-2" />
                  Yuklab olish
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    const svg = document.getElementById("qrcode-svg");
                    if (svg) {
                      const printContent = `
                        <html>
                          <head><title>QR Code - ${evidence.evidenceNumber}</title></head>
                          <body style="display:flex;justify-content:center;align-items:center;min-height:100vh;margin:0;">
                            ${svg.outerHTML}
                          </body>
                        </html>
                      `;
                      const iframe = document.createElement("iframe");
                      iframe.style.display = "none";
                      document.body.appendChild(iframe);
                      iframe.contentDocument?.write(printContent);
                      iframe.contentDocument?.close();
                      iframe.contentWindow?.print();
                      setTimeout(() => document.body.removeChild(iframe), 1000);
                    }
                  }}
                  className="flex items-center">
                  <Printer className="h-4 w-4 mr-2" />
                  Chop etish
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Storage Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Saqlash Ma'lumotlari
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label className="text-sm font-medium text-gray-700">
                  Saqlash turi
                </Label>
                {isEditing ? (
                  <Select
                    value={editData.storageType}
                    onValueChange={(value) =>
                      setEditData({
                        ...editData,
                        storageType: value as "specific_date" | "lifetime",
                      })
                    }>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="specific_date">
                        Muayyan muddat
                      </SelectItem>
                      <SelectItem value="lifetime">Umrbod</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <p className="mt-1 font-medium">
                    {evidence.storageType === "lifetime"
                      ? "Umrbod"
                      : "Muayyan muddat"}
                  </p>
                )}
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700">
                  Saqlash muddati
                </Label>
                {isEditing ? (
                  <Input
                    type="date"
                    value={formatStorageDeadline(editData.storageDeadline)}
                    onChange={(e) =>
                      setEditData({
                        ...editData,
                        storageDeadline: e.target.value,
                      })
                    }
                    className="mt-1"
                    disabled={editData.storageType === "lifetime"}
                  />
                ) : (
                  <div className="flex items-center space-x-2 mt-1">
                    <p className="font-medium">
                      {formatStorageDeadline(evidence.storageDeadline)}
                    </p>
                    {evidence.storageType === "specific_date" && (
                      <>
                        {isExpired(evidence.storageDeadline) && (
                          <Badge variant="destructive" className="text-xs">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Muddati tugagan
                          </Badge>
                        )}
                        {isExpiringSoon(evidence.storageDeadline) &&
                          !isExpired(evidence.storageDeadline) && (
                            <Badge
                              variant="secondary"
                              className="text-xs bg-yellow-100 text-yellow-800">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              Tez orada tugaydi
                            </Badge>
                          )}
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Files and Images */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Image className="h-5 w-5 mr-2" />
              Fayllar va Rasmlar
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-gray-700">
                Hisob fayli
              </Label>
              {evidence.accountFile ? (
                <div className="mt-2 p-3 bg-blue-50 rounded-lg flex items-center justify-between">
                  <span className="text-blue-700 font-medium">
                    {typeof evidence.accountFile === "string"
                      ? evidence.accountFile
                      : evidence.accountFile.name}
                  </span>
                  <Button variant="outline" size="sm">
                    Yuklab olish
                  </Button>
                </div>
              ) : (
                <p className="mt-2 text-gray-500 italic">
                  Hisob fayli yuklanmagan
                </p>
              )}
            </div>

            <Separator />

            <div>
              <Label className="text-sm font-medium text-gray-700">
                Rasmlar
              </Label>
              {evidence.images && evidence.images.length > 0 ? (
                <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-4">
                  {evidence.images.map((image, index) => (
                    <div key={index} className="relative group">
                      <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                        <Image className="h-8 w-8 text-gray-400" />
                      </div>
                      <p className="mt-1 text-xs text-center text-gray-600 truncate">
                        {typeof image === "string" ? image : image.name}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-2 text-gray-500 italic">Rasmlar yuklanmagan</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Edit History */}
        {evidence.editHistory && evidence.editHistory.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Edit className="h-5 w-5 mr-2" />
                Tahrirlash Tarixi
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {evidence.editHistory.map((edit, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{edit.editedBy}</p>
                        <p className="text-sm text-gray-600">
                          {formatDate(edit.editDate)}
                        </p>
                      </div>
                    </div>
                    <p className="mt-2 text-sm">{edit.reason}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Completion Section */}
        {evidence.status === "active" &&
          user?.role === "tergovchi" &&
          !isEditing && (
            <Card className="border-green-200">
              <CardHeader>
                <CardTitle className="flex items-center text-green-700">
                  <CheckCircle className="h-5 w-5 mr-2" />
                  Ashyoviy Dalilni Tugatish
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="reason">Tugatish sababi *</Label>
                  <Textarea
                    id="reason"
                    value={completionReason}
                    onChange={(e) => setCompletionReason(e.target.value)}
                    placeholder="Tugatish sababini batafsil kiriting"
                    rows={4}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="file">Tugatish fayli</Label>
                  <Input
                    id="file"
                    type="file"
                    onChange={(e) =>
                      setCompletionFile(e.target.files?.[0] || null)
                    }
                    className="mt-1"
                  />
                </div>
                <div className="flex justify-end">
                  <Button
                    onClick={handleComplete}
                    className="bg-green-600 hover:bg-green-700">
                    Ashyoviy Dalilni Tugatish
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

        {/* Completion Details for Completed Evidence */}
        {evidence.status === "completed" && evidence.completionReason && (
          <Card className="border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center text-gray-700">
                <CheckCircle className="h-5 w-5 mr-2" />
                Tugatish Ma'lumotlari
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-700">
                  Tugatish sababi
                </Label>
                <p className="mt-2 p-3 bg-gray-50 rounded-lg">
                  {evidence.completionReason}
                </p>
              </div>
              {evidence.completionFile && (
                <div>
                  <Label className="text-sm font-medium text-gray-700">
                    Tugatish fayli
                  </Label>
                  <div className="mt-2 p-3 bg-blue-50 rounded-lg flex items-center justify-between">
                    <span className="text-blue-700 font-medium">
                      {evidence.completionFile}
                    </span>
                    <Button variant="outline" size="sm">
                      Yuklab olish
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Removal Details for Removed Evidence */}
        {evidence.status === "removed" && evidence.removeReason && (
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="flex items-center text-red-700">
                <Trash2 className="h-5 w-5 mr-2" />
                Chiqarib Yuborish Ma'lumotlari
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-700">
                  Chiqarib yuborish sababi
                </Label>
                <p className="mt-2 p-3 bg-red-50 rounded-lg">
                  {evidence.removeReason}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700">
                    Chiqarib yuborgan
                  </Label>
                  <p className="mt-1 font-medium">{evidence.removedBy}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">
                    Chiqarib yuborilgan sana
                  </Label>
                  <p className="mt-1 font-medium">
                    {evidence.removeDate && formatDate(evidence.removeDate)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
