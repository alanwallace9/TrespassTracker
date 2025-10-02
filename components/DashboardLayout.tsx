'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Shield, LogOut, Settings, User, ChevronDown, Search, Plus, Upload, LayoutGrid, List, FileText } from 'lucide-react';
import { useEffect, useState } from 'react';
import { SettingsDialog } from '@/components/SettingsDialog';
import { AddRecordDialog } from '@/components/AddRecordDialog';
import { CSVUploadDialog } from '@/components/CSVUploadDialog';
import { AddUserDialog } from '@/components/AddUserDialog';
import { StatsDropdown } from '@/components/StatsDropdown';
import { supabase } from '@/lib/supabase';

interface DashboardLayoutProps {
  children: React.ReactNode;
  onRefresh?: () => void;
  stats?: { total: number; active: number; inactive: number };
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  statusFilter?: string;
  onStatusFilterChange?: (filter: string) => void;
  viewMode?: 'list' | 'card';
  onViewModeChange?: (mode: 'list' | 'card') => void;
}

export function DashboardLayout({
  children,
  onRefresh,
  stats,
  searchQuery = '',
  onSearchChange,
  statusFilter = 'active',
  onStatusFilterChange,
  viewMode = 'list',
  onViewModeChange,
}: DashboardLayoutProps) {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [csvDialogOpen, setCSVDialogOpen] = useState(false);
  const [addUserDialogOpen, setAddUserDialogOpen] = useState(false);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string>('viewer');

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      fetchDisplayName();
    }
  }, [user]);

  const fetchDisplayName = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('user_profiles')
      .select('display_name, role')
      .eq('id', user.id)
      .maybeSingle();

    if (data?.display_name) {
      setDisplayName(data.display_name);
    }
    if (data?.role) {
      setUserRole(data.role);
    } else {
      setUserRole('viewer');
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const handleDialogClose = () => {
    if (onRefresh) {
      onRefresh();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">BISD Trespass Management</h1>
                <p className="text-xs text-muted-foreground">School District Management</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <User className="w-4 h-4" />
                    <span className="hidden sm:inline">{displayName || user.email?.split('@')[0]}</span>
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">{displayName || 'User'}</p>
                      <p className="text-xs text-slate-500">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {stats && (
                    <>
                      <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                        <div className="flex justify-between items-center w-full">
                          <span className="text-slate-600">Total Records</span>
                          <span className="font-semibold">{stats.total}</span>
                        </div>
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                        <div className="flex justify-between items-center w-full">
                          <span style={{color: '#22c45d'}}>Active</span>
                          <span className="font-semibold" style={{color: '#22c45d'}}>{stats.active}</span>
                        </div>
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                        <div className="flex justify-between items-center w-full">
                          <span className="text-yellow-600">Inactive</span>
                          <span className="font-semibold text-yellow-600">{stats.inactive}</span>
                        </div>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  <DropdownMenuItem onClick={() => setCSVDialogOpen(true)}>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload CSV
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setAddDialogOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Record
                  </DropdownMenuItem>
                  {(userRole === 'master_admin' || userRole === 'district_admin') && (
                    <DropdownMenuItem onClick={() => setAddUserDialogOpen(true)}>
                      <User className="w-4 h-4 mr-2" />
                      Add User
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setSettingsOpen(true)}>
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          {onSearchChange && onStatusFilterChange && onViewModeChange && (
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center py-4 border-t border-border">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search by name or location..."
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="pl-10 bg-input border-border text-foreground placeholder:text-muted-foreground"
                />
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <Select value={statusFilter} onValueChange={onStatusFilterChange}>
                  <SelectTrigger className="w-full sm:w-[180px] bg-input border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex border border-border rounded-lg">
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => onViewModeChange('list')}
                    className="rounded-r-none"
                  >
                    <List className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'card' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => onViewModeChange('card')}
                    className="rounded-l-none"
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
      <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
      <AddRecordDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onRecordAdded={handleDialogClose}
      />
      <CSVUploadDialog
        open={csvDialogOpen}
        onOpenChange={setCSVDialogOpen}
        onRecordsUploaded={handleDialogClose}
      />
      <AddUserDialog
        open={addUserDialogOpen}
        onOpenChange={setAddUserDialogOpen}
        onUserAdded={handleDialogClose}
      />
    </div>
  );
}
