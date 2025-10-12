'use client';

import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TrespassRecord, supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { updateRecord, deleteRecord } from '@/app/actions/records';
import { format } from 'date-fns';
import { X, Upload } from 'lucide-react';

type RecordDetailDialogProps = {
  record: TrespassRecord | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRecordUpdated?: () => void;
};

export function RecordDetailDialog({ record, open, onOpenChange, onRecordUpdated }: RecordDetailDialogProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [userRole, setUserRole] = useState<string>('user');
  const [isDragging, setIsDragging] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [currentRecord, setCurrentRecord] = useState<TrespassRecord | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    aka: '',
    date_of_birth: '',
    school_id: '',
    known_associates: '',
    current_school: '',
    guardian_first_name: '',
    guardian_last_name: '',
    guardian_phone: '',
    contact_info: '',
    expiration_date: '',
    trespassed_from: '',
    is_former_student: false,
    notes: '',
    photo_url: '',
  });

  useEffect(() => {
    if (user) {
      fetchUserRole();
    }
  }, [user]);

  useEffect(() => {
    if (open) {
      setIsEditing(false);
    }
  }, [open]);

  useEffect(() => {
    if (record) {
      setCurrentRecord(record);
      setFormData({
        first_name: record.first_name,
        last_name: record.last_name,
        aka: record.aka || '',
        date_of_birth: record.date_of_birth || '',
        school_id: record.school_id || '',
        known_associates: record.known_associates || '',
        current_school: record.current_school || '',
        guardian_first_name: record.guardian_first_name || '',
        guardian_last_name: record.guardian_last_name || '',
        guardian_phone: record.guardian_phone || '',
        contact_info: record.contact_info || '',
        expiration_date: record.expiration_date || '',
        trespassed_from: record.trespassed_from || '',
        is_former_student: record.is_former_student || false,
        notes: record.notes || '',
        photo_url: record.photo_url || '',
      });
      setImagePreview(record.photo_url || null);
    }
  }, [record]);

  const fetchUserRole = async () => {
    if (!user) return;
    const { data } = await supabase.from('user_profiles').select('role').eq('id', user.id).maybeSingle();
    if (data?.role) {
      setUserRole(data.role);
    } else {
      setUserRole('master_admin');
    }
  };

  const canEdit = true;

  const handleFileChange = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        setFormData({ ...formData, photo_url: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileChange(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileChange(file);
  };

  const handleSave = async () => {
    if (!record || !user) return;

    if (!formData.first_name || !formData.last_name || !formData.date_of_birth || !formData.expiration_date || !formData.trespassed_from) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
        duration: 5000 // Errors stay longer (5 seconds)
      });
      return;
    }

    setIsSaving(true);
    try {
      const updatedRecord = await updateRecord(record.id, {
        first_name: formData.first_name,
        last_name: formData.last_name,
        aka: formData.aka || null,
        date_of_birth: formData.date_of_birth || null,
        school_id: formData.school_id || null,
        known_associates: formData.known_associates || null,
        current_school: formData.current_school || null,
        guardian_first_name: formData.guardian_first_name || null,
        guardian_last_name: formData.guardian_last_name || null,
        guardian_phone: formData.guardian_phone || null,
        contact_info: formData.contact_info || null,
        expiration_date: formData.expiration_date || null,
        trespassed_from: formData.trespassed_from,
        is_former_student: formData.is_former_student,
        notes: formData.notes || null,
        photo_url: formData.photo_url || null,
      });

      // Update local state with fresh data from database
      setCurrentRecord(updatedRecord);
      toast({
        title: 'Success',
        description: 'Record updated successfully',
        duration: 3000 // Auto-dismiss after 3 seconds
      });
      setIsEditing(false);
      if (onRecordUpdated) onRecordUpdated();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
        duration: 5000 // Errors stay longer (5 seconds)
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!record || !confirm('Are you sure you want to delete this record?')) return;

    try {
      await deleteRecord(record.id);

      toast({
        title: 'Success',
        description: 'Record deleted successfully',
        duration: 3000 // Auto-dismiss after 3 seconds
      });
      onOpenChange(false);
      if (onRecordUpdated) onRecordUpdated();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
        duration: 5000 // Errors stay longer (5 seconds)
      });
    }
  };

  if (!record || !currentRecord) return null;

  const age = currentRecord.date_of_birth
    ? Math.floor((new Date().getTime() - new Date(currentRecord.date_of_birth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
    : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" hideCloseButton>
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between text-foreground">
            <span>{isEditing ? 'Edit Trespass Record' : currentRecord.first_name + ' ' + currentRecord.last_name}</span>
            {!isEditing && (
              <button onClick={() => onOpenChange(false)} className="hover:opacity-70">
                <X className="w-5 h-5" />
              </button>
            )}
          </DialogTitle>
        </DialogHeader>

        {isEditing ? (
          <div className="space-y-4">
            {/* Close button for edit mode */}
            <button
              onClick={() => setIsEditing(false)}
              className="absolute top-4 right-4 hover:opacity-70"
              aria-label="Close edit mode"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Photo</Label>
              <div
                className={`border-2 border-dashed rounded-full w-40 h-40 mx-auto flex items-center justify-center transition-colors cursor-pointer ${
                  isDragging ? 'border-primary bg-primary/10' : 'border-muted-foreground/30'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => !imagePreview && fileInputRef.current?.click()}
              >
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileInputChange} className="hidden" />
                {imagePreview ? (
                  <div className="relative w-full h-full rounded-full overflow-hidden group">
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button type="button" onClick={(e) => { e.stopPropagation(); setImagePreview(null); setFormData({ ...formData, photo_url: '' }); }} className="text-white text-sm hover:underline">
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center p-4">
                    <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                    <div className="text-xs text-muted-foreground mb-1">Drag & drop or click</div>
                    <div className="text-xs text-muted-foreground">JPG, PNG up to 2MB</div>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first_name">First Name *</Label>
                <Input id="first_name" value={formData.first_name} onChange={(e) => setFormData({ ...formData, first_name: e.target.value })} className="bg-input border-border" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_name">Last Name *</Label>
                <Input id="last_name" value={formData.last_name} onChange={(e) => setFormData({ ...formData, last_name: e.target.value })} className="bg-input border-border" required />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="aka">AKA (Also Known As)</Label>
                <Input id="aka" value={formData.aka} onChange={(e) => setFormData({ ...formData, aka: e.target.value })} className="bg-input border-border" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="known_associates">Known Associates</Label>
                <Input id="known_associates" value={formData.known_associates} onChange={(e) => setFormData({ ...formData, known_associates: e.target.value })} className="bg-input border-border" />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox id="is_former_student" checked={formData.is_former_student} onCheckedChange={(checked) => setFormData({ ...formData, is_former_student: checked as boolean })} />
              <Label htmlFor="is_former_student" className="cursor-pointer font-normal">Former Student</Label>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date_of_birth">Date of Birth *</Label>
                <Input id="date_of_birth" type="date" value={formData.date_of_birth} onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })} className="bg-input border-border" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="school_id">School ID</Label>
                <Input id="school_id" value={formData.school_id} onChange={(e) => setFormData({ ...formData, school_id: e.target.value })} className="bg-input border-border" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="current_school">Current School</Label>
                <Input id="current_school" value={formData.current_school} onChange={(e) => setFormData({ ...formData, current_school: e.target.value })} className="bg-input border-border" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact_info">School Contact</Label>
                <Input id="contact_info" value={formData.contact_info} onChange={(e) => setFormData({ ...formData, contact_info: e.target.value })} className="bg-input border-border" />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-base font-semibold">Guardian Information</Label>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="guardian_first_name">Guardian First Name</Label>
                <Input id="guardian_first_name" value={formData.guardian_first_name} onChange={(e) => setFormData({ ...formData, guardian_first_name: e.target.value })} className="bg-input border-border" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="guardian_last_name">Guardian Last Name</Label>
                <Input id="guardian_last_name" value={formData.guardian_last_name} onChange={(e) => setFormData({ ...formData, guardian_last_name: e.target.value })} className="bg-input border-border" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="guardian_phone">Guardian Phone</Label>
              <Input id="guardian_phone" type="tel" value={formData.guardian_phone} onChange={(e) => setFormData({ ...formData, guardian_phone: e.target.value })} className="bg-input border-border" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="trespassed_from">Trespassed From *</Label>
                <Select value={formData.trespassed_from} onValueChange={(value) => setFormData({ ...formData, trespassed_from: value })} required>
                  <SelectTrigger className="bg-input border-border">
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All BISD properties">All BISD properties</SelectItem>
                    <SelectItem value="Home campus after school activities">Home campus after school activities</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="expiration_date">Warning Expires *</Label>
                <Input id="expiration_date" type="date" value={formData.expiration_date} onChange={(e) => setFormData({ ...formData, expiration_date: e.target.value })} className="bg-input border-border" required />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} className="bg-input border-border" rows={3} />
            </div>

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={() => setIsEditing(false)} disabled={isSaving} className="hover:bg-red-600 hover:text-white">Cancel</Button>
              <Button onClick={handleSave} disabled={isSaving} className="text-white bg-primary hover:bg-primary/90">
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Student Data Section */}
            <div>
              <h3 className="text-lg font-semibold mb-3 pb-2 border-b border-border">Student Data</h3>
              <div className="flex gap-6">
                <div className="flex-shrink-0">
                  {imagePreview || currentRecord.photo_url ? (
                    <img src={imagePreview || currentRecord.photo_url || ''} alt={`${currentRecord.first_name} ${currentRecord.last_name}`} className="w-32 h-32 rounded-full object-cover" />
                  ) : (
                    <div className="w-32 h-32 rounded-full bg-card flex items-center justify-center border-2 border-border">
                      <div className="text-4xl font-bold text-muted-foreground">{currentRecord.first_name.charAt(0)}{currentRecord.last_name.charAt(0)}</div>
                    </div>
                  )}
                </div>
                <div className="flex-1 grid grid-cols-2 gap-x-8 gap-y-3">
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Date of Birth</div>
                    <div className="text-base">{currentRecord.date_of_birth ? format(new Date(currentRecord.date_of_birth), 'MM/dd/yyyy') : 'N/A'}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Age</div>
                    <div className="text-base">{age || 'N/A'}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Former Student</div>
                    <div className="text-base">{currentRecord.is_former_student ? 'Yes' : 'No'}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Current School</div>
                    <div className="text-base">{currentRecord.current_school || 'N/A'}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">School Contact</div>
                    <div className="text-base">{currentRecord.contact_info || 'N/A'}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">School ID</div>
                    <div className="text-base">{currentRecord.school_id || 'N/A'}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Trespass Section */}
            <div>
              <div className="grid grid-cols-2 gap-x-8 mb-3 pb-2 border-b border-border">
                <h3 className="text-lg font-semibold">Trespass Information</h3>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Status:</span>
                  <Badge className="text-white bg-status-active">Active</Badge>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-x-8 gap-y-3">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Warning Expires</div>
                  <div className="text-base">{currentRecord.expiration_date ? format(new Date(currentRecord.expiration_date), 'MM/dd/yyyy') : 'N/A'}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Trespassed From</div>
                  <div className="text-base">{currentRecord.trespassed_from || 'N/A'}</div>
                </div>
              </div>
            </div>

            {/* Guardian Section */}
            <div>
              <h3 className="text-lg font-semibold mb-3 pb-2 border-b border-border">Guardian Information</h3>
              <div className="grid grid-cols-2 gap-x-8 gap-y-3">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Guardian Name</div>
                  <div className="text-base capitalize">
                    {[currentRecord.guardian_first_name?.toLowerCase(), currentRecord.guardian_last_name?.toLowerCase()].filter(Boolean).join(' ') || 'N/A'}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Guardian Phone</div>
                  <div className="text-base">{currentRecord.guardian_phone || 'N/A'}</div>
                </div>
              </div>
            </div>

            {/* Notes Section */}
            {currentRecord.notes && (
              <div>
                <h3 className="text-lg font-semibold mb-3 pb-2 border-b border-border">Notes</h3>
                <div className="text-sm whitespace-pre-wrap bg-secondary/30 p-3 rounded">{currentRecord.notes}</div>
              </div>
            )}

            <div className="flex justify-between items-center pt-4 border-t border-border">
              {canEdit ? (
                <div className="space-x-2">
                  <Button onClick={() => setIsEditing(true)} className="bg-orange-600 hover:bg-orange-700">Edit</Button>
                  <Button onClick={handleDelete} variant="destructive">Delete</Button>
                </div>
              ) : (
                <div></div>
              )}
              <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
