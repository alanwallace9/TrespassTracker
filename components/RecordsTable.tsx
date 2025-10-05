'use client';

import { TrespassRecord } from '@/lib/supabase';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

type RecordsTableProps = {
  records: TrespassRecord[];
  onViewRecord: (record: TrespassRecord) => void;
};

export function RecordsTable({ records, onViewRecord }: RecordsTableProps) {
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
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-foreground">Name</TableHead>
                <TableHead className="text-foreground">Age</TableHead>
                <TableHead className="text-foreground hidden md:table-cell">Birth Date</TableHead>
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
                  const age = record.date_of_birth
                    ? Math.floor((new Date().getTime() - new Date(record.date_of_birth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
                    : null;

                  return (
                    <TableRow key={record.id} className="cursor-pointer hover:bg-muted/50" onClick={() => onViewRecord(record)}>
                      <TableCell className="font-medium text-foreground">
                        {record.first_name.charAt(0).toUpperCase() + record.first_name.slice(1).toLowerCase()} {record.last_name.charAt(0).toUpperCase() + record.last_name.slice(1).toLowerCase()}
                      </TableCell>
                      <TableCell className="text-foreground">{age || 'N/A'}</TableCell>
                      <TableCell className="text-foreground hidden md:table-cell">{record.date_of_birth ? format(new Date(record.date_of_birth), 'MMM d, yyyy') : 'N/A'}</TableCell>
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
