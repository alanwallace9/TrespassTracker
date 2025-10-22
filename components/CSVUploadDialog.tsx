'use client';

import { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Upload, FileText, CircleAlert as AlertCircle, Download } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FieldMappingDialog } from '@/components/FieldMappingDialog';

type CSVUploadDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRecordsUploaded: () => void;
};

type CSVRecord = {
  // Required fields
  first_name: string;
  last_name: string;
  school_id: string;
  expiration_date: string;
  trespassed_from: string;
  // Optional fields
  aka?: string;
  date_of_birth?: string;
  incident_date?: string;
  location?: string;
  description?: string;
  status?: string;
  is_former_student?: boolean;
  known_associates?: string;
  current_school?: string;
  guardian_first_name?: string;
  guardian_last_name?: string;
  guardian_phone?: string;
  contact_info?: string;
  notes?: string;
  photo_url?: string;
};

type UserCSVRecord = {
  email: string;
  password: string;
  role: string;
  display_name?: string;
};

export function CSVUploadDialog({ open, onOpenChange, onRecordsUploaded }: CSVUploadDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [previewData, setPreviewData] = useState<CSVRecord[]>([]);
  const [userPreviewData, setUserPreviewData] = useState<UserCSVRecord[]>([]);
  const [error, setError] = useState<string>('');
  const [uploadType, setUploadType] = useState<'records' | 'users'>('records');
  const [userRole, setUserRole] = useState<string>('user');
  const [userTenantId, setUserTenantId] = useState<string>('');
  const [rawCSVText, setRawCSVText] = useState<string>('');
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [mappingDialogOpen, setMappingDialogOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchUserProfile();
    }
  }, [user]);

  const fetchUserProfile = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('user_profiles')
      .select('role, tenant_id')
      .eq('id', user.id)
      .maybeSingle();

    if (data) {
      setUserRole(data.role || 'user');
      setUserTenantId(data.tenant_id || '');
    }
  };

  const parseUserCSV = (text: string): UserCSVRecord[] => {
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length < 2) {
      throw new Error('CSV file must contain headers and at least one user');
    }

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const records: UserCSVRecord[] = [];

    const requiredFields = ['email', 'password'];
    const missingFields = requiredFields.filter(field => !headers.includes(field));

    if (missingFields.length > 0) {
      throw new Error(`Missing required columns: ${missingFields.join(', ')}`);
    }

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      const record: any = {};

      headers.forEach((header, index) => {
        record[header] = values[index] || '';
      });

      if (record.email && record.password) {
        records.push({
          email: record.email,
          password: record.password,
          role: record.role || 'user',
          display_name: record.display_name || undefined,
        });
      }
    }

    return records;
  };

  const parseCSV = (text: string): CSVRecord[] => {
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length < 2) {
      throw new Error('CSV file must contain headers and at least one record');
    }

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const records: CSVRecord[] = [];

    const requiredFields = ['first_name', 'last_name', 'school_id', 'expiration_date', 'trespassed_from'];
    const missingFields = requiredFields.filter(field => !headers.includes(field));

    if (missingFields.length > 0) {
      throw new Error(`Missing required columns: ${missingFields.join(', ')}`);
    }

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      const record: any = {};

      headers.forEach((header, index) => {
        record[header] = values[index] || '';
      });

      if (record.first_name && record.last_name && record.school_id && record.expiration_date && record.trespassed_from) {
        records.push({
          first_name: record.first_name,
          last_name: record.last_name,
          school_id: record.school_id,
          expiration_date: record.expiration_date,
          trespassed_from: record.trespassed_from,
          aka: record.aka || undefined,
          date_of_birth: record.date_of_birth || undefined,
          incident_date: record.incident_date || undefined,
          location: record.location || undefined,
          description: record.description || undefined,
          status: record.status || 'active',
          is_former_student: record.is_former_student === 'true' || record.is_former_student === '1',
          known_associates: record.known_associates || undefined,
          current_school: record.current_school || undefined,
          guardian_first_name: record.guardian_first_name || undefined,
          guardian_last_name: record.guardian_last_name || undefined,
          guardian_phone: record.guardian_phone || undefined,
          contact_info: record.contact_info || undefined,
          notes: record.notes || undefined,
          photo_url: record.photo_url || undefined,
        });
      }
    }

    return records;
  };

  const parseCSVWithMapping = (text: string, fieldMapping: Record<string, string>): CSVRecord[] => {
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length < 2) {
      throw new Error('CSV file must contain headers and at least one record');
    }

    const originalHeaders = lines[0].split(',').map(h => h.trim());
    const records: CSVRecord[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      const record: any = {};

      // Apply field mapping
      originalHeaders.forEach((originalHeader, index) => {
        const mappedField = fieldMapping[originalHeader];
        if (mappedField && mappedField !== 'skip') {
          record[mappedField] = values[index] || '';
        }
      });

      // Check if all required fields are present
      if (record.first_name && record.last_name && record.school_id && record.expiration_date && record.trespassed_from) {
        records.push({
          first_name: record.first_name,
          last_name: record.last_name,
          school_id: record.school_id,
          expiration_date: record.expiration_date,
          trespassed_from: record.trespassed_from,
          aka: record.aka || undefined,
          date_of_birth: record.date_of_birth || undefined,
          incident_date: record.incident_date || undefined,
          location: record.location || undefined,
          description: record.description || undefined,
          status: record.status || 'active',
          is_former_student: record.is_former_student === 'true' || record.is_former_student === '1',
          known_associates: record.known_associates || undefined,
          current_school: record.current_school || undefined,
          guardian_first_name: record.guardian_first_name || undefined,
          guardian_last_name: record.guardian_last_name || undefined,
          guardian_phone: record.guardian_phone || undefined,
          contact_info: record.contact_info || undefined,
          notes: record.notes || undefined,
          photo_url: record.photo_url || undefined,
        });
      }
    }

    return records;
  };

  const handleMappingConfirmed = (fieldMapping: Record<string, string>) => {
    try {
      const records = parseCSVWithMapping(rawCSVText, fieldMapping);
      setPreviewData(records);
      setMappingDialogOpen(false);
    } catch (err: any) {
      setError(err.message);
      setPreviewData([]);
    }
  };

  const downloadTemplate = () => {
    // Create CSV template with headers and sample data
    const headers = [
      'first_name',
      'last_name',
      'school_id',
      'expiration_date',
      'trespassed_from',
      'aka',
      'date_of_birth',
      'incident_date',
      'location',
      'description',
      'status',
      'is_former_student',
      'known_associates',
      'current_school',
      'guardian_first_name',
      'guardian_last_name',
      'guardian_phone',
      'contact_info',
      'notes',
      'photo_url',
    ];

    const sampleRow = [
      'John',
      'Doe',
      '12345',
      '2026-10-15',
      'All district properties',
      'Big John',
      '1995-05-20',
      '2025-10-10',
      'North High School',
      'Unauthorized entry after school hours',
      'active',
      'false',
      'Little Timmy',
      'North High School',
      'Jane',
      'Doe',
      '555-1234',
      'Dr Brown',
      'First offense, cooperative',
      'https://example.com/photo.jpg',
    ];

    // Create CSV content
    const csvContent = [
      headers.join(','),
      sampleRow.map(cell => `"${cell}"`).join(','),
    ].join('\n');

    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'trespass_records_template.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        if (uploadType === 'users') {
          const users = parseUserCSV(text);
          setUserPreviewData(users);
          setPreviewData([]);
        } else {
          // For records, extract headers and show mapping dialog
          const lines = text.split('\n').filter(line => line.trim());
          if (lines.length < 2) {
            throw new Error('CSV file must contain headers and at least one record');
          }

          const headers = lines[0].split(',').map(h => h.trim());
          setRawCSVText(text);
          setCsvHeaders(headers);
          setMappingDialogOpen(true);
          setUserPreviewData([]);
        }
      } catch (err: any) {
        setError(err.message);
        setPreviewData([]);
        setUserPreviewData([]);
      }
    };

    reader.readAsText(file);
  };

  const handleUpload = async () => {
    if (!user || (previewData.length === 0 && userPreviewData.length === 0)) return;

    setIsLoading(true);
    try {
      if (uploadType === 'users') {
        let successCount = 0;
        for (const userRecord of userPreviewData) {
          try {
            const { data: authData, error: signUpError } = await supabase.auth.signUp({
              email: userRecord.email,
              password: userRecord.password,
            });

            if (signUpError) throw signUpError;

            if (authData.user) {
              await supabase.from('user_profiles').insert({
                id: authData.user.id,
                role: userRecord.role,
                display_name: userRecord.display_name || null,
              });
              successCount++;
            }
          } catch (err: any) {
            console.error(`Failed to create user ${userRecord.email}:`, err.message);
          }
        }

        toast({
          title: 'Success',
          description: `Successfully created ${successCount} of ${userPreviewData.length} users`,
        });
      } else {
        const recordsToInsert = previewData.map(record => ({
          user_id: user.id,
          tenant_id: userTenantId,
          first_name: record.first_name,
          last_name: record.last_name,
          school_id: record.school_id,
          expiration_date: record.expiration_date,
          trespassed_from: record.trespassed_from,
          aka: record.aka || null,
          date_of_birth: record.date_of_birth || null,
          incident_date: record.incident_date || null,
          location: record.location || null,
          description: record.description || null,
          status: record.status || 'active',
          is_former_student: record.is_former_student || false,
          known_associates: record.known_associates || null,
          current_school: record.current_school || null,
          guardian_first_name: record.guardian_first_name || null,
          guardian_last_name: record.guardian_last_name || null,
          guardian_phone: record.guardian_phone || null,
          contact_info: record.contact_info || null,
          notes: record.notes || null,
          photo_url: record.photo_url || null,
        }));

        const { error } = await supabase.from('trespass_records').insert(recordsToInsert);

        if (error) throw error;

        toast({
          title: 'Success',
          description: `Successfully uploaded ${previewData.length} records`,
        });
      }

      setPreviewData([]);
      setUserPreviewData([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      onRecordsUploaded();
      onOpenChange(false);
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Upload CSV File</DialogTitle>
          <DialogDescription>
            {uploadType === 'records'
              ? 'Upload a CSV file with trespass records. Required columns: first_name, last_name, school_id, expiration_date, trespassed_from'
              : 'Upload a CSV file with user accounts. Required columns: email, password. Optional: role, display_name'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {(userRole === 'district_admin' || userRole === 'master_admin') && (
            <div className="flex gap-2 border-b pb-4">
              <Button
                type="button"
                variant={uploadType === 'records' ? 'default' : 'outline'}
                onClick={() => {
                  setUploadType('records');
                  setPreviewData([]);
                  setUserPreviewData([]);
                  setError('');
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }}
              >
                Trespass Records
              </Button>
              <Button
                type="button"
                variant={uploadType === 'users' ? 'default' : 'outline'}
                onClick={() => {
                  setUploadType('users');
                  setPreviewData([]);
                  setUserPreviewData([]);
                  setError('');
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }}
              >
                User Accounts
              </Button>
            </div>
          )}
          <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-slate-400 transition-colors">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
              id="csv-upload"
            />
            <label htmlFor="csv-upload" className="cursor-pointer">
              <div className="flex flex-col items-center space-y-2">
                <Upload className="w-12 h-12 text-slate-400" />
                <div className="text-sm font-medium">Click to upload CSV file</div>
                <div className="text-xs text-slate-500">CSV format with required columns</div>
              </div>
            </label>
          </div>

          {uploadType === 'records' && (
            <div className="flex justify-center">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={downloadTemplate}
                className="gap-2"
              >
                <Download className="w-4 h-4" />
                Download CSV Template
              </Button>
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {uploadType === 'users' && userPreviewData.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm text-slate-600">
                <FileText className="w-4 h-4" />
                <span>{userPreviewData.length} users ready to create</span>
              </div>
              <div className="max-h-60 overflow-y-auto border rounded-lg p-4 bg-slate-50">
                <div className="space-y-2 text-sm">
                  {userPreviewData.slice(0, 5).map((userRecord, index) => (
                    <div key={index} className="p-2 bg-white rounded border">
                      <div className="font-medium">{userRecord.email}</div>
                      <div className="text-xs text-slate-500">Role: {userRecord.role}</div>
                    </div>
                  ))}
                  {userPreviewData.length > 5 && (
                    <div className="text-xs text-slate-500 text-center pt-2">
                      And {userPreviewData.length - 5} more users...
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {uploadType === 'records' && previewData.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm text-slate-600">
                <FileText className="w-4 h-4" />
                <span>{previewData.length} records ready to upload</span>
              </div>
              <div className="max-h-60 overflow-y-auto border rounded-lg p-4 bg-slate-50">
                <div className="space-y-2 text-sm">
                  {previewData.slice(0, 5).map((record, index) => (
                    <div key={index} className="p-2 bg-white rounded border">
                      <div className="font-medium">
                        {record.first_name} {record.last_name}
                      </div>
                      <div className="text-xs text-slate-500">
                        ID: {record.school_id} | Trespassed from: {record.trespassed_from} | Expires: {record.expiration_date}
                      </div>
                    </div>
                  ))}
                  {previewData.length > 5 && (
                    <div className="text-xs text-slate-500 text-center pt-2">
                      And {previewData.length - 5} more records...
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button onClick={handleUpload} disabled={isLoading || (previewData.length === 0 && userPreviewData.length === 0)}>
              {isLoading
                ? uploadType === 'users'
                  ? 'Creating...'
                  : 'Uploading...'
                : uploadType === 'users'
                ? `Create ${userPreviewData.length} Users`
                : `Upload ${previewData.length} Records`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
    <FieldMappingDialog
      open={mappingDialogOpen}
      onOpenChange={setMappingDialogOpen}
      csvHeaders={csvHeaders}
      onMappingConfirmed={handleMappingConfirmed}
    />
  </>
  );
}
