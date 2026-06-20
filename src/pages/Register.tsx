import { useState } from 'react';
import { Link } from 'react-router';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { UserPlus, Mail, Lock, User, Loader2 } from 'lucide-react';
import AuthLayout from '@/components/auth/AuthLayout';
import FormErrorAlert from '@/components/auth/FormErrorAlert';
import useAuthForm from '@/hooks/useAuthForm';

export default function Register() {
  const { register } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('ANALYST');

  const { error, loading, handleSubmit } = useAuthForm({
    onSubmit: () => register(email, password, fullName, role),
  });

  return (
    <AuthLayout
      heading="Comienza tu"
      headingAccent="Proyecto de Software"
      description="Crea tu cuenta para acceder al sistema de analisis de requisitos impulsado por inteligencia artificial."
      cardTitle="Create account"
      cardDescription="Fill in your details to get started"
    >
      <FormErrorAlert error={error} />

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="fullName" className="text-slate-700">Full Name</Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              id="fullName"
              type="text"
              placeholder="Juan Perez"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="pl-10 h-11 bg-white border-slate-200"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-slate-700">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              id="email"
              type="email"
              placeholder="juan@empresa.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10 h-11 bg-white border-slate-200"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-slate-700">Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              id="password"
              type="password"
              placeholder="Minimo 6 caracteres"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10 h-11 bg-white border-slate-200"
              required
              minLength={6}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="role" className="text-slate-700">Role</Label>
          <Select value={role} onValueChange={setRole}>
            <SelectTrigger className="h-11 bg-white border-slate-200">
              <SelectValue placeholder="Select your role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ANALYST">Analyst</SelectItem>
              <SelectItem value="ADMIN">Administrator</SelectItem>
              <SelectItem value="CLIENT">Client</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button
          type="submit"
          className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-medium"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating account...
            </>
          ) : (
            <>
              <UserPlus className="mr-2 h-4 w-4" />
              Create Account
            </>
          )}
        </Button>
      </form>

      <Separator className="my-6" />

      <p className="text-center text-sm text-slate-600">
        Already have an account?{' '}
        <Link
          to="/login"
          className="text-blue-600 hover:text-blue-700 font-medium hover:underline"
        >
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
