'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  FileBarChart,
  Eye,
  Activity,
  TrendingUp,
  Users,
  Building2,
  Calendar,
  Download,
  Clock
} from 'lucide-react';
import { format, subDays, subMonths, startOfDay, endOfDay } from 'date-fns';
import { getAuditLogs, type AuditLogFilters } from '@/app/actions/admin/audit-logs';
import Papa from 'papaparse';

type ReportType =
  | 'ferpa_access'
  | 'user_activity'
  | 'record_frequency'
  | 'campus_activity'
  | 'modification_history'
  | 'custom';

export default function ReportsPage() {
  const [selectedReport, setSelectedReport] = useState<ReportType | null>(null);
  const [generating, setGenerating] = useState(false);
  const [dateRange, setDateRange] = useState('last_7_days');
  const [customDateFrom, setCustomDateFrom] = useState('');
  const [customDateTo, setCustomDateTo] = useState('');
  const [targetUserId, setTargetUserId] = useState('');
  const [targetRecordId, setTargetRecordId] = useState('');

  const reports = [
    {
      id: 'ferpa_access' as ReportType,
      title: 'FERPA Access Report',
      description: 'Who viewed which records and when (FERPA compliance)',
      icon: Eye,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      id: 'user_activity' as ReportType,
      title: 'User Activity Summary',
      description: 'All actions performed by specific users',
      icon: Activity,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      id: 'record_frequency' as ReportType,
      title: 'Record Access Frequency',
      description: 'Most viewed records and access patterns',
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      id: 'campus_activity' as ReportType,
      title: 'Campus Activity Report',
      description: 'All activity for specific campus locations',
      icon: Building2,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
    {
      id: 'modification_history' as ReportType,
      title: 'Modification History',
      description: 'All edits with before/after values',
      icon: Clock,
      color: 'text-pink-600',
      bgColor: 'bg-pink-50',
    },
    {
      id: 'custom' as ReportType,
      title: 'Custom Report',
      description: 'Build a custom report with your own filters',
      icon: FileBarChart,
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
    },
  ];

  const getDateRange = () => {
    const now = new Date();
    switch (dateRange) {
      case 'last_7_days':
        return {
          from: startOfDay(subDays(now, 7)).toISOString(),
          to: endOfDay(now).toISOString(),
        };
      case 'last_30_days':
        return {
          from: startOfDay(subDays(now, 30)).toISOString(),
          to: endOfDay(now).toISOString(),
        };
      case 'last_90_days':
        return {
          from: startOfDay(subDays(now, 90)).toISOString(),
          to: endOfDay(now).toISOString(),
        };
      case 'last_6_months':
        return {
          from: startOfDay(subMonths(now, 6)).toISOString(),
          to: endOfDay(now).toISOString(),
        };
      case 'custom':
        return {
          from: customDateFrom ? startOfDay(new Date(customDateFrom)).toISOString() : undefined,
          to: customDateTo ? endOfDay(new Date(customDateTo)).toISOString() : undefined,
        };
      default:
        return {};
    }
  };

  const generateReport = async (reportType: ReportType) => {
    setGenerating(true);
    try {
      const dates = getDateRange();
      let filters: AuditLogFilters = {
        dateFrom: dates.from,
        dateTo: dates.to,
      };

      // Apply report-specific filters
      switch (reportType) {
        case 'ferpa_access':
          filters.eventTypes = ['record.viewed'];
          break;
        case 'user_activity':
          if (targetUserId) {
            filters.actorEmail = targetUserId;
          }
          break;
        case 'record_frequency':
          filters.eventTypes = ['record.viewed'];
          // Will need to aggregate in post-processing
          break;
        case 'campus_activity':
          // Campus filter is applied in the main filters
          break;
        case 'modification_history':
          filters.eventTypes = ['record.created', 'record.updated', 'record.deleted'];
          break;
        case 'custom':
          // Use all filters as-is
          break;
      }

      // Fetch data
      const response = await getAuditLogs(filters, { page: 1, limit: 10000 });

      // Generate CSV
      let csvData: any[];
      let filename = `${reportType}-${format(new Date(), 'yyyy-MM-dd')}.csv`;

      switch (reportType) {
        case 'ferpa_access':
          csvData = response.logs.map(log => ({
            Timestamp: format(new Date(log.created_at), 'yyyy-MM-dd HH:mm:ss'),
            'Accessed By': log.actor_email || log.actor_id,
            'User Role': log.actor_role || 'N/A',
            'Record/Student Name': log.record_subject_name || 'N/A',
            'Record ID': log.target_id || 'N/A',
            Action: log.action,
          }));
          break;

        case 'user_activity':
          csvData = response.logs.map(log => ({
            Timestamp: format(new Date(log.created_at), 'yyyy-MM-dd HH:mm:ss'),
            'Event Type': log.event_type,
            'Actor': log.actor_email || log.actor_id,
            'Record/Subject': log.record_subject_name || 'N/A',
            Action: log.action,
            'Target ID': log.target_id || 'N/A',
          }));
          break;

        case 'record_frequency':
          // Aggregate by record
          const recordAccess = response.logs.reduce((acc, log) => {
            const key = log.target_id || 'Unknown';
            if (!acc[key]) {
              acc[key] = {
                recordId: key,
                recordName: log.record_subject_name || 'N/A',
                accessCount: 0,
                uniqueUsers: new Set<string>(),
                lastAccessed: log.created_at,
              };
            }
            acc[key].accessCount++;
            if (log.actor_email) {
              acc[key].uniqueUsers.add(log.actor_email);
            }
            return acc;
          }, {} as Record<string, any>);

          csvData = Object.values(recordAccess)
            .sort((a: any, b: any) => b.accessCount - a.accessCount)
            .map((record: any) => ({
              'Record ID': record.recordId,
              'Record/Student Name': record.recordName,
              'Total Access Count': record.accessCount,
              'Unique Users': record.uniqueUsers.size,
              'Last Accessed': format(new Date(record.lastAccessed), 'yyyy-MM-dd HH:mm:ss'),
            }));
          break;

        case 'modification_history':
          csvData = response.logs.map(log => ({
            Timestamp: format(new Date(log.created_at), 'yyyy-MM-dd HH:mm:ss'),
            'Event Type': log.event_type,
            'Modified By': log.actor_email || log.actor_id,
            'User Role': log.actor_role || 'N/A',
            'Record/Subject': log.record_subject_name || 'N/A',
            Action: log.action,
            'Fields Changed': log.details?.fieldsUpdated?.join(', ') || 'N/A',
            Details: JSON.stringify(log.details?.changes || {}),
          }));
          break;

        default:
          csvData = response.logs.map(log => ({
            Timestamp: format(new Date(log.created_at), 'yyyy-MM-dd HH:mm:ss'),
            Event: log.event_type,
            Actor: log.actor_email || log.actor_id,
            Role: log.actor_role || 'N/A',
            'Record/Subject': log.record_subject_name || 'N/A',
            Action: log.action,
            'Target ID': log.target_id || 'N/A',
          }));
      }

      // Download CSV
      const csv = Papa.unparse(csvData);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      link.click();

    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Reports</h1>
        <p className="text-muted-foreground mt-1">
          Pre-built compliance reports and analytics
        </p>
      </div>

      {/* Report Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {reports.map((report) => {
          const Icon = report.icon;
          return (
            <Card
              key={report.id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                selectedReport === report.id ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => setSelectedReport(report.id)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className={`w-12 h-12 rounded-lg ${report.bgColor} flex items-center justify-center`}>
                    <Icon className={`w-6 h-6 ${report.color}`} />
                  </div>
                </div>
                <CardTitle className="text-lg mt-4">{report.title}</CardTitle>
                <CardDescription>{report.description}</CardDescription>
              </CardHeader>
            </Card>
          );
        })}
      </div>

      {/* Report Configuration */}
      {selectedReport && (
        <Card>
          <CardHeader>
            <CardTitle>Configure Report</CardTitle>
            <CardDescription>
              Set parameters for your {reports.find(r => r.id === selectedReport)?.title}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Date Range */}
            <div>
              <Label htmlFor="dateRange">Date Range</Label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="last_7_days">Last 7 Days</SelectItem>
                  <SelectItem value="last_30_days">Last 30 Days</SelectItem>
                  <SelectItem value="last_90_days">Last 90 Days</SelectItem>
                  <SelectItem value="last_6_months">Last 6 Months</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Custom Date Range */}
            {dateRange === 'custom' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="dateFrom">From</Label>
                  <Input
                    id="dateFrom"
                    type="date"
                    value={customDateFrom}
                    onChange={(e) => setCustomDateFrom(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="dateTo">To</Label>
                  <Input
                    id="dateTo"
                    type="date"
                    value={customDateTo}
                    onChange={(e) => setCustomDateTo(e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* User Activity Specific */}
            {selectedReport === 'user_activity' && (
              <div>
                <Label htmlFor="targetUser">User Email (Optional)</Label>
                <Input
                  id="targetUser"
                  placeholder="Filter by specific user email..."
                  value={targetUserId}
                  onChange={(e) => setTargetUserId(e.target.value)}
                />
              </div>
            )}

            {/* Generate Button */}
            <div className="flex gap-2 pt-4">
              <Button onClick={() => generateReport(selectedReport)} disabled={generating}>
                <Download className="w-4 h-4 mr-2" />
                {generating ? 'Generating...' : 'Generate & Download CSV'}
              </Button>
              <Button variant="outline" onClick={() => setSelectedReport(null)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Access Guide */}
      {!selectedReport && (
        <Card>
          <CardHeader>
            <CardTitle>Report Types</CardTitle>
            <CardDescription>Select a report type above to get started</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 text-sm">
              <li>
                <strong>FERPA Access Report:</strong> Track who viewed what records for FERPA compliance audits
              </li>
              <li>
                <strong>User Activity Summary:</strong> See all actions taken by a specific user
              </li>
              <li>
                <strong>Record Access Frequency:</strong> Identify most-accessed records and potential anomalies
              </li>
              <li>
                <strong>Campus Activity Report:</strong> Review all activity at specific campus locations
              </li>
              <li>
                <strong>Modification History:</strong> Audit trail of all changes with before/after values
              </li>
              <li>
                <strong>Custom Report:</strong> Build your own report with flexible filters
              </li>
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
