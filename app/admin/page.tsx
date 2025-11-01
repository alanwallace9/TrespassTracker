'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Building2, FileText, Activity } from 'lucide-react';
import { getAdminStats, type AdminStats } from '@/app/actions/admin/overview';

export default function AdminOverview() {
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    activeUsers: 0,
    totalCampuses: 0,
    totalRecords: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const data = await getAdminStats();
        setStats(data);
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      description: `${stats.activeUsers} active`,
      icon: Users,
      color: 'text-blue-600',
    },
    {
      title: 'Campuses',
      value: stats.totalCampuses,
      description: 'Active campuses',
      icon: Building2,
      color: 'text-green-600',
    },
    {
      title: 'Records',
      value: stats.totalRecords,
      description: 'Total trespass records',
      icon: FileText,
      color: 'text-purple-600',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Admin Overview</h1>
        <p className="text-muted-foreground mt-2">
          System-wide statistics and quick access to admin functions
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-3">
                <div className="h-4 bg-slate-200 rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-slate-200 rounded w-1/3"></div>
              </CardHeader>
              <CardContent>
                <div className="h-3 bg-slate-200 rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {statCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </CardTitle>
                    <Icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                  <div className="text-3xl font-bold text-foreground">{stat.value}</div>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">{stat.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Quick Actions
          </CardTitle>
          <CardDescription>Common administrative tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <a
              href="/admin/users"
              className="p-4 border rounded-lg hover:bg-accent transition-colors"
            >
              <h3 className="font-semibold text-foreground mb-1">Manage Users</h3>
              <p className="text-sm text-muted-foreground">
                View, edit, invite, or remove users
              </p>
            </a>
            <a
              href="/admin/campuses"
              className="p-4 border rounded-lg hover:bg-accent transition-colors"
            >
              <h3 className="font-semibold text-foreground mb-1">Manage Campuses</h3>
              <p className="text-sm text-muted-foreground">
                Add, edit, or deactivate campus locations
              </p>
            </a>
            <a
              href="/admin/audit-logs"
              className="p-4 border rounded-lg hover:bg-accent transition-colors"
            >
              <h3 className="font-semibold text-foreground mb-1">View Audit Logs</h3>
              <p className="text-sm text-muted-foreground">
                Review system activity and changes
              </p>
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
