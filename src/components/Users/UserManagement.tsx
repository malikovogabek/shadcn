import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { User } from "@/types";
import { usersApi } from "@/api/users";
import { Plus, Edit, Trash2, Download } from "lucide-react";
import { toast } from "sonner";

export const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    password: "",
    phoneNumber: "",
    role: "" as "admin" | "tergovchi" | "rahbariyat" | "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); // Xatolikni tozalaymiz

    // Map frontend role -> backend role
    const roleMap: Record<string, string> = {
      admin: "ADMIN",
      tergovchi: "INVESTIGATOR",
      rahbariyat: "MANAGEMENT",
    };

    try {
      if (editingUser) {
        // Update existing user - avval backend'ga yuboramiz
        await usersApi.update(editingUser.id, {
          username: formData.username,
          fullName: formData.name,
          password: formData.password || undefined,
          phoneNumber: formData.phoneNumber,
          role: roleMap[formData.role] || "INVESTIGATOR",
        });

        // Muvaffaqiyatli bo'lsa, local state'ni yangilaymiz
        setUsers((prev) =>
          prev.map((user) =>
            user.id === editingUser.id
              ? { ...user, ...formData, role: formData.role as User["role"] }
              : user
          )
        );

        toast.success("Foydalanuvchi muvaffaqiyatli yangilandi!");
      } else {
        // Add new user - avval backend'ga yuboramiz
        const response = await usersApi.create({
          username: formData.username,
          fullName: formData.name,
          password: formData.password,
          phoneNumber: formData.phoneNumber,
          role: roleMap[formData.role] || "INVESTIGATOR",
        });

        // Muvaffaqiyatli bo'lsa, local state'ga qo'shamiz
        const responseData = response as
          | { data?: Record<string, unknown> }
          | Record<string, unknown>
          | unknown;
        const userData =
          (responseData as { data?: Record<string, unknown> })?.data ??
          responseData;
        const createdUser = userData as Record<string, unknown>;

        // Format lastLoginAt if exists
        let lastActivity = "";
        if (createdUser.lastLoginAt) {
          try {
            const date = new Date(createdUser.lastLoginAt as string);
            lastActivity = date.toLocaleString("uz-UZ", {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            });
          } catch {
            lastActivity = String(createdUser.lastLoginAt);
          }
        }

        // Map backend role to frontend role
        let role: User["role"] = "tergovchi";
        if (createdUser.role === "ADMIN") {
          role = "admin";
        } else if (createdUser.role === "INVESTIGATOR") {
          role = "tergovchi";
        } else if (createdUser.role === "MANAGEMENT") {
          role = "rahbariyat";
        }

        const newUser: User = {
          id: String(createdUser.id ?? Date.now().toString()),
          name:
            (createdUser.fullName as string) ??
            (createdUser.username as string) ??
            formData.name,
          username: (createdUser.username as string) ?? formData.username,
          password: "",
          role: role,
          lastActivity: lastActivity,
        };

        setUsers((prev) => [...prev, newUser]);
        toast.success("Foydalanuvchi muvaffaqiyatli qo'shildi!");
      }

      // Reset form va dialog'ni yopamiz
      setFormData({
        name: "",
        username: "",
        password: "",
        phoneNumber: "",
        role: "",
      });
      setError(null);
      setIsAddDialogOpen(false);
      setEditingUser(null);
    } catch (err: unknown) {
      // Xatolikni ko'rsatamiz va dialog ochiq qoladi
      let errorMessage = "Foydalanuvchi qo'shilmadi. Xatolik yuz berdi.";

      if (err && typeof err === "object" && "data" in err) {
        const errorData = err.data as { message?: string | string[] };
        if (errorData?.message) {
          if (Array.isArray(errorData.message)) {
            errorMessage = `Foydalanuvchi qo'shilmadi. ${errorData.message.join(
              ", "
            )}`;
          } else {
            errorMessage = `Foydalanuvchi qo'shilmadi. ${errorData.message}`;
          }
        }
      } else if (err instanceof Error) {
        errorMessage = `Foydalanuvchi qo'shilmadi. ${err.message}`;
      }

      setError(errorMessage);
      toast.error(errorMessage);
      // Dialog ochiq qoladi, form tozalanmaydi
    }
  };

  // initial load
  (async () => {
    if (users.length) return;
    try {
      const res = await usersApi.list();
      const resData = res as { data?: unknown[] } | unknown[] | unknown;
      const arr = (
        Array.isArray((resData as { data?: unknown[] })?.data)
          ? (resData as { data: unknown[] }).data
          : Array.isArray(resData)
          ? (resData as unknown[])
          : []
      ) as Record<string, unknown>[];
      const mapped: User[] = arr.map(
        (u: Record<string, unknown>, idx: number) => {
          // Format lastLoginAt to readable date string
          let lastActivity = "";
          if (u.lastLoginAt) {
            try {
              const date = new Date(u.lastLoginAt as string);
              lastActivity = date.toLocaleString("uz-UZ", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              });
            } catch {
              lastActivity = String(u.lastLoginAt);
            }
          }

          // Map backend role to frontend role
          let role: User["role"] = "tergovchi";
          if (u.role === "ADMIN") {
            role = "admin";
          } else if (u.role === "INVESTIGATOR") {
            role = "tergovchi";
          } else if (u.role === "MANAGEMENT") {
            role = "rahbariyat";
          }

          return {
            id: String(u.id ?? idx + 1),
            name: (u.fullName as string) ?? (u.username as string) ?? "",
            username: (u.username as string) ?? "",
            password: "",
            role: role,
            lastActivity: lastActivity,
          };
        }
      );
      setUsers(mapped);
    } catch (err) {
      console.error("Error loading users:", err);
    }
  })();

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setError(null);
    setFormData({
      name: user.name,
      username: user.username,
      password: user.password,
      phoneNumber: "",
      role: user.role,
    });
    setIsAddDialogOpen(true);
  };

  const handleDelete = async (userId: string) => {
    if (!confirm("Foydalanuvchini o'chirishni tasdiqlaysizmi?")) {
      return;
    }

    try {
      await usersApi.remove(userId);
      setUsers((prev) => prev.filter((user) => user.id !== userId));
      toast.success("Foydalanuvchi muvaffaqiyatli o'chirildi!");
    } catch (err: unknown) {
      let errorMessage = "O'chirishda xatolik yuz berdi. Qayta urinib ko'ring.";

      if (err && typeof err === "object" && "data" in err) {
        const errorData = err.data as { message?: string | string[] };
        if (errorData?.message) {
          if (Array.isArray(errorData.message)) {
            errorMessage = errorData.message.join(", ");
          } else {
            errorMessage = errorData.message;
          }
        }
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }

      toast.error(errorMessage);
    }
  };

  const exportUsers = () => {
    const csvContent = [
      ["ID", "Ism", "Login", "Rol", "Oxirgi faoliyat"],
      ...users.map((user) => [
        user.id,
        user.name,
        user.username,
        user.role,
        user.lastActivity || "",
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "foydalanuvchilar.csv";
    a.click();
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-blue-100 text-blue-800";
      case "tergovchi":
        return "bg-green-100 text-green-800";
      case "rahbariyat":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "admin":
        return "Administrator";
      case "tergovchi":
        return "Tergovchi";
      case "rahbariyat":
        return "Rahbariyat";
      default:
        return role;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Foydalanuvchilar Boshqaruvi
          <div className="flex space-x-2">
            <Button onClick={exportUsers} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Eksport
            </Button>
            <Dialog
              open={isAddDialogOpen}
              onOpenChange={(open) => {
                // Agar dialog yopilmoqchi bo'lsa va xatolik bo'lsa, yopilmasin
                if (!open) {
                  // Xatolik bo'lsa, dialog yopilmasligi kerak
                  if (error) {
                    return; // Dialog yopilmasin
                  }
                  // Dialog yopilganda form va xatolikni tozalaymiz
                  setError(null);
                  setFormData({
                    name: "",
                    username: "",
                    password: "",
                    phoneNumber: "",
                    role: "",
                  });
                  setEditingUser(null);
                }
                setIsAddDialogOpen(open);
              }}
            >
              <DialogTrigger asChild>
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Yangi Foydalanuvchi
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingUser
                      ? "Foydalanuvchini Tahrirlash"
                      : "Yangi Foydalanuvchi Qo'shish"}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  <div>
                    <Label htmlFor="name">To'liq ism *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="username">Foydalanuvchi nomi *</Label>
                    <Input
                      id="username"
                      value={formData.username}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          username: e.target.value,
                        }))
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="password">Parol *</Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          password: e.target.value,
                        }))
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">
                      Telefon raqami (+998XXXXXXXXX) *
                    </Label>
                    <Input
                      id="phone"
                      value={formData.phoneNumber}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          phoneNumber: e.target.value,
                        }))
                      }
                      placeholder="+998901234567"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="role">Rol *</Label>
                    <Select
                      value={formData.role}
                      onValueChange={(value) =>
                        setFormData((prev) => ({
                          ...prev,
                          role: value as User["role"],
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Rolni tanlang" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Administrator</SelectItem>
                        <SelectItem value="tergovchi">Tergovchi</SelectItem>
                        <SelectItem value="rahbariyat">Rahbariyat</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsAddDialogOpen(false);
                        setEditingUser(null);
                        setError(null);
                        setFormData({
                          name: "",
                          username: "",
                          password: "",
                          phoneNumber: "",
                          role: "",
                        });
                      }}
                    >
                      Bekor qilish
                    </Button>
                    <Button type="submit">
                      {editingUser ? "Yangilash" : "Qo'shish"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>To'liq ism</TableHead>
              <TableHead>Foydalanuvchi nomi</TableHead>
              <TableHead>Rol</TableHead>
              <TableHead>Oxirgi faoliyat</TableHead>
              <TableHead>Amallar</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.id}</TableCell>
                <TableCell className="font-medium">{user.name}</TableCell>
                <TableCell>{user.username}</TableCell>
                <TableCell>
                  <Badge className={getRoleBadgeColor(user.role)}>
                    {getRoleLabel(user.role)}
                  </Badge>
                </TableCell>
                <TableCell>
                  {user.lastActivity ? (
                    <span className="text-sm">{user.lastActivity}</span>
                  ) : (
                    <span className="text-sm text-gray-500 italic">
                      Hech qachon
                    </span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(user)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(user.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
