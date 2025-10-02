'use client';

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { RecordsTable } from '@/components/RecordsTable';
import { RecordCard } from '@/components/RecordCard';
import { RecordDetailDialog } from '@/components/RecordDetailDialog';
import { supabase, TrespassRecord } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

export default function DashboardPage() {
  const [records, setRecords] = useState<TrespassRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState<TrespassRecord | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('active');
  const [viewMode, setViewMode] = useState<'list' | 'card'>('list');
  const { user } = useAuth();

  const fetchRecords = async () => {
    try {
      const { data, error } = await supabase
        .from('trespass_records')
        .select('*')
        .order('incident_date', { ascending: false });

      if (error) throw error;
      setRecords(data || []);
    } catch (error) {
      console.error('Error fetching records:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchRecords();
    }
  }, [user]);

  const handleViewRecord = (record: TrespassRecord) => {
    setSelectedRecord(record);
    setDetailDialogOpen(true);
  };

  const isExpired = (record: TrespassRecord) => {
    return record.expiration_date && new Date(record.expiration_date) < new Date();
  };

  const filteredRecords = records.filter((record) => {
    const matchesSearch =
      record.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.location.toLowerCase().includes(searchQuery.toLowerCase());

    const recordStatus = isExpired(record) ? 'inactive' : record.status;
    const matchesStatus = statusFilter === 'all' || recordStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: records.length,
    active: records.filter((r) => r.status === 'active' && !isExpired(r)).length,
    inactive: records.filter((r) => r.status === 'inactive' || isExpired(r)).length,
  };

  return (
    <DashboardLayout
      onRefresh={fetchRecords}
      stats={stats}
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      statusFilter={statusFilter}
      onStatusFilterChange={setStatusFilter}
      viewMode={viewMode}
      onViewModeChange={setViewMode}
    >
      <div className="space-y-6">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : viewMode === 'list' ? (
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
        onRecordUpdated={fetchRecords}
      />
    </DashboardLayout>
  );
}
