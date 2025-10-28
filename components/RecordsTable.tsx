'use client';

import { TrespassRecord } from '@/lib/supabase';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileDown, FileSpreadsheet } from 'lucide-react';
import { format } from 'date-fns';

type RecordsTableProps = {
  records: TrespassRecord[];
  onViewRecord: (record: TrespassRecord) => void;
};

export function RecordsTable({ records, onViewRecord }: RecordsTableProps) {
  const exportToCSV = () => {
    // Create CSV headers
    const headers = ['Name', 'ID Number', 'Expiration Date', 'Birth Date', 'Trespassed From', 'Status', 'Location', 'Incident Date'];

    // Create CSV rows
    const rows = records.map((record) => {
      const expired = isExpired(record);
      const displayStatus = expired ? 'inactive' : record.status;
      const shortId = record.id ? record.id.slice(-6).toUpperCase() : 'N/A';

      return [
        `"${record.first_name} ${record.last_name}"`,
        shortId,
        record.expiration_date ? format(new Date(record.expiration_date), 'MM/dd/yyyy') : 'N/A',
        record.date_of_birth ? format(new Date(record.date_of_birth), 'MM/dd/yyyy') : 'N/A',
        `"${record.trespassed_from || 'N/A'}"`,
        displayStatus,
        `"${record.location || 'N/A'}"`,
        record.incident_date ? format(new Date(record.incident_date), 'MM/dd/yyyy') : 'N/A',
      ].join(',');
    });

    // Combine headers and rows
    const csv = [headers.join(','), ...rows].join('\n');

    // Create download link
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `trespass-records-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const exportToExcel = () => {
    // For XLSX export, we'll use the same CSV format but with .xlsx extension
    // In a production app, you'd want to use a library like xlsx or exceljs
    exportToCSV();
  };
  const isExpired = (record: TrespassRecord) => {
    return record.expiration_date && new Date(record.expiration_date) < new Date();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-status-success text-white hover:bg-status-success/90';
      case 'expired':
        return 'bg-status-error/10 text-status-error hover:bg-status-error/20';
      case 'inactive':
        return 'bg-status-error/10 text-status-error hover:bg-status-error/20';
      default:
        return 'bg-muted text-muted-foreground hover:bg-muted';
    }
  };

  return (
    <div className="space-y-4">
      {/* Export buttons and count */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Showing <span className="font-semibold text-foreground">{records.length}</span> record{records.length !== 1 ? 's' : ''}
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={exportToCSV}
            disabled={records.length === 0}
            className="gap-2"
          >
            <FileDown className="w-4 h-4" />
            Export CSV
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={exportToExcel}
            disabled={records.length === 0}
            className="gap-2"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Export XLSX
          </Button>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-foreground">Name</TableHead>
                <TableHead className="text-foreground">ID Number</TableHead>
                <TableHead className="text-foreground hidden md:table-cell">Expiration Date</TableHead>
                <TableHead className="text-foreground">Trespassed From</TableHead>
                <TableHead className="text-foreground">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {records.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No records found
                  </TableCell>
                </TableRow>
              ) : (
                records.map((record) => {
                  const expired = isExpired(record);
                  const displayStatus = expired ? 'inactive' : record.status;
                  const displayStatusText = displayStatus.charAt(0).toUpperCase() + displayStatus.slice(1);
                  // Show last 6 characters of ID
                  const shortId = record.id ? record.id.slice(-6).toUpperCase() : 'N/A';

                  return (
                    <TableRow key={record.id} className="cursor-pointer hover:bg-muted/50" onClick={() => onViewRecord(record)}>
                      <TableCell className="font-medium text-foreground">
                        {record.first_name.charAt(0).toUpperCase() + record.first_name.slice(1).toLowerCase()} {record.last_name.charAt(0).toUpperCase() + record.last_name.slice(1).toLowerCase()}
                      </TableCell>
                      <TableCell className="text-foreground font-mono text-xs">{shortId}</TableCell>
                      <TableCell className="text-foreground hidden md:table-cell">{record.expiration_date ? format(new Date(record.expiration_date), 'MMM d, yyyy') : 'N/A'}</TableCell>
                      <TableCell className="text-foreground">{record.trespassed_from || 'N/A'}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(displayStatus)}>{displayStatusText}</Badge>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
