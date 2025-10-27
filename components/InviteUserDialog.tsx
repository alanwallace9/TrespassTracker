'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { inviteUser } from '@/app/actions/invite-user';
import { getCampuses, type Campus } from '@/app/actions/campuses';
import { Mail, UserPlus } from 'lucide-react';

type InviteUserDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUserInvited?: () => void;
};

export function InviteUserDialog({ open, onOpenChange, onUserInvited }: InviteUserDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'viewer' | 'campus_admin' | 'district_admin'>('viewer');
  const [campusId, setCampusId] = useState('');
  const [campuses, setCampuses] = useState<Campus[]>([]);
  const [loadingCampuses, setLoadingCampuses] = useState(false);
  const { toast } = useToast();

  // Fetch campuses when dialog opens
  useEffect(() => {
    if (open) {
      fetchCampuses();
    }
  }, [open]);

  const fetchCampuses = async () => {
    setLoadingCampuses(true);
    try {
      const data = await getCampuses();
      setCampuses(data);
    } catch (error: any) {
      console.error('Error fetching campuses:', error);
      toast({
        title: 'Error',
        description: 'Failed to load campus list',
        variant: 'destructive',
      });
    } finally {
      setLoadingCampuses(false);
    }
  };

  const handleInvite = async () => {
    if (!email) {
      toast({
        title: 'Error',
        description: 'Please enter an email address',
        variant: 'destructive',
      });
      return;
    }

    if (role === 'campus_admin' && !campusId) {
      toast({
        title: 'Error',
        description: 'Campus admins must have a campus ID assigned',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await inviteUser({
        email,
        role,
        campusId: role === 'campus_admin' ? campusId : null,
      });

      toast({
        title: 'Success',
        description: result.message,
      });

      // Reset form
      setEmail('');
      setRole('viewer');
      setCampusId('');
      onOpenChange(false);
      onUserInvited?.();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <UserPlus className="w-6 h-6 text-blue-600" />
            Invite New User
          </DialogTitle>
          <DialogDescription className="text-base pt-1">
            Send an invitation to a new user. They'll receive an email to set their password.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 pt-2">
          {/* Email Input */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">
              Email Address
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                id="email"
                type="email"
                placeholder="user@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Role Selection */}
          <div className="space-y-2">
            <Label htmlFor="role" className="text-sm font-medium">
              User Role
            </Label>
            <Select
              value={role}
              onValueChange={(value: any) => setRole(value)}
              disabled={isLoading}
            >
              <SelectTrigger id="role">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="viewer">Viewer / Staff</SelectItem>
                <SelectItem value="campus_admin">Campus Admin</SelectItem>
                <SelectItem value="district_admin">District Admin</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-slate-500">
              {role === 'viewer' && 'Can view trespass records'}
              {role === 'campus_admin' && 'Can manage records for their assigned campus'}
              {role === 'district_admin' && 'Can manage all records in the district'}
            </p>
          </div>

          {/* Campus Selection (only for campus_admin) */}
          {role === 'campus_admin' && (
            <div className="space-y-2">
              <Label htmlFor="campusId" className="text-sm font-medium">
                Campus <span className="text-red-500">*</span>
              </Label>
              <Select
                value={campusId}
                onValueChange={setCampusId}
                disabled={isLoading || loadingCampuses}
              >
                <SelectTrigger id="campusId">
                  <SelectValue placeholder={loadingCampuses ? "Loading campuses..." : "Select a campus"} />
                </SelectTrigger>
                <SelectContent>
                  {campuses
                    .filter(c => c.status === 'active')
                    .map((campus) => (
                      <SelectItem key={campus.id} value={campus.id}>
                        {campus.name} {campus.abbreviation ? `(${campus.abbreviation})` : ''}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-slate-500">
                The campus this admin will manage
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button onClick={handleInvite} disabled={isLoading} className="shadow-sm">
              {isLoading ? 'Sending...' : 'Send Invitation'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
