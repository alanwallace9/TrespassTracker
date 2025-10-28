'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Shield, LogOut, Settings, User, ChevronDown, Search, Plus, Upload, LayoutGrid, List, FileText, Power, History, MessageSquare, Bell } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import { SettingsDialog } from '@/components/SettingsDialog';
import { AddRecordDialog } from '@/components/AddRecordDialog';
import { CSVUploadDialog } from '@/components/CSVUploadDialog';
import { InviteUserDialog } from '@/components/InviteUserDialog';
import { StatsDropdown } from '@/components/StatsDropdown';
import { AdminAuditLog } from '@/components/AdminAuditLog';
import { getDisplayName, getUserProfile } from '@/app/actions/users';
import { TrespassRecord, UserProfile } from '@/lib/supabase';
import { useExpiringWarnings } from '@/hooks/useExpiringWarnings';

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
  records?: TrespassRecord[];
  onShowExpiring?: () => void;
  showExpiringOnly?: boolean;
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
  records = [],
  onShowExpiring,
  showExpiringOnly = false,
}: DashboardLayoutProps) {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [csvDialogOpen, setCSVDialogOpen] = useState(false);
  const [addUserDialogOpen, setAddUserDialogOpen] = useState(false);
  const [auditLogOpen, setAuditLogOpen] = useState(false);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string>('viewer');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [notificationDismissed, setNotificationDismissed] = useState(false);
  // Initialize theme state directly from localStorage (no useEffect delay)
  // The blocking script in layout.tsx already set the data-theme attribute
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      return (saved as 'light' | 'dark') || 'dark';
    }
    return 'dark';
  });
  const initializingRef = useRef(false);
  const initializedRef = useRef(false);

  // Use the expiring warnings hook
  const { count: expiringCount } = useExpiringWarnings(records, userProfile);

  // Check if notification was dismissed this session
  useEffect(() => {
    if (typeof window !== 'undefined' && user) {
      const dismissed = sessionStorage.getItem(`notification-dismissed-${user.id}`);
      setNotificationDismissed(dismissed === 'true');
    }
  }, [user]);

  // Removed client-side auth redirect - middleware handles authentication
  // This was causing a redirect loop after login because of timing issues
  // with Clerk session loading after window.location.href redirect

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
        // Logging handled in sync-user.ts
      } catch (error) {
        // Silently fail - sync will happen via webhook or next load
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
      setDisplayName(name);
    } catch (error) {
      // Silently fail - display name is optional
      setDisplayName(null);
    }

    // Fetch full user profile for notifications
    try {
      const profile = await getUserProfile(user.id);
      if (profile) {
        setUserProfile(profile);
      }
    } catch (error) {
      // Silently fail - profile is optional for notifications
      setUserProfile(null);
    }
  };

  const handleSignOut = async () => {
    // Clear notification dismissed flag on logout
    if (typeof window !== 'undefined' && user) {
      sessionStorage.removeItem(`notification-dismissed-${user.id}`);
    }
    await signOut();
    router.push('/login');
  };

  const handleBellClick = () => {
    // Mark notification as dismissed for this session
    if (typeof window !== 'undefined' && user) {
      sessionStorage.setItem(`notification-dismissed-${user.id}`, 'true');
      setNotificationDismissed(true);
    }
    // Call the original handler
    if (onShowExpiring) {
      onShowExpiring();
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  };

  // Show loading state while auth is initializing
  // Middleware protects the route, so we know user will be authenticated
  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-sm text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
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

              {/* Notification Bell */}
              {userProfile && userProfile.notifications_enabled && userProfile.role !== 'viewer' && expiringCount > 0 && !notificationDismissed && (
                <button
                  onClick={handleBellClick}
                  className={`h-9 w-9 flex items-center justify-center rounded-lg transition-all hover:scale-110 border border-birdville-light-gold bg-input relative ${showExpiringOnly ? 'ring-2 ring-primary' : ''}`}
                  aria-label={`${expiringCount} trespass warning${expiringCount !== 1 ? 's' : ''} expiring soon`}
                  title={`${expiringCount} warning${expiringCount !== 1 ? 's' : ''} expiring within 1 week`}
                >
                  <Bell className="w-5 h-5 text-foreground" />
                  {expiringCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center leading-none">
                      {expiringCount > 99 ? '99+' : expiringCount}
                    </span>
                  )}
                </button>
              )}

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
                      setTimeout(() => setAuditLogOpen(true), 150);
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
                <div className="relative w-full min-w-[150px] flex-1">
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
                  <SelectTrigger className="w-[130px] sm:w-[150px] bg-input border-border text-foreground [&>span]:text-slate-300 dark:[&>span]:text-slate-300">
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
      <InviteUserDialog
        open={addUserDialogOpen}
        onOpenChange={setAddUserDialogOpen}
        onUserInvited={handleDialogClose}
      />
      <AdminAuditLog
        open={auditLogOpen}
        onOpenChange={setAuditLogOpen}
      />
    </div>
  );
}
