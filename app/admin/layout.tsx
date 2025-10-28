'use client';

import { useUser } from '@clerk/nextjs';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Shield, Users, Building2, History, LayoutDashboard, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const [userRole, setUserRole] = useState<string>('viewer');
  const [isAuthorized, setIsAuthorized] = useState(false);

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

      // Only master_admin can access admin pages
      if (role === 'master_admin') {
        setIsAuthorized(true);
      } else {
        console.log('[Admin Layout] Redirecting non-master_admin to dashboard');
        // Redirect non-master admins to dashboard
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
      href: '/admin/campuses',
      label: 'Campuses',
      icon: Building2,
    },
    {
      href: '/admin/audit-logs',
      label: 'Audit Logs',
      icon: History,
    },
  ];

  const isActive = (href: string, exact?: boolean) => {
    if (exact) {
      return pathname === href;
    }
    return pathname?.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center border bg-primary">
                <Shield className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Admin Panel</h1>
                <p className="text-xs text-muted-foreground">Master Admin Controls</p>
              </div>
            </div>
            <Link href="/dashboard">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar Navigation */}
          <aside className="w-64 flex-shrink-0">
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href, item.exact);

                return (
                  <Link key={item.href} href={item.href}>
                    <Button
                      variant={active ? 'secondary' : 'ghost'}
                      className={`w-full justify-start ${
                        active ? 'bg-primary text-primary-foreground' : 'text-foreground'
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
          <main className="flex-1 min-w-0">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
