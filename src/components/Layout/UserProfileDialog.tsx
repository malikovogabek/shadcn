import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Phone, CheckCircle, LogOut } from "lucide-react";

interface UserProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const UserProfileDialog: React.FC<UserProfileDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const { user, logout } = useAuth();

  if (!user) return null;

  const getRoleDisplay = (role: string) => {
    switch (role) {
      case "admin":
        return "Administrator";
      case "tergovchi":
        return "Tergovchi";
      case "prokuror":
        return "Prokuror";
      default:
        return role;
    }
  };

  const getUserInitials = (username: string) => {
    return username.substring(0, 2).toUpperCase();
  };

  const handleLogout = () => {
    logout();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden">
        <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 text-white">
          <DialogHeader>
            <DialogTitle className="text-white text-lg">
              Profil Ma'lumotlari
            </DialogTitle>
          </DialogHeader>
        </div>

        <div className="p-6 space-y-6">
          {/* Avatar and Name Section */}
          <div className="flex items-start space-x-4">
            <Avatar className="h-24 w-24 border-4 border-green-100">
              <AvatarImage
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`}
              />
              <AvatarFallback className="bg-green-600 text-white text-2xl">
                {getUserInitials(user.username)}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 space-y-2">
              <h3 className="text-2xl font-bold text-gray-900">
                {user.fullName || user.username}
              </h3>
              <p className="text-sm text-gray-500">{user.username}</p>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-red-600 hover:text-red-700 hover:bg-red-50">
              Chiqish
            </Button>
          </div>

          {/* Role and Department */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-gray-700 font-medium">
                {getRoleDisplay(user.role)}
              </span>
            </div>

            {user.department && (
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-gray-700">{user.department}</span>
              </div>
            )}

            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-gray-700">Texnik</span>
            </div>
          </div>

          {/* Contact Information */}
          {user.phone && (
            <div className="pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <span className="text-gray-600 font-medium">
                  Amalda telefon raqamingiz:
                </span>
                <Button
                  variant="default"
                  size="sm"
                  className="bg-green-600 hover:bg-green-700">
                  <Phone className="h-4 w-4 mr-2" />
                  {user.phone}
                </Button>
              </div>
            </div>
          )}

          {/* Footer Logo */}
          <div className="pt-6 border-t border-gray-200">
            <div className="flex items-center justify-center space-x-2 text-gray-600">
              <div className="flex items-center space-x-1">
                <div className="w-8 h-8 border-2 border-red-600 rounded flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-red-600" />
                </div>
                <span className="text-sm font-medium">
                  MUALLATI BUZIB MUNOSABAT BILDIRILGAN MATERIALLAR
                </span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
