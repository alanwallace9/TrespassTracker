'use client';

import { useState } from 'react';
import { TrespassRecord } from '@/lib/supabase';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from 'lucide-react';
import { format } from 'date-fns';

type RecordsTableProps = {
  records: TrespassRecord[];
  onViewRecord: (record: TrespassRecord) => void;
};

export function RecordsTable({ records, onViewRecord }: RecordsTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const isExpired = (record: TrespassRecord) => {
    return record.expiration_date && new Date(record.expiration_date) < new Date();
  };

  const filteredRecords = records.filter((record) => {
    const matchesSearch =
      record.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.location.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || record.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-white hover:bg-[#22c45d]';
      case 'expired':
        return 'bg-red-100 text-red-800 hover:bg-red-100';
      case 'inactive':
        return 'bg-red-100 text-red-800 hover:bg-red-100';
      default:
        return 'bg-slate-100 text-slate-800 hover:bg-slate-100';
    }
  };

  const getStatusStyle = (status: string) => {
    if (status === 'active') {
      return { backgroundColor: '#22c45d' };
    }
    return {};
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <Input
            placeholder="Search by name or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
            <SelectItem value="expired">Expired</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-foreground">Name</TableHead>
                <TableHead className="text-foreground">Birth Date</TableHead>
                <TableHead className="text-foreground">Trespassed From</TableHead>
                <TableHead className="text-foreground">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRecords.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    No records found
                  </TableCell>
                </TableRow>
              ) : (
                filteredRecords.map((record) => {
                  const expired = isExpired(record);
                  const displayStatus = expired ? 'inactive' : record.status;

                  return (
                    <TableRow key={record.id} className="cursor-pointer hover:bg-muted/50" onClick={() => onViewRecord(record)}>
                      <TableCell className="font-medium text-foreground">
                        {record.first_name} {record.last_name}
                      </TableCell>
                      <TableCell className="text-foreground">{record.date_of_birth ? format(new Date(record.date_of_birth), 'MMM d, yyyy') : 'N/A'}</TableCell>
                      <TableCell className="text-foreground">{record.trespassed_from || 'N/A'}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(displayStatus)} style={getStatusStyle(displayStatus)}>{displayStatus}</Badge>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="text-sm text-muted-foreground">
        Showing {filteredRecords.length} of {records.length} records
      </div>
    </div>
  );
}
