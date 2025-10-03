'use client';

import { useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { RecordsTable } from '@/components/RecordsTable';
import { RecordCard } from '@/components/RecordCard';
import { RecordDetailDialog } from '@/components/RecordDetailDialog';
import { TrespassRecord } from '@/lib/supabase';

type DashboardClientProps = {
  initialRecords: TrespassRecord[];
  onRefresh: () => Promise<void>;
};

export function DashboardClient({ initialRecords, onRefresh }: DashboardClientProps) {
  const [selectedRecord, setSelectedRecord] = useState<TrespassRecord | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('active');
  const [viewMode, setViewMode] = useState<'list' | 'card'>('list');

  const handleViewRecord = (record: TrespassRecord) => {
    setSelectedRecord(record);
    setDetailDialogOpen(true);
  };

  const isExpired = (record: TrespassRecord) => {
    return record.expiration_date && new Date(record.expiration_date) < new Date();
  };

  const filteredRecords = initialRecords.filter((record) => {
    const matchesSearch =
      record.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.location.toLowerCase().includes(searchQuery.toLowerCase());

    const recordStatus = isExpired(record) ? 'inactive' : record.status;
    const matchesStatus = statusFilter === 'all' || recordStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: initialRecords.length,
    active: initialRecords.filter((r) => r.status === 'active' && !isExpired(r)).length,
    inactive: initialRecords.filter((r) => r.status === 'inactive' || isExpired(r)).length,
  };

  return (
    <DashboardLayout
      onRefresh={onRefresh}
      stats={stats}
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      statusFilter={statusFilter}
      onStatusFilterChange={setStatusFilter}
      viewMode={viewMode}
      onViewModeChange={setViewMode}
    >
      <div className="space-y-6">
        {viewMode === 'list' ? (
          <RecordsTable records={filteredRecords} onViewRecord={handleViewRecord} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredRecords.map((record) => (
              <RecordCard key={record.id} record={record} onViewRecord={handleViewRecord} />
            ))}
          </div>
        )}
      </div>

      <RecordDetailDialog
        record={selectedRecord}
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
        onRecordUpdated={onRefresh}
      />
    </DashboardLayout>
  );
}
