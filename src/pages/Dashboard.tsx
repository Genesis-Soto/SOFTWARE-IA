import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Code2,
  LayoutDashboard,
  FolderKanban,
  ClipboardList,
  BarChart3,
  Settings,
  LogOut,
  User,
  Bell,
  Plus,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  FileSignature,
  Cpu,
} from 'lucide-react';
import { useState } from 'react';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', active: true },
    { icon: FolderKanban, label: 'Projects', active: false },
    { icon: ClipboardList, label: 'Surveys', active: false },
    { icon: BarChart3, label: 'Analysis', active: false },
    { icon: FileSignature, label: 'Signatures', active: false },
    { icon: Cpu, label: 'UML & Architecture', active: false },
    { icon: Settings, label: 'Settings', active: false },
  ];

  const stats = [
    { title: 'Active Projects', value: '0', icon: FolderKanban, color: 'bg-blue-500', subtitle: 'Create your first project' },
    { title: 'Surveys Completed', value: '0', icon: ClipboardList, color: 'bg-green-500', subtitle: 'No surveys yet' },
    { title: 'AI Analysis', value: '0', icon: Sparkles, color: 'bg-purple-500', subtitle: 'No analysis run' },
    { title: 'UML Diagrams', value: '0', icon: Cpu, color: 'bg-orange-500', subtitle: 'No diagrams generated' },
  ];

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return <Badge className="bg-red-100 text-red-700 hover:bg-red-100">Admin</Badge>;
      case 'ANALYST':
        return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">Analyst</Badge>;
      case 'CLIENT':
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Client</Badge>;
      default:
        return <Badge variant="secondary">{role}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside
        className={`${sidebarCollapsed ? 'w-16' : 'w-64'} bg-slate-900 text-white transition-all duration-300 flex flex-col fixed h-full z-20`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-4 border-b border-slate-800">
          <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center flex-shrink-0">
            <Code2 className="w-5 h-5 text-white" />
          </div>
          {!sidebarCollapsed && (
            <span className="ml-3 font-bold text-lg truncate">SoftArchitect AI</span>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
          {menuItems.map((item) => (
            <button
              key={item.label}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left ${
                item.active
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!sidebarCollapsed && <span className="text-sm font-medium">{item.label}</span>}
            </button>
          ))}
        </nav>

        {/* Collapse Button */}
        <div className="p-2 border-t border-slate-800">
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="w-full flex items-center justify-center p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            {sidebarCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </button>
        </div>

        {/* User Profile */}
        <div className="p-3 border-t border-slate-800">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-slate-800 transition-colors text-left">
                <Avatar className="w-8 h-8 flex-shrink-0">
                  <AvatarFallback className="bg-blue-600 text-white text-xs">
                    {user ? getInitials(user.fullName) : 'U'}
                  </AvatarFallback>
                </Avatar>
                {!sidebarCollapsed && (
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{user?.fullName}</p>
                    <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                  </div>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout} className="text-red-600">
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-10">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Dashboard</h1>
            <p className="text-xs text-slate-500">Welcome back, {user?.fullName}</p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              size="sm"
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-1" />
              New Project
            </Button>
            <button className="relative p-2 rounded-lg hover:bg-slate-100 transition-colors">
              <Bell className="w-5 h-5 text-slate-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>
          </div>
        </header>

        {/* Content */}
        <div className="p-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
            {stats.map((stat) => (
              <Card key={stat.title} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm text-slate-500 mb-1">{stat.title}</p>
                      <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
                      <p className="text-xs text-slate-400 mt-1">{stat.subtitle}</p>
                    </div>
                    <div className={`w-10 h-10 rounded-lg ${stat.color} flex items-center justify-center`}>
                      <stat.icon className="w-5 h-5 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Main Content Area */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Welcome Card */}
            <Card className="lg:col-span-2 border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-500" />
                  Phase 1 Complete: Authentication System
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-900 mb-2">What's Working</h3>
                  <ul className="space-y-2 text-sm text-blue-800">
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      User registration with role selection (Admin, Analyst, Client)
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      JWT authentication with secure token storage
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      Password hashing with bcrypt (12 salt rounds)
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      Protected routes with auth middleware
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      Professional UI with sidebar navigation
                    </li>
                  </ul>
                </div>

                <Separator />

                <div>
                  <h3 className="font-semibold text-slate-900 mb-2">Next Phases</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="border border-slate-200 rounded-lg p-3 opacity-60">
                      <div className="flex items-center gap-2 mb-1">
                        <FolderKanban className="w-4 h-4 text-blue-500" />
                        <span className="font-medium text-sm">Phase 2</span>
                      </div>
                      <p className="text-xs text-slate-500">Projects & AI Survey Generation</p>
                    </div>
                    <div className="border border-slate-200 rounded-lg p-3 opacity-60">
                      <div className="flex items-center gap-2 mb-1">
                        <FileSignature className="w-4 h-4 text-green-500" />
                        <span className="font-medium text-sm">Phase 3</span>
                      </div>
                      <p className="text-xs text-slate-500">Digital Signature & PDF</p>
                    </div>
                    <div className="border border-slate-200 rounded-lg p-3 opacity-60">
                      <div className="flex items-center gap-2 mb-1">
                        <Sparkles className="w-4 h-4 text-purple-500" />
                        <span className="font-medium text-sm">Phase 4</span>
                      </div>
                      <p className="text-xs text-slate-500">AI Requirements Analysis</p>
                    </div>
                    <div className="border border-slate-200 rounded-lg p-3 opacity-60">
                      <div className="flex items-center gap-2 mb-1">
                        <Cpu className="w-4 h-4 text-orange-500" />
                        <span className="font-medium text-sm">Phase 5</span>
                      </div>
                      <p className="text-xs text-slate-500">UML & Architecture Design</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* User Profile Card */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Profile</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <Avatar className="w-16 h-16">
                    <AvatarFallback className="bg-blue-600 text-white text-xl">
                      {user ? getInitials(user.fullName) : 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-slate-900">{user?.fullName}</p>
                    <p className="text-sm text-slate-500">{user?.email}</p>
                    <div className="mt-1">{getRoleBadge(user?.role || '')}</div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">User ID</span>
                    <span className="text-slate-700 font-mono text-xs">{user?.id?.slice(0, 8)}...</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Status</span>
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      <span className="text-green-700">Active</span>
                    </div>
                  </div>
                </div>

                <Separator />

                <Button
                  variant="outline"
                  className="w-full text-red-600 border-red-200 hover:bg-red-50"
                  onClick={logout}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Log Out
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
