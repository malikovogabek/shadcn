import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { User } from '@/types';
import { mockUsers } from '@/lib/mockData';
import { Plus, Edit, Trash2, Download } from 'lucide-react';

export const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    password: '',
    role: '' as 'administrator' | 'tergovchi' | 'rahbariyat' | ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingUser) {
      // Update existing user
      setUsers(prev => prev.map(user => 
        user.id === editingUser.id 
          ? { ...user, ...formData, role: formData.role as User['role'] }
          : user
      ));
    } else {
      // Add new user
      const newUser: User = {
        id: Date.now().toString(),
        ...formData,
        role: formData.role as User['role'],
        lastActivity: new Date().toLocaleString()
      };
      setUsers(prev => [...prev, newUser]);
    }

    // Reset form
    setFormData({ name: '', username: '', password: '', role: '' });
    setIsAddDialogOpen(false);
    setEditingUser(null);
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      username: user.username,
      password: user.password,
      role: user.role
    });
    setIsAddDialogOpen(true);
  };

  const handleDelete = (userId: string) => {
    if (confirm('Foydalanuvchini o\'chirishni tasdiqlaysizmi?')) {
      setUsers(prev => prev.filter(user => user.id !== userId));
    }
  };

  const exportUsers = () => {
    const csvContent = [
      ['ID', 'Ism', 'Login', 'Rol', 'Oxirgi faoliyat'],
      ...users.map(user => [user.id, user.name, user.username, user.role, user.lastActivity || ''])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'foydalanuvchilar.csv';
    a.click();
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'administrator': return 'bg-blue-100 text-blue-800';
      case 'tergovchi': return 'bg-green-100 text-green-800';
      case 'rahbariyat': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'administrator': return 'Administrator';
      case 'tergovchi': return 'Tergovchi';
      case 'rahbariyat': return 'Rahbariyat';
      default: return role;
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
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Yangi Foydalanuvchi
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingUser ? 'Foydalanuvchini Tahrirlash' : 'Yangi Foydalanuvchi Qo\'shish'}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="name">To'liq ism *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="username">Foydalanuvchi nomi *</Label>
                    <Input
                      id="username"
                      value={formData.username}
                      onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="password">Parol *</Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="role">Rol *</Label>
                    <Select
                      value={formData.role}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, role: value as User['role'] }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Rolni tanlang" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="administrator">Administrator</SelectItem>
                        <SelectItem value="tergovchi">Tergovchi</SelectItem>
                        <SelectItem value="rahbariyat">Rahbariyat</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => {
                      setIsAddDialogOpen(false);
                      setEditingUser(null);
                      setFormData({ name: '', username: '', password: '', role: '' });
                    }}>
                      Bekor qilish
                    </Button>
                    <Button type="submit">
                      {editingUser ? 'Yangilash' : 'Qo\'shish'}
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
                <TableCell>{user.lastActivity || 'Hech qachon'}</TableCell>
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