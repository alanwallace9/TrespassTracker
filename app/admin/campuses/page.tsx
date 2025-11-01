'use client';

import { useEffect, useState } from 'react';
import { getCampusesWithCounts, getUsersForCampus, getRecordsForCampus, type CampusWithCounts } from '@/app/actions/admin/campuses';
import { type AdminUserListItem } from '@/app/actions/admin/users';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { RefreshCw, Search, Users, FileText } from 'lucide-react';
import { format } from 'date-fns';

export default function CampusesManagementPage() {
  const [campuses, setCampuses] = useState<CampusWithCounts[]>([]);
  const [filteredCampuses, setFilteredCampuses] = useState<CampusWithCounts[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal states
  const [usersModalOpen, setUsersModalOpen] = useState(false);
  const [recordsModalOpen, setRecordsModalOpen] = useState(false);
  const [selectedCampus, setSelectedCampus] = useState<CampusWithCounts | null>(null);
  const [modalUsers, setModalUsers] = useState<AdminUserListItem[]>([]);
  const [modalRecords, setModalRecords] = useState<any[]>([]);
  const [modalLoading, setModalLoading] = useState(false);

  useEffect(() => {
    fetchCampuses();
  }, []);

  useEffect(() => {
    filterCampuses();
  }, [campuses, searchQuery]);

  const fetchCampuses = async () => {
    setLoading(true);
    try {
      const data = await getCampusesWithCounts();
      setCampuses(data);
    } catch (error) {
      console.error('Error fetching campuses:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterCampuses = () => {
    let filtered = campuses;

    if (searchQuery) {
      filtered = filtered.filter(
        (campus) =>
          campus.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          campus.id?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredCampuses(filtered);
  };

  const handleUsersClick = async (campus: CampusWithCounts) => {
    setSelectedCampus(campus);
    setUsersModalOpen(true);
    setModalLoading(true);

    try {
      const users = await getUsersForCampus(campus.id);
      setModalUsers(users);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setModalLoading(false);
    }
  };

  const handleRecordsClick = async (campus: CampusWithCounts) => {
    setSelectedCampus(campus);
    setRecordsModalOpen(true);
    setModalLoading(true);

    try {
      const records = await getRecordsForCampus(campus.id);
      setModalRecords(records);
    } catch (error) {
      console.error('Error fetching records:', error);
    } finally {
      setModalLoading(false);
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

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search by campus name or ID..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground mt-4">Loading campuses...</p>
        </div>
      ) : filteredCampuses.length === 0 ? (
        <div className="text-center py-12 border rounded-lg bg-card">
          <p className="text-muted-foreground">No campuses found</p>
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden bg-card">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="text-left p-4 font-medium">ID</th>
                <th className="text-left p-4 font-medium">Name</th>
                <th className="text-left p-4 font-medium">Status</th>
                <th className="text-left p-4 font-medium">Number of Users</th>
                <th className="text-left p-4 font-medium">Number of Records</th>
                <th className="text-left p-4 font-medium">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredCampuses.map((campus) => (
                <tr key={campus.id} className="hover:bg-muted/50">
                  <td className="p-4 font-mono text-sm">{campus.id}</td>
                  <td className="p-4 font-medium">{campus.name}</td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      campus.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {campus.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <Button
                      variant="link"
                      className="p-0 h-auto font-medium text-blue-600 hover:text-blue-800"
                      onClick={() => handleUsersClick(campus)}
                      disabled={campus.user_count === 0}
                    >
                      <Users className="w-4 h-4 mr-1" />
                      {campus.user_count}
                    </Button>
                  </td>
                  <td className="p-4">
                    <Button
                      variant="link"
                      className="p-0 h-auto font-medium text-blue-600 hover:text-blue-800"
                      onClick={() => handleRecordsClick(campus)}
                      disabled={campus.record_count === 0}
                    >
                      <FileText className="w-4 h-4 mr-1" />
                      {campus.record_count}
                    </Button>
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
        Showing {filteredCampuses.length} of {campuses.length} campuses
      </div>

      {/* Users Modal */}
      <Dialog open={usersModalOpen} onOpenChange={setUsersModalOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Users at {selectedCampus?.name}</DialogTitle>
            <DialogDescription>
              {selectedCampus?.user_count} user{selectedCampus?.user_count !== 1 ? 's' : ''} assigned to this campus
            </DialogDescription>
          </DialogHeader>
          {modalLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            </div>
          ) : (
            <div className="overflow-y-auto max-h-[60vh]">
              <table className="w-full">
                <thead className="bg-muted sticky top-0">
                  <tr>
                    <th className="text-left p-3 font-medium">Name</th>
                    <th className="text-left p-3 font-medium">Email</th>
                    <th className="text-left p-3 font-medium">Role</th>
                    <th className="text-left p-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {modalUsers.map((user) => (
                    <tr key={user.id}>
                      <td className="p-3">{user.display_name || '—'}</td>
                      <td className="p-3 text-sm">{user.email}</td>
                      <td className="p-3 text-sm">{user.role.replace('_', ' ')}</td>
                      <td className="p-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          user.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : user.status === 'invited'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {user.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Records Modal */}
      <Dialog open={recordsModalOpen} onOpenChange={setRecordsModalOpen}>
        <DialogContent className="max-w-6xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Trespass Records at {selectedCampus?.name}</DialogTitle>
            <DialogDescription>
              {selectedCampus?.record_count} record{selectedCampus?.record_count !== 1 ? 's' : ''} for this campus
            </DialogDescription>
          </DialogHeader>
          {modalLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            </div>
          ) : (
            <div className="overflow-y-auto max-h-[60vh]">
              <table className="w-full text-sm">
                <thead className="bg-muted sticky top-0">
                  <tr>
                    <th className="text-left p-3 font-medium">Name</th>
                    <th className="text-left p-3 font-medium">Incident Date</th>
                    <th className="text-left p-3 font-medium">Type</th>
                    <th className="text-left p-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {modalRecords.map((record) => (
                    <tr key={record.id}>
                      <td className="p-3">
                        {record.first_name} {record.last_name}
                      </td>
                      <td className="p-3">{format(new Date(record.incident_date), 'MMM d, yyyy')}</td>
                      <td className="p-3">{record.incident_type}</td>
                      <td className="p-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          record.status === 'active'
                            ? 'bg-red-100 text-red-800'
                            : record.status === 'expired'
                            ? 'bg-gray-100 text-gray-800'
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {record.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
