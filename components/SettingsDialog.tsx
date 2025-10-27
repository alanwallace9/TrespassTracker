'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { updateUserProfile, getUserProfile } from '@/app/actions/users';

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSettingsSaved?: () => void;
}

export function SettingsDialog({ open, onOpenChange, onSettingsSaved }: SettingsDialogProps) {
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (open && user) {
      fetchProfile();
    }
  }, [open, user]);

  const fetchProfile = async () => {
    if (!user) return;

    setFetching(true);
    try {
      const profile = await getUserProfile(user.id);

      if (profile) {
        setDisplayName(profile.display_name || '');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setFetching(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    setLoading(true);
    try {
      await updateUserProfile(user.id, {
        display_name: displayName || undefined,
      });

      toast({
        title: 'Settings saved',
        description: 'Your preferences have been updated.',
      });

      // Trigger refresh in parent component
      if (onSettingsSaved) {
        onSettingsSaved();
      }

      onOpenChange(false);
    } catch (error: any) {
      console.error('Error saving settings:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to save settings. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Manage your profile preferences
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="displayName">Display Name</Label>
            <Input
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Enter your display name"
              disabled={fetching || loading}
            />
            {fetching && <p className="text-xs text-muted-foreground">Loading...</p>}
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="hover:bg-red-600 hover:text-white">
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
