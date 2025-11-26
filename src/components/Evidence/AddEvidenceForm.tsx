import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { Evidence } from "@/types";
import { evidenceApi } from "@/api/evidence";
import { uploadImageAndGetUrl } from "@/api/upload";

// ID counter mock uchun ishlatilardi; backendga o'tilgani uchun kerak emas
const evidenceIdCounter = 1;

export const AddEvidenceForm: React.FC = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    evidenceNumber: "",
    eMaterialNumber: "",
    eventDetails: "",
    belongsTo: "",
    items: "",
    value: "",
    receivedDate: "",
    receivedBy: "",
    storageLocation: "",
    storageType: "specific_date" as "specific_date" | "lifetime",
    storageDeadline: "",
    imageUrls: [] as string[],
    accountFileUrl: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Backend payloadga moslashtirish (minimal xaritalash)
    const payload = {
      name: formData.evidenceNumber,
      description: formData.eventDetails,
      caseNumber: formData.eMaterialNumber,
      location: formData.storageLocation,
      expiryDate:
        formData.storageDeadline || new Date().toISOString().slice(0, 10),
      category:
        formData.storageType === "lifetime" ? "LIFETIME" : "SPECIFIC_DATE",
      imageUrl:
        formData.imageUrls.length > 0 ? formData.imageUrls[0] : undefined,
    };

    const res = await evidenceApi.create(payload);
    if (!res) {
      alert(
        "Xatolik: saqlash imkoni bo'lmadi. Iltimos, login qiling yoki maydonlarni tekshiring."
      );
      return;
    }

    alert("Ashyoviy dalil muvaffaqiyatli saqlandi!");

    setFormData({
      evidenceNumber: "",
      eMaterialNumber: "",
      eventDetails: "",
      belongsTo: "",
      items: "",
      value: "",
      receivedDate: "",
      receivedBy: "",
      storageLocation: "",
      storageType: "specific_date",
      storageDeadline: "",
      imageUrls: [],
      accountFileUrl: "",
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const urls: string[] = [];
    for (let i = 0; i < files.length; i++) {
      const url = await uploadImageAndGetUrl(files[i]);
      if (url) urls.push(url);
    }
    if (urls.length > 0) {
      setFormData((prev) => ({
        ...prev,
        imageUrls: [...prev.imageUrls, ...urls],
      }));
    }
  };

  const handleAccountFileUpload = async (file: File | null) => {
    const url = await uploadImageAndGetUrl(file);
    if (url) setFormData((prev) => ({ ...prev, accountFileUrl: url }));
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-green-700">
          Yangi Ashyoviy Dalil Qo'shish
        </CardTitle>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="evidenceNumber">
                Ashyoviy dalil tartib raqami *
              </Label>
              <Input
                id="evidenceNumber"
                value={formData.evidenceNumber}
                onChange={(e) =>
                  handleInputChange("evidenceNumber", e.target.value)
                }
                placeholder="DL-2024-001"
                required
              />
            </div>

            <div>
              <Label htmlFor="eMaterialNumber">E-material raqami *</Label>
              <Input
                id="eMaterialNumber"
                value={formData.eMaterialNumber}
                onChange={(e) =>
                  handleInputChange("eMaterialNumber", e.target.value)
                }
                placeholder="EM-2024-001"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="belongsTo">Ayblanuvchining F.I.O *</Label>
            <Input
              id="belongsTo"
              value={formData.belongsTo}
              onChange={(e) => handleInputChange("belongsTo", e.target.value)}
              placeholder="Ayblanuvchining to'liq F.I.O kiriting"
              required
            />
          </div>

          <div>
            <Label htmlFor="eventDetails">Voqea tafsilotlari *</Label>
            <Textarea
              id="eventDetails"
              value={formData.eventDetails}
              onChange={(e) =>
                handleInputChange("eventDetails", e.target.value)
              }
              placeholder="Voqea haqida batafsil ma'lumot kiriting"
              rows={3}
              required
            />
          </div>

          <div>
            <Label htmlFor="items">Olib qo'yilgan buyumlar *</Label>
            <Textarea
              id="items"
              value={formData.items}
              onChange={(e) => handleInputChange("items", e.target.value)}
              placeholder="Buyumlar ro'yxatini kiriting"
              rows={3}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="value">Bahosi</Label>
              <Input
                id="value"
                value={formData.value}
                onChange={(e) => handleInputChange("value", e.target.value)}
                placeholder="Bahoini kiriting yoki 'mavjud emas'"
              />
            </div>

            <div>
              <Label htmlFor="receivedDate">Qachon olingan *</Label>
              <Input
                id="receivedDate"
                type="date"
                value={formData.receivedDate}
                onChange={(e) =>
                  handleInputChange("receivedDate", e.target.value)
                }
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="receivedBy">Kim tomonidan olingan *</Label>
              <Input
                id="receivedBy"
                value={formData.receivedBy}
                onChange={(e) =>
                  handleInputChange("receivedBy", e.target.value)
                }
                placeholder="Qabul qiluvchi F.I.O"
                required
              />
            </div>

            <div>
              <Label htmlFor="storageLocation">Saqlash joyi *</Label>
              <Input
                id="storageLocation"
                value={formData.storageLocation}
                onChange={(e) =>
                  handleInputChange("storageLocation", e.target.value)
                }
                placeholder="Omborxona A-15"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="storageType">Saqlash muddati turi *</Label>
              <Select
                value={formData.storageType}
                onValueChange={(value) =>
                  handleInputChange("storageType", value)
                }>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="specific_date">Muayyan sana</SelectItem>
                  <SelectItem value="lifetime">Umrbod</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.storageType === "specific_date" && (
              <div>
                <Label htmlFor="storageDeadline">Saqlash muddati *</Label>
                <Input
                  id="storageDeadline"
                  type="date"
                  value={formData.storageDeadline}
                  onChange={(e) =>
                    handleInputChange("storageDeadline", e.target.value)
                  }
                  required
                />
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="accountFile">
                Ashyoviy dalilning hisob fayli
              </Label>
              <Input
                id="accountFile"
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(e) =>
                  handleAccountFileUpload(e.target.files?.[0] ?? null)
                }
                className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
              />
              {formData.accountFileUrl && (
                <p className="text-xs text-gray-600 mt-1">
                  Yuklandi: {formData.accountFileUrl}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="images">Ashyoviy dalilning rasmlari</Label>
              <Input
                id="images"
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => handleImageUpload(e.target.files)}
                className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
              />
              {formData.imageUrls.length > 0 && (
                <div className="mt-2 space-y-1">
                  <p className="text-xs text-gray-600">
                    Yuklangan rasmlar ({formData.imageUrls.length}):
                  </p>
                  {formData.imageUrls.map((url, idx) => (
                    <p key={idx} className="text-xs text-gray-500 truncate">
                      • {url}
                    </p>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline">
              Bekor qilish
            </Button>
            <Button type="submit" className="bg-green-600 hover:bg-green-700">
              Saqlash
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
