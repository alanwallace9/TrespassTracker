'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

type AddUserDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUserAdded?: () => void;
};

export function AddUserDialog({ open, onOpenChange, onUserAdded }: AddUserDialogProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    email: '',
    display_name: '',
    role: 'viewer' as 'master_admin' | 'district_admin' | 'campus_admin' | 'viewer',
    campus: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email || !formData.display_name || !formData.role) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    if (formData.role === 'campus_admin' && !formData.campus) {
      toast({
        title: 'Error',
        description: 'Please select a campus for Campus Admin role',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: Math.random().toString(36).slice(-12),
        options: {
          emailRedirectTo: `${window.location.origin}/login`,
        },
      });

      if (authError) throw authError;

      if (authData.user) {
        const { error: profileError } = await supabase.from('user_profiles').insert({
          id: authData.user.id,
          email: formData.email,
          display_name: formData.display_name,
          role: formData.role,
          campus: formData.role === 'campus_admin' ? formData.campus : null,
        });

        if (profileError) throw profileError;
      }

      toast({
        title: 'Success',
        description: 'User invited successfully. They will receive an email to set their password.',
      });

      setFormData({ email: '', display_name: '', role: 'viewer', campus: '' });
      onOpenChange(false);
      if (onUserAdded) onUserAdded();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create user',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add New User</DialogTitle>
          <DialogDescription>Invite a new user to the system</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="user@bisd.us"
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="display_name">Display Name *</Label>
            <Input
              id="display_name"
              value={formData.display_name}
              onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
              placeholder="John Doe"
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Role *</Label>
            <Select
              value={formData.role}
              onValueChange={(value: any) => setFormData({ ...formData, role: value, campus: '' })}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="viewer">Viewer</SelectItem>
                <SelectItem value="campus_admin">Campus Admin</SelectItem>
                <SelectItem value="district_admin">District Admin</SelectItem>
                <SelectItem value="master_admin">Master Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.role === 'campus_admin' && (
            <div className="space-y-2">
              <Label htmlFor="campus">Campus *</Label>
              <Select
                value={formData.campus}
                onValueChange={(value) => setFormData({ ...formData, campus: value })}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a campus" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="placeholder">Select Campus (To be added)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading} className="hover:bg-red-600 hover:text-white">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="text-white" style={{backgroundColor: '#22c45d'}}>
              {loading ? 'Inviting...' : 'Invite User'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
