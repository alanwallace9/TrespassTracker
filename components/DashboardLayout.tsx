'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Shield, LogOut, Settings, User, ChevronDown, Search, Plus, Upload, LayoutGrid, List, FileText, Power, History, MessageSquare } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import { SettingsDialog } from '@/components/SettingsDialog';
import { AddRecordDialog } from '@/components/AddRecordDialog';
import { CSVUploadDialog } from '@/components/CSVUploadDialog';
import { AddUserDialog } from '@/components/AddUserDialog';
import { StatsDropdown } from '@/components/StatsDropdown';
import { getDisplayName } from '@/app/actions/users';

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
  filteredCount?: number;
}

export function DashboardLayout({
  children,
  onRefresh,
  stats,
  searchQuery = '',
  onSearchChange,
  statusFilter = 'active',
  onStatusFilterChange,
  viewMode = 'card',
  onViewModeChange,
  filteredCount,
}: DashboardLayoutProps) {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [csvDialogOpen, setCSVDialogOpen] = useState(false);
  const [addUserDialogOpen, setAddUserDialogOpen] = useState(false);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string>('viewer');
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const initializingRef = useRef(false);
  const initializedRef = useRef(false);

  // Initialize theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    const initialTheme = savedTheme || 'dark';
    setTheme(initialTheme);
    document.documentElement.setAttribute('data-theme', initialTheme);
  }, []);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Auto-sync user to Supabase on first load, then fetch display name (truly only once)
  useEffect(() => {
    const syncAndFetch = async () => {
      // Skip if already initialized or currently initializing
      if (!user || initializedRef.current || initializingRef.current) {
        return;
      }

      // Mark as initializing to prevent duplicate calls
      initializingRef.current = true;

      try {
        // Auto-sync (for development without webhooks)
        const { syncCurrentUser } = await import('@/app/actions/sync-user');
        await syncCurrentUser();
        console.log('User auto-synced to Supabase');
      } catch (error) {
        console.error('Error auto-syncing user:', error);
      }

      // Fetch display name (only once per user load)
      await fetchDisplayName();

      // Mark as fully initialized
      initializedRef.current = true;
    };

    syncAndFetch();
  }, [user]);

  const fetchDisplayName = async () => {
    if (!user) return;

    // Set role from Clerk public metadata (source of truth)
    setUserRole(user.user_metadata.role || 'viewer');

    // Fetch display name from Supabase using server action (with Clerk auth)
    try {
      const name = await getDisplayName(user.id);
      console.log('Fetch display name:', { userId: user.id, name });
      setDisplayName(name);
    } catch (error) {
      console.error('Error fetching display name:', error);
      setDisplayName(null);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
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
      <header className="bg-background sticky top-0 z-50 shadow-sm backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center border" style={{ backgroundColor: 'var(--birdville-blue)', borderColor: 'var(--birdville-light-gold)' }}>
                <Shield className="w-5 h-5" style={{ color: 'var(--birdville-light-gold)', stroke: 'var(--birdville-light-gold)', strokeWidth: '2' }} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">BISD Trespass Management</h1>
                <p className="text-xs text-muted-foreground">powered by <a href="https://DistrictTracker.com" className="underline hover:no-underline">DistrictTracker.com</a></p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {/* Theme Toggle Power Button */}
              <button
                onClick={toggleTheme}
                className="h-9 w-9 flex items-center justify-center rounded-lg transition-all hover:scale-110 border border-birdville-light-gold bg-input"
                aria-label="Toggle theme"
              >
                <Power
                  className="w-5 h-5 transition-colors"
                  style={{
                    color: theme === 'dark' ? 'oklch(0.9 0.17 100)' : 'oklch(0.65 0.15 264)',
                    filter: theme === 'dark' ? 'drop-shadow(0 0 8px oklch(0.9 0.17 100 / 0.5))' : 'drop-shadow(0 2px 4px oklch(0 0 0 / 0.2))'
                  }}
                />
              </button>

              <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2 bg-input text-foreground border-border hover:bg-input hover:text-foreground hover:scale-110">
                    <User className="w-4 h-4" />
                    <span className="hidden sm:inline">{displayName || user.email?.split('@')[0]}</span>
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel >
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
                          <span className="text-foreground">Total Records</span>
                          <span className="font-semibold text-foreground">{stats.total}</span>
                        </div>
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                        <div className="flex justify-between items-center w-full">
                          <span className="text-status-active">Active</span>
                          <span className="font-semibold text-status-active">{stats.active}</span>
                        </div>
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                        <div className="flex justify-between items-center w-full">
                          <span className="text-status-warning">Inactive</span>
                          <span className="font-semibold text-status-warning">{stats.inactive}</span>
                        </div>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  <DropdownMenuItem onSelect={(e) => {
                    e.preventDefault();
                    setDropdownOpen(false);
                    setTimeout(() => setCSVDialogOpen(true), 150);
                  }}>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload CSV
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={(e) => {
                    e.preventDefault();
                    setDropdownOpen(false);
                    setTimeout(() => setAddDialogOpen(true), 150);
                  }}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Record
                  </DropdownMenuItem>
                  {(userRole === 'district_admin' || userRole === 'master_admin') && (
                    <DropdownMenuItem onSelect={(e) => {
                      e.preventDefault();
                      setDropdownOpen(false);
                      setTimeout(() => setAddUserDialogOpen(true), 150);
                    }}>
                      <User className="w-4 h-4 mr-2" />
                      Invite User (Email)
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  {(userRole === 'district_admin' || userRole === 'master_admin') && (
                    <DropdownMenuItem onSelect={(e) => {
                      e.preventDefault();
                      setDropdownOpen(false);
                      // TODO: Open changelog modal
                      console.log('Changelog clicked - placeholder for future implementation');
                    }}>
                      <History className="w-4 h-4 mr-2" />
                      Changelog
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onSelect={(e) => {
                    e.preventDefault();
                    setDropdownOpen(false);
                    // TODO: Open feedback form (Google Form or similar)
                    window.open('https://forms.google.com/placeholder', '_blank');
                  }}>
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Send Feedback
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={(e) => {
                    e.preventDefault();
                    setDropdownOpen(false);
                    setTimeout(() => setSettingsOpen(true), 150);
                  }}>
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
              <div className="flex flex-row gap-2 items-center pt-4 pb-2 border-t" style={{ borderColor: 'var(--birdville-light-gold)' }}>
                <div className="relative w-full max-w-[280px]">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground w-4 h-4" />
                <Input
                  placeholder="Search by name or ID"
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="pl-10 bg-input border-border text-foreground placeholder:text-foreground"
                />
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <Select value={statusFilter} onValueChange={onStatusFilterChange}>
                  <SelectTrigger className="w-[130px] sm:w-[150px] bg-input border-border text-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    <SelectItem value="all">All {stats ? `(${stats.total})` : ''}</SelectItem>
                    <SelectItem value="active">Active {stats ? `(${stats.active})` : ''}</SelectItem>
                    <SelectItem value="inactive">Inactive {stats ? `(${stats.inactive})` : ''}</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex border border-border rounded-lg bg-card h-10">
                  <Button
                    variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={() => onViewModeChange('list')}
                    className={`rounded-r-none h-full ${viewMode === 'list' ? 'bg-input' : 'text-foreground'}`}
                  >
                    <List className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'card' ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={() => onViewModeChange('card')}
                    className={`rounded-l-none h-full ${viewMode === 'card' ? 'bg-input' : 'text-foreground'}`}
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              </div>
          )}
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-8">
        {children}
      </main>
      <SettingsDialog
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        onSettingsSaved={fetchDisplayName}
      />
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
