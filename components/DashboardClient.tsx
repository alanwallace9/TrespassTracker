'use client';

import { useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { RecordsTable } from '@/components/RecordsTable';
import { RecordCard } from '@/components/RecordCard';
import { RecordDetailDialog } from '@/components/RecordDetailDialog';
import { TrespassRecord } from '@/lib/supabase';
import { useDebounce } from '@/hooks/useDebounce';

type DashboardClientProps = {
  initialRecords: TrespassRecord[];
  onRefresh: () => Promise<void>;
};

export function DashboardClient({ initialRecords, onRefresh }: DashboardClientProps) {
  const [selectedRecord, setSelectedRecord] = useState<TrespassRecord | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('active');
  const [viewMode, setViewMode] = useState<'list' | 'card'>('card');
  const [showExpiringOnly, setShowExpiringOnly] = useState(false);

  // Debounce search query with 300ms delay
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const handleViewRecord = (record: TrespassRecord) => {
    setSelectedRecord(record);
    setDetailDialogOpen(true);
  };

  const isExpired = (record: TrespassRecord) => {
    return record.expiration_date && new Date(record.expiration_date) < new Date();
  };

  const isExpiringWithinWeek = (record: TrespassRecord) => {
    if (!record.expiration_date || record.status !== 'active') return false;
    const now = new Date();
    const expirationDate = new Date(record.expiration_date);
    const oneWeekFromNow = new Date();
    oneWeekFromNow.setDate(now.getDate() + 7);
    return expirationDate > now && expirationDate <= oneWeekFromNow;
  };

  const filteredRecords = initialRecords
    .filter((record) => {
      // Filter by expiring warnings if that view is active
      if (showExpiringOnly && !isExpiringWithinWeek(record)) {
        return false;
      }

      // Only search if query is empty or has 4+ characters
      const matchesSearch =
        debouncedSearchQuery.length === 0 ||
        debouncedSearchQuery.length >= 4
          ? record.first_name.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
            record.last_name.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
            (record.location?.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ?? false)
          : true; // Show all records if less than 4 characters

      const recordStatus = isExpired(record) ? 'inactive' : record.status;
      const matchesStatus = statusFilter === 'all' || recordStatus === statusFilter;

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      // If showing expiring only, sort by expiration date (earliest first)
      if (showExpiringOnly) {
        const dateA = a.expiration_date ? new Date(a.expiration_date).getTime() : Infinity;
        const dateB = b.expiration_date ? new Date(b.expiration_date).getTime() : Infinity;
        return dateA - dateB;
      }

      // Otherwise sort alphabetically by last name, then first name
      const lastNameCompare = a.last_name.toLowerCase().localeCompare(b.last_name.toLowerCase());
      if (lastNameCompare !== 0) return lastNameCompare;
      return a.first_name.toLowerCase().localeCompare(b.first_name.toLowerCase());
    });

  const stats = {
    total: initialRecords.length,
    active: initialRecords.filter((r) => r.status === 'active' && !isExpired(r)).length,
    inactive: initialRecords.filter((r) => r.status === 'inactive' || isExpired(r)).length,
  };

  const handleShowExpiring = () => {
    setShowExpiringOnly(!showExpiringOnly);
    // Reset other filters and switch to list view when viewing expiring warnings
    if (!showExpiringOnly) {
      setSearchQuery('');
      setStatusFilter('active');
      setViewMode('list');
    }
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
      filteredCount={filteredRecords.length}
      records={initialRecords}
      onShowExpiring={handleShowExpiring}
      showExpiringOnly={showExpiringOnly}
    >
      <div className="space-y-6">
        {viewMode === 'list' ? (
          <RecordsTable records={filteredRecords} onViewRecord={handleViewRecord} />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
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
