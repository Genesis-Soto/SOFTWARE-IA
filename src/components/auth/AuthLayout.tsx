import { Code2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface AuthLayoutProps {
  heading: string;
  headingAccent: string;
  description: string;
  cardTitle: string;
  cardDescription: string;
  children: React.ReactNode;
}

export default function AuthLayout({
  heading,
  headingAccent,
  description,
  cardTitle,
  cardDescription,
  children,
}: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Decorative */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-900 flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center">
              <Code2 className="w-6 h-6 text-white" />
            </div>
            <span className="text-white font-bold text-xl">SoftArchitect AI</span>
          </div>
          <h2 className="text-white text-4xl font-bold mb-4 leading-tight">
            {heading}<br />
            <span className="text-blue-400">{headingAccent}</span>
          </h2>
          <p className="text-slate-400 text-lg max-w-md">
            {description}
          </p>
        </div>
        <div className="relative z-10 text-slate-500 text-sm">
          Fase 1: Infraestructura y Autenticacion
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-slate-50">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center">
              <Code2 className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-xl text-slate-900">SoftArchitect AI</span>
          </div>

          <Card className="border-0 shadow-lg">
            <CardHeader className="space-y-1 pb-4">
              <CardTitle className="text-2xl font-bold text-slate-900">{cardTitle}</CardTitle>
              <CardDescription className="text-slate-500">
                {cardDescription}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {children}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
