'use client';

import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { createTrespassRecord } from '@/app/actions/upload-records';
import { Upload } from 'lucide-react';

type AddRecordDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRecordAdded: () => void;
};

export function AddRecordDialog({ open, onOpenChange, onRecordAdded }: AddRecordDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.first_name || !formData.last_name || !formData.date_of_birth || !formData.expiration_date || !formData.trespassed_from) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      // Use server action to create record (handles auth and tenant_id automatically)
      await createTrespassRecord({
        first_name: formData.first_name,
        last_name: formData.last_name,
        school_id: formData.school_id || '',
        expiration_date: formData.expiration_date,
        trespassed_from: formData.trespassed_from,
        aka: formData.aka,
        date_of_birth: formData.date_of_birth,
        known_associates: formData.known_associates,
        current_school: formData.current_school,
        guardian_first_name: formData.guardian_first_name,
        guardian_last_name: formData.guardian_last_name,
        guardian_phone: formData.guardian_phone,
        contact_info: formData.contact_info,
        is_former_student: formData.is_former_student,
        notes: formData.notes,
        photo_url: formData.photo_url,
        status: 'active',
      });

      toast({
        title: 'Success',
        description: 'Record added successfully',
      });

      setFormData({
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
      setImagePreview(null);

      onRecordAdded();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to add record',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-foreground">Add New Trespass Record</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
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
              <Input id="first_name" value={formData.first_name} onChange={(e) => setFormData({ ...formData, first_name: e.target.value })} className="bg-input border-border" required disabled={isLoading} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="last_name">Last Name *</Label>
              <Input id="last_name" value={formData.last_name} onChange={(e) => setFormData({ ...formData, last_name: e.target.value })} className="bg-input border-border" required disabled={isLoading} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="aka">AKA (Also Known As)</Label>
              <Input id="aka" value={formData.aka} onChange={(e) => setFormData({ ...formData, aka: e.target.value })} className="bg-input border-border" disabled={isLoading} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="known_associates">Known Associates</Label>
              <Input id="known_associates" value={formData.known_associates} onChange={(e) => setFormData({ ...formData, known_associates: e.target.value })} className="bg-input border-border" disabled={isLoading} />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox id="is_former_student" checked={formData.is_former_student} onCheckedChange={(checked) => setFormData({ ...formData, is_former_student: checked as boolean })} disabled={isLoading} />
            <Label htmlFor="is_former_student" className="cursor-pointer font-normal">Former Student</Label>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date_of_birth">Date of Birth *</Label>
              <Input id="date_of_birth" type="date" value={formData.date_of_birth} onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })} className="bg-input border-border" required disabled={isLoading} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="school_id">School ID</Label>
              <Input id="school_id" value={formData.school_id} onChange={(e) => setFormData({ ...formData, school_id: e.target.value })} className="bg-input border-border" disabled={isLoading} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="current_school">Current School</Label>
              <Input id="current_school" value={formData.current_school} onChange={(e) => setFormData({ ...formData, current_school: e.target.value })} className="bg-input border-border" disabled={isLoading} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact_info">School Contact</Label>
              <Input id="contact_info" value={formData.contact_info} onChange={(e) => setFormData({ ...formData, contact_info: e.target.value })} className="bg-input border-border" disabled={isLoading} />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-base font-semibold">Guardian Information</Label>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="guardian_first_name">Guardian First Name</Label>
              <Input id="guardian_first_name" value={formData.guardian_first_name} onChange={(e) => setFormData({ ...formData, guardian_first_name: e.target.value })} className="bg-input border-border" disabled={isLoading} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="guardian_last_name">Guardian Last Name</Label>
              <Input id="guardian_last_name" value={formData.guardian_last_name} onChange={(e) => setFormData({ ...formData, guardian_last_name: e.target.value })} className="bg-input border-border" disabled={isLoading} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="guardian_phone">Guardian Phone</Label>
            <Input id="guardian_phone" type="tel" value={formData.guardian_phone} onChange={(e) => setFormData({ ...formData, guardian_phone: e.target.value })} className="bg-input border-border" disabled={isLoading} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="trespassed_from">Trespassed From *</Label>
              <Select value={formData.trespassed_from} onValueChange={(value) => setFormData({ ...formData, trespassed_from: value })} disabled={isLoading}>
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
              <Input id="expiration_date" type="date" value={formData.expiration_date} onChange={(e) => setFormData({ ...formData, expiration_date: e.target.value })} className="bg-input border-border" required disabled={isLoading} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} className="bg-input border-border" rows={3} disabled={isLoading} />
          </div>

          <div className="flex justify-between pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading} className="hover:bg-red-600 hover:text-white">Cancel</Button>
            <Button type="submit" disabled={isLoading} className="bg-status-success text-white hover:bg-status-success/90">{isLoading ? 'Adding...' : 'Add Record'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
