'use client';

import { useUser } from '@clerk/nextjs';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, Building2, History, LayoutDashboard, ArrowLeft, FileBarChart, Building, MessageSquare, FileText } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { AdminTenantProvider, useAdminTenant } from '@/contexts/AdminTenantContext';

function AdminLayoutInner({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const [userRole, setUserRole] = useState<string>('viewer');
  const [isAuthorized, setIsAuthorized] = useState(false);
  const { tenants, selectedTenantId, setSelectedTenantId, tenantsLoading } = useAdminTenant();

  useEffect(() => {
    // Middleware already protects this route, so user will always be authenticated
    // We just need to check the role from Clerk's publicMetadata
    if (isLoaded && user) {
      const role = (user.publicMetadata?.role as string) || 'viewer';
      setUserRole(role);

      console.log('[Admin Layout] User loaded:', {
        userId: user.id,
        email: user.primaryEmailAddress?.emailAddress,
        role: role,
        publicMetadata: user.publicMetadata,
      });

      // Allow master_admin and district_admin to access admin pages
      if (role === 'master_admin' || role === 'district_admin') {
        setIsAuthorized(true);
      } else {
        console.log('[Admin Layout] Redirecting non-admin to dashboard');
        // Redirect non-admins to dashboard
        router.push('/dashboard');
      }
    }
  }, [user, isLoaded, router]);

  // Show loading state while checking authorization
  // Middleware ensures user is authenticated
  if (!isLoaded || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-sm text-muted-foreground">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  // Don't render if not authorized (will redirect via useEffect)
  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-sm text-muted-foreground">Checking permissions...</p>
        </div>
      </div>
    );
  }

  const navItems = [
    {
      href: '/admin',
      label: 'Overview',
      icon: LayoutDashboard,
      exact: true,
    },
    {
      href: '/admin/users',
      label: 'Users',
      icon: Users,
    },
    {
      href: '/admin/records',
      label: 'Records',
      icon: FileText,
    },
    {
      href: '/admin/campuses',
      label: 'Campuses',
      icon: Building2,
    },
    {
      href: '/admin/audit-logs',
      label: 'Audit Logs',
      icon: History,
    },
    {
      href: '/admin/reports',
      label: 'Reports',
      icon: FileBarChart,
    },
    {
      href: '/admin/feedback',
      label: 'Feedback',
      icon: MessageSquare,
      masterAdminOnly: true,
    },
    {
      href: '/admin/tenants',
      label: 'Tenants',
      icon: Building,
      masterAdminOnly: true,
    },
  ];

  const isActive = (href: string, exact?: boolean) => {
    if (exact) {
      return pathname === href;
    }
    return pathname?.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      {/* Header */}
      <header className="bg-white/95 border-b border-slate-200 sticky top-0 z-50 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Image
                src="/assets/logo1.svg"
                alt="District Tracker Logo"
                width={40}
                height={40}
                className="w-10 h-10"
              />
              <div>
                <h1 className="text-xl font-bold text-foreground">District Tracker</h1>
                <p className="text-xs text-muted-foreground">
                  {userRole === 'master_admin' ? 'Master Admin Panel' : 'Admin Panel'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Tenant Selector - Only for master_admin with multiple tenants */}
              {userRole === 'master_admin' && tenants.length > 1 && !tenantsLoading && selectedTenantId && (
                <div className="flex items-center gap-2">
                  <Building className="w-4 h-4 text-muted-foreground" />
                  <Select value={selectedTenantId} onValueChange={setSelectedTenantId}>
                    <SelectTrigger className="w-[220px] bg-white border border-slate-300 shadow-sm focus:ring-2 focus:ring-slate-200">
                      <SelectValue placeholder="Select District" />
                    </SelectTrigger>
                    <SelectContent>
                      {tenants.map((tenant) => (
                        <SelectItem key={tenant.id} value={tenant.id}>
                          {tenant.display_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <Link href="/dashboard">
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-white border border-slate-300 text-slate-700 shadow-sm hover:bg-slate-100 hover:text-slate-900 hover:border-slate-300"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8 items-start">
          {/* Sidebar Navigation */}
          <aside className="w-64 flex-shrink-0">
            <nav className="space-y-2">
              {navItems
                .filter((item) => !item.masterAdminOnly || userRole === 'master_admin')
                .map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href, item.exact);

                  return (
                    <Link key={item.href} href={item.href}>
                      <Button
                        variant={active ? 'secondary' : 'ghost'}
                        className={`w-full justify-start rounded-xl ${
                          active
                            ? 'bg-primary text-primary-foreground shadow-sm'
                            : 'text-slate-700 hover:bg-white hover:text-slate-900 border border-transparent hover:border-slate-200'
                        }`}
                      >
                        <Icon className="w-4 h-4 mr-3" />
                        {item.label}
                      </Button>
                    </Link>
                  );
                })}
            </nav>
          </aside>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
              <main className="flex-1 min-w-0">{children}</main>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminTenantProvider>
      <AdminLayoutInner>{children}</AdminLayoutInner>
    </AdminTenantProvider>
  );
}
