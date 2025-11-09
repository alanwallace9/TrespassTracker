'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { BulkFeedbackUpload } from '@/components/admin/BulkFeedbackUpload';
import { Search, Filter, Eye, EyeOff, Pencil, Trash2, Download } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { adminUpdateFeedback, adminDeleteFeedback, updateCategory } from '@/app/actions/feedback';
import { formatDistanceToNow } from 'date-fns';
import type { FeedbackCategory } from '@/lib/supabase';

interface AdminFeedbackPanelProps {
  initialFeedback: any[];
  categories: FeedbackCategory[];
}

const STATUS_OPTIONS = [
  { value: 'under_review', label: 'Under Review', color: 'bg-purple-100 text-purple-600', dotColor: 'text-purple-500' },
  { value: 'planned', label: 'Planned', color: 'bg-blue-100 text-blue-600', dotColor: 'text-blue-500' },
  { value: 'in_progress', label: 'In Progress', color: 'bg-yellow-100 text-yellow-600', dotColor: 'text-yellow-500' },
  { value: 'completed', label: 'Completed', color: 'bg-green-100 text-green-600', dotColor: 'text-green-500' },
  { value: 'declined', label: 'Declined', color: 'bg-red-100 text-red-600', dotColor: 'text-red-500' },
];

const TYPE_LABELS = {
  bug: 'Bug',
  feature_request: 'Feature',
  improvement: 'Improvement',
  question: 'Question',
  other: 'Other',
};

export function AdminFeedbackPanel({ initialFeedback, categories }: AdminFeedbackPanelProps) {
  const router = useRouter();
  const [feedback, setFeedback] = useState(initialFeedback);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [managingCategories, setManagingCategories] = useState(false);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  // Edit form state
  const [editForm, setEditForm] = useState<{
    status: 'under_review' | 'planned' | 'in_progress' | 'completed' | 'declined' | '';
    admin_response: string;
    roadmap_notes: string;
    planned_release: string;
    is_public: boolean;
  }>({
    status: '',
    admin_response: '',
    roadmap_notes: '',
    planned_release: '',
    is_public: true,
  });

  // Filter feedback
  const filteredFeedback = useMemo(() => {
    return feedback.filter((item) => {
      const matchesSearch = searchTerm
        ? item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.description?.toLowerCase().includes(searchTerm.toLowerCase())
        : true;

      const matchesCategory = filterCategory === 'all' || item.category?.slug === filterCategory;
      const matchesStatus = filterStatus === 'all' || item.status === filterStatus;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [feedback, searchTerm, filterCategory, filterStatus]);

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setEditForm({
      status: item.status,
      admin_response: item.admin_response || '',
      roadmap_notes: item.roadmap_notes || '',
      planned_release: item.planned_release || '',
      is_public: item.is_public,
    });
  };

  const handleSaveEdit = async () => {
    if (!editingItem) return;

    // Filter out empty status
    const updateData = {
      ...editForm,
      status: editForm.status || undefined,
    };

    const result = await adminUpdateFeedback(editingItem.id, updateData as any);

    if (result.success) {
      // Update local state
      setFeedback(prev =>
        prev.map(item =>
          item.id === editingItem.id ? { ...item, ...editForm } : item
        )
      );
      setEditingItem(null);
      router.refresh();
    } else {
      alert(`Error: ${result.error}`);
    }
  };

  const handleDelete = async (id: string) => {
    const result = await adminDeleteFeedback(id);

    if (result.success) {
      setFeedback(prev => prev.filter(item => item.id !== id));
      setShowDeleteConfirm(null);
      router.refresh();
    } else {
      alert(`Error: ${result.error}`);
    }
  };

  const toggleExpanded = (id: string) => {
    setExpandedRows(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const getStatusBadge = (status: string) => {
    const config = STATUS_OPTIONS.find(s => s.value === status);
    return (
      <Badge className={config?.color || ''}>
        {config?.label || status}
      </Badge>
    );
  };

  const downloadTemplate = () => {
    const headers = [
      'title',
      'description',
      'type',
      'status',
      'product',
      'roadmap_notes',
      'planned_release',
    ];

    const exampleRows = [
      [
        'Add dark mode to dashboard',
        'Users want a dark theme option for better visibility at night',
        'feature_request',
        'planned',
        'Trespass',
        'Will be part of Q1 2025 release',
        'Q1 2025',
      ],
      [
        'Fix date picker not showing on mobile',
        'The date picker component does not display properly on iOS devices',
        'bug',
        'in_progress',
        'DAEP Dashboard',
        'Working on mobile responsive fix',
        '',
      ],
    ];

    const csvContent = [
      headers.join(','),
      ...exampleRows.map(row =>
        row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'feedback_import_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Manage Feedback</h1>
          <p className="text-slate-600">Review and manage user feedback and feature requests</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={downloadTemplate} variant="outline" className="gap-2 bg-white border-slate-300 shadow-sm hover:bg-slate-100 hover:text-slate-900 hover:border-slate-300">
            <Download className="w-4 h-4" />
            Download CSV Template
          </Button>
          <BulkFeedbackUpload
            categories={categories}
            onSuccess={() => router.refresh()}
          />
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="flex-1 min-w-[300px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search feedback..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white border-slate-300"
            />
          </div>
        </div>

        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-[200px] bg-white border-slate-300">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map(cat => (
              <SelectItem key={cat.id} value={cat.slug}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[200px] bg-white border-slate-300">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            {STATUS_OPTIONS.map(status => (
              <SelectItem key={status.value} value={status.value}>
                {status.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button variant="outline" onClick={() => setManagingCategories(true)} className="bg-white border-slate-300 shadow-sm hover:bg-slate-100 hover:text-slate-900 hover:border-slate-300">
          <Filter className="w-4 h-4 mr-2" />
          Manage Categories
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {STATUS_OPTIONS.map(status => {
          const count = feedback.filter(item => item.status === status.value).length;
          return (
            <div key={status.value} className="p-4 bg-white rounded-lg border border-slate-200">
              <div className="text-2xl font-bold text-slate-900">{count}</div>
              <div className="text-sm text-slate-600">{status.label}</div>
            </div>
          );
        })}
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-slate-200">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[35%]">Title</TableHead>
              <TableHead className="w-[10%]">Type</TableHead>
              <TableHead className="w-[12%]">Category</TableHead>
              <TableHead className="w-[12%]">Status</TableHead>
              <TableHead className="w-[8%] text-center">Votes</TableHead>
              <TableHead className="w-[10%]">Submitted</TableHead>
              <TableHead className="w-[5%] text-center">Vis</TableHead>
              <TableHead className="w-[8%] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredFeedback.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-slate-500">
                  No feedback found
                </TableCell>
              </TableRow>
            ) : (
              filteredFeedback.map((item) => {
                const isExpanded = expandedRows.has(item.id);
                return (
                  <>
                    <TableRow
                      key={item.id}
                      className="group cursor-pointer hover:bg-slate-50"
                      onClick={() => toggleExpanded(item.id)}
                    >
                      <TableCell className="font-medium text-sm">
                        {item.title}
                      </TableCell>
                      <TableCell className="text-xs">
                        <Badge variant="secondary" className="text-xs px-2 py-0">
                          {TYPE_LABELS[item.feedback_type as keyof typeof TYPE_LABELS]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">{item.category?.name || 'N/A'}</TableCell>
                      <TableCell className="text-xs">{getStatusBadge(item.status)}</TableCell>
                      <TableCell className="font-semibold text-sm text-center">{item.upvote_count}</TableCell>
                      <TableCell className="text-xs text-slate-600">
                        {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                      </TableCell>
                      <TableCell className="text-center">
                        {item.is_public ? (
                          <Eye className="w-4 h-4 text-green-600 mx-auto" />
                        ) : (
                          <EyeOff className="w-4 h-4 text-slate-400 mx-auto" />
                        )}
                      </TableCell>
                      <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex gap-2 justify-end">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(item)}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowDeleteConfirm(item.id)}
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                    {isExpanded && (
                      <TableRow>
                        <TableCell colSpan={8} className="bg-slate-50 p-6">
                          <div className="space-y-4">
                            <div>
                              <h4 className="font-semibold text-slate-900 mb-2">Description</h4>
                              <p className="text-sm text-slate-700">{item.description || 'No description provided'}</p>
                            </div>
                            {item.admin_response && (
                              <div>
                                <h4 className="font-semibold text-slate-900 mb-2">Admin Response</h4>
                                <p className="text-sm text-slate-700">{item.admin_response}</p>
                              </div>
                            )}
                            {item.roadmap_notes && (
                              <div>
                                <h4 className="font-semibold text-slate-900 mb-2">Roadmap Notes</h4>
                                <p className="text-sm text-slate-700">{item.roadmap_notes}</p>
                              </div>
                            )}
                            <div className="text-sm text-slate-600">
                              Submitted by: {item.user?.display_name || 'Anonymous'} ({item.user?.role || 'User'})
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingItem} onOpenChange={(open) => !open && setEditingItem(null)}>
        <DialogContent className="max-w-2xl bg-[#F9FAFB]">
          <DialogHeader>
            <DialogTitle>Edit Feedback</DialogTitle>
            <DialogDescription>
              Update status, add admin notes, and manage visibility
            </DialogDescription>
          </DialogHeader>

          {editingItem && (
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-slate-900 mb-2">{editingItem.title}</h4>
                <p className="text-sm text-slate-600">{editingItem.description}</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-900">Status</label>
                  <Select value={editForm.status} onValueChange={(value: any) => setEditForm({ ...editForm, status: value })}>
                    <SelectTrigger className="bg-white border-slate-300 shadow-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map(status => (
                        <SelectItem key={status.value} value={status.value}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-900">Admin Response</label>
                  <Textarea
                    value={editForm.admin_response}
                    onChange={(e) => setEditForm({ ...editForm, admin_response: e.target.value })}
                    placeholder="Add a public response to this feedback"
                    rows={3}
                    className="bg-white border-slate-300 shadow-sm"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-900">Roadmap Notes</label>
                  <Textarea
                    value={editForm.roadmap_notes}
                    onChange={(e) => setEditForm({ ...editForm, roadmap_notes: e.target.value })}
                    placeholder="Internal notes for roadmap planning"
                    rows={3}
                    className="bg-white border-slate-300 shadow-sm"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-900">Planned Release</label>
                  <Input
                    value={editForm.planned_release}
                    onChange={(e) => setEditForm({ ...editForm, planned_release: e.target.value })}
                    placeholder="e.g., Q2 2025, v2.0"
                    className="bg-white border-slate-300 shadow-sm"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is_public"
                    checked={editForm.is_public}
                    onChange={(e) => setEditForm({ ...editForm, is_public: e.target.checked })}
                    className="rounded border-slate-300"
                  />
                  <label htmlFor="is_public" className="text-sm font-medium text-slate-900">
                    Publicly visible
                  </label>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" className="bg-white border-slate-300 text-slate-700 shadow-sm hover:bg-slate-100 hover:text-slate-900 hover:border-slate-300" onClick={() => setEditingItem(null)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!showDeleteConfirm} onOpenChange={(open) => !open && setShowDeleteConfirm(null)}>
        <DialogContent className="bg-[#F9FAFB]">
          <DialogHeader>
            <DialogTitle>Delete Feedback</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this feedback? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" className="bg-white border-slate-300 text-slate-700 shadow-sm hover:bg-slate-100 hover:text-slate-900 hover:border-slate-300" onClick={() => setShowDeleteConfirm(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={() => showDeleteConfirm && handleDelete(showDeleteConfirm)}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
