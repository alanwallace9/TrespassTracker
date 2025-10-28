'use client';

import { useEffect, useState } from 'react';
import { getCampuses, type Campus } from '@/app/actions/campuses';
import { Button } from '@/components/ui/button';
import { RefreshCw, Building2 } from 'lucide-react';
import { format } from 'date-fns';

export default function CampusesManagementPage() {
  const [campuses, setCampuses] = useState<Campus[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCampuses();
  }, []);

  const fetchCampuses = async () => {
    setLoading(true);
    try {
      const data = await getCampuses();
      setCampuses(data);
    } catch (error) {
      console.error('Error fetching campuses:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Campus Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage campus locations and assignments
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchCampuses}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground mt-4">Loading campuses...</p>
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden bg-card">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="text-left p-4 font-medium">ID</th>
                <th className="text-left p-4 font-medium">Name</th>
                <th className="text-left p-4 font-medium">Abbreviation</th>
                <th className="text-left p-4 font-medium">Status</th>
                <th className="text-left p-4 font-medium">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {campuses.map((campus) => (
                <tr key={campus.id} className="hover:bg-muted/50">
                  <td className="p-4 font-mono text-sm">{campus.id}</td>
                  <td className="p-4 font-medium">{campus.name}</td>
                  <td className="p-4 text-sm">{campus.abbreviation}</td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      campus.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {campus.status}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-muted-foreground">
                    {format(new Date(campus.created_at), 'MMM d, yyyy')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="text-sm text-muted-foreground">
        Showing {campuses.length} campuses
      </div>
    </div>
  );
}
