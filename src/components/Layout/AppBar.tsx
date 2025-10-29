import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Menu, FileText, BookOpen, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface AppBarProps {
  onMenuClick: () => void;
}

export const AppBar: React.FC<AppBarProps> = ({ onMenuClick }) => {
  const { user } = useAuth();
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [selectedYear, setSelectedYear] = useState('2025');

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatDate = (date: Date) => {
    const days = ['Yakshanba', 'Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba'];
    const months = ['Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun', 'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr'];
    
    const dayName = days[date.getDay()];
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    
    return `${day}-${month}, ${year}-yil, ${dayName}`;
  };

  const formatTime = (date: Date) => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  };

  const getRoleDisplay = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Administrator';
      case 'tergovchi':
        return 'Tergovchi';
      case 'prokuror':
        return 'Prokuror';
      default:
        return role;
    }
  };

  return (
    <div className="bg-green-600 text-white px-6 py-3 flex items-center justify-between shadow-md">
      {/* Left Section */}
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          className="text-white hover:bg-green-700"
        >
          <Menu className="h-6 w-6" />
        </Button>

        <h1 className="text-xl font-bold">e-Ashyoviy-dalillar</h1>
      </div>

      {/* Spacer */}
      <div className="flex-1"></div>

      {/* Right Section - All items grouped together */}
      <div className="flex items-center space-x-4">
        {/* Nizom and Qo'llanma buttons */}
        <Button
          variant="ghost"
          size="sm"
          className="text-white hover:bg-green-700"
        >
          <FileText className="h-4 w-4 mr-2" />
          Nizom
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="text-white hover:bg-green-700"
        >
          <BookOpen className="h-4 w-4 mr-2" />
          Qo'llanma
        </Button>

        {/* Date and Time */}
        <div className="text-center border-l border-green-500 pl-4">
          <div className="text-sm font-medium">{formatDate(currentDateTime)}</div>
          <div className="text-lg font-bold">{formatTime(currentDateTime)}</div>
        </div>

        {/* Year selector */}
        <Select value={selectedYear} onValueChange={setSelectedYear}>
          <SelectTrigger className="w-24 bg-white text-green-600 border-0 font-semibold">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="2025">2025</SelectItem>
            <SelectItem value="2024">2024</SelectItem>
            <SelectItem value="2023">2023</SelectItem>
          </SelectContent>
        </Select>

        {/* User Info with Person Icon */}
        {user && (
          <div className="flex items-center space-x-3 border-l border-green-500 pl-4">
            <div className="text-right">
              <div className="text-sm font-medium">{getRoleDisplay(user.role)}</div>
              <div className="text-xs opacity-90">{user.username}</div>
            </div>
            <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center">
              <User className="h-6 w-6 text-green-600" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};