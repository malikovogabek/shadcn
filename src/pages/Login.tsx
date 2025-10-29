import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!username || !password) {
      setError("Foydalanuvchi nomi va parolni kiriting");
      return;
    }

    const success = login(username, password);
    if (!success) {
      setError("Noto'g'ri foydalanuvchi nomi yoki parol");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-900">
            Ashyoviy Dalillar Hisobi
          </CardTitle>
          <CardDescription>
            Tizimga kirish uchun ma'lumotlaringizni kiriting
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label htmlFor="username">Foydalanuvchi nomi</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Foydalanuvchi nomini kiriting"
              />
            </div>

            <div>
              <Label htmlFor="password">Parol</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Parolni kiriting"
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full">
              Kirish
            </Button>

            <div className="text-center">
              <button
                type="button"
                className="text-sm text-blue-600 hover:underline"
                onClick={() => alert("Ushbu funksiya hozircha ishlamaydi")}>
                Parolni unutdingizmi?
              </button>
            </div>
          </form>

          {/* Demo Credentials */}
          <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
            <strong>Demo ma'lumotlar:</strong>
            <br />
            Admin: admin / admin123
            <br />
            Tergovchi: tergovchi1 / tergovchi123
            <br />
            Rahbar: rahbar1 / rahbar123
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
