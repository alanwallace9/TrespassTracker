'use client';

import { useEffect, useState } from 'react';
import { getAuditLogs, type AuditLog } from '@/app/actions/admin/audit-logs';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { format } from 'date-fns';

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const data = await getAuditLogs(200); // Last 200 logs
      setLogs(data);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getEventTypeColor = (eventType: string) => {
    if (eventType.includes('created') || eventType.includes('invited')) {
      return 'bg-green-100 text-green-800';
    }
    if (eventType.includes('updated')) {
      return 'bg-blue-100 text-blue-800';
    }
    if (eventType.includes('deleted')) {
      return 'bg-red-100 text-red-800';
    }
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Audit Logs</h1>
          <p className="text-muted-foreground mt-1">
            System activity and administrative actions
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchLogs}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground mt-4">Loading audit logs...</p>
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden bg-card">
          <div className="max-h-[600px] overflow-y-auto">
            <table className="w-full">
              <thead className="bg-muted sticky top-0">
                <tr>
                  <th className="text-left p-4 font-medium">Timestamp</th>
                  <th className="text-left p-4 font-medium">Event</th>
                  <th className="text-left p-4 font-medium">Actor</th>
                  <th className="text-left p-4 font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-muted/50">
                    <td className="p-4 text-sm text-muted-foreground whitespace-nowrap">
                      {format(new Date(log.created_at), 'MMM d, yyyy HH:mm:ss')}
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getEventTypeColor(log.event_type)}`}>
                        {log.event_type}
                      </span>
                    </td>
                    <td className="p-4 text-sm">
                      <div>{log.actor_email || log.actor_id}</div>
                      {log.actor_role && (
                        <div className="text-xs text-muted-foreground">{log.actor_role}</div>
                      )}
                    </td>
                    <td className="p-4 text-sm">{log.action}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="text-sm text-muted-foreground">
        Showing last {logs.length} audit log entries
      </div>
    </div>
  );
}
