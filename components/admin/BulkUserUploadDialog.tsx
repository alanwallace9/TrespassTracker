'use client';

import { useState, useCallback } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { bulkInviteUsers, type BulkUserRow, type BulkInviteResult } from '@/app/actions/admin/bulk-invite-users';
import { Upload, FileText, AlertCircle, CheckCircle, XCircle, Download, Users } from 'lucide-react';
import Papa from 'papaparse';

type BulkUserUploadDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUsersInvited?: () => void;
};

type ParsedRow = BulkUserRow & {
  rowNumber: number;
  validationError?: string;
};

export function BulkUserUploadDialog({ open, onOpenChange, onUsersInvited }: BulkUserUploadDialogProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [parsedData, setParsedData] = useState<ParsedRow[]>([]);
  const [fileName, setFileName] = useState('');
  const [uploadResults, setUploadResults] = useState<BulkInviteResult[] | null>(null);
  const { toast } = useToast();

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setUploadResults(null);

    Papa.parse<BulkUserRow>(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim().toLowerCase(),
      complete: (results) => {
        const parsed: ParsedRow[] = results.data.map((row, index) => ({
          ...row,
          rowNumber: index + 2, // +2 because of header row and 0-index
          email: row.email?.trim() || '',
          role: row.role?.trim().toLowerCase() as any,
          campus_id: row.campus_id?.trim() || undefined,
        }));

        // Client-side basic validation
        parsed.forEach((row) => {
          if (!row.email) {
            row.validationError = 'Email is required';
          } else if (!row.role) {
            row.validationError = 'Role is required';
          } else if (row.role === 'campus_admin' && !row.campus_id) {
            row.validationError = 'Campus ID required for campus_admin';
          }
        });

        setParsedData(parsed);

        const validCount = parsed.filter(r => !r.validationError).length;
        toast({
          title: 'CSV Parsed',
          description: `Found ${parsed.length} rows (${validCount} valid)`,
        });
      },
      error: (error) => {
        toast({
          title: 'Parse Error',
          description: error.message,
          variant: 'destructive',
        });
      },
    });

    // Reset file input
    event.target.value = '';
  }, [toast]);

  const handleBulkInvite = async () => {
    const validRows = parsedData.filter(row => !row.validationError);

    if (validRows.length === 0) {
      toast({
        title: 'No Valid Rows',
        description: 'Please fix validation errors before uploading',
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);
    try {
      const result = await bulkInviteUsers(validRows);

      setUploadResults(result.results);

      toast({
        title: 'Bulk Invitation Complete',
        description: `${result.summary.succeeded} succeeded, ${result.summary.failed} failed`,
        variant: result.summary.failed > 0 ? 'default' : 'default',
      });

      if (result.summary.succeeded > 0) {
        onUsersInvited?.();
      }
    } catch (error: any) {
      toast({
        title: 'Upload Failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const downloadTemplate = () => {
    const template = 'email,role,campus_id,tenant_id\nadmin@example.com,campus_admin,010,\nviewer@example.com,viewer,,\ndistrict@example.com,district_admin,,birdville';
    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'user_invite_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadFailedRows = () => {
    if (!uploadResults) return;

    const failedRows = uploadResults.filter(r => !r.success);
    const csv = Papa.unparse(failedRows.map(r => ({ email: r.email, error: r.error })));
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'failed_invitations.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    setParsedData([]);
    setFileName('');
    setUploadResults(null);
  };

  const validCount = parsedData.filter(r => !r.validationError).length;
  const invalidCount = parsedData.length - validCount;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-600" />
            Bulk User Invitation
          </DialogTitle>
          <DialogDescription className="text-base pt-1">
            Upload a CSV file to invite multiple users at once. They'll each receive an email to set their password.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 pt-2">
          {/* Upload Section */}
          {parsedData.length === 0 && !uploadResults && (
            <div className="space-y-4">
              <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center">
                <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <p className="text-sm font-medium mb-2">Upload CSV File</p>
                <p className="text-xs text-slate-500 mb-4">
                  File must contain: email, role, campus_id (optional)
                </p>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="csv-upload"
                />
                <label htmlFor="csv-upload">
                  <Button asChild variant="outline">
                    <span className="cursor-pointer">
                      <FileText className="w-4 h-4 mr-2" />
                      Choose CSV File
                    </span>
                  </Button>
                </label>
              </div>

              <div className="flex items-center justify-between bg-slate-50 p-4 rounded-lg">
                <div className="text-sm">
                  <p className="font-medium">Need a template?</p>
                  <p className="text-xs text-slate-500">Download a sample CSV with example data</p>
                </div>
                <Button variant="ghost" size="sm" onClick={downloadTemplate}>
                  <Download className="w-4 h-4 mr-2" />
                  Download Template
                </Button>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm">
                <p className="font-medium text-blue-900 mb-2">CSV Format Requirements:</p>
                <ul className="text-blue-800 space-y-1 text-xs">
                  <li>• <strong>email</strong>: User's email address (required)</li>
                  <li>• <strong>role</strong>: viewer, campus_admin, or district_admin (required)</li>
                  <li>• <strong>campus_id</strong>: Campus number like 010, 042 (required for campus_admin only)</li>
                  <li>• <strong>tenant_id</strong>: Tenant ID like birdville, demo (optional, master_admin only)</li>
                </ul>
              </div>
            </div>
          )}

          {/* Preview Table */}
          {parsedData.length > 0 && !uploadResults && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Preview: {fileName}</p>
                  <p className="text-sm text-slate-500">
                    {validCount} valid, {invalidCount} invalid
                  </p>
                </div>
                <Button variant="ghost" size="sm" onClick={handleReset}>
                  Choose Different File
                </Button>
              </div>

              <div className="border rounded-lg overflow-hidden">
                <div className="max-h-96 overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-100 sticky top-0">
                      <tr>
                        <th className="text-left p-2 font-medium">#</th>
                        <th className="text-left p-2 font-medium">Email</th>
                        <th className="text-left p-2 font-medium">Role</th>
                        <th className="text-left p-2 font-medium">Campus ID</th>
                        <th className="text-left p-2 font-medium">Tenant ID</th>
                        <th className="text-left p-2 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {parsedData.map((row, index) => (
                        <tr
                          key={index}
                          className={`border-t ${row.validationError ? 'bg-red-50' : 'bg-white'}`}
                        >
                          <td className="p-2 text-slate-500">{row.rowNumber}</td>
                          <td className="p-2">{row.email}</td>
                          <td className="p-2">{row.role}</td>
                          <td className="p-2">{row.campus_id || '—'}</td>
                          <td className="p-2">{row.tenant_id || '—'}</td>
                          <td className="p-2">
                            {row.validationError ? (
                              <span className="flex items-center text-red-600 text-xs">
                                <AlertCircle className="w-3 h-3 mr-1" />
                                {row.validationError}
                              </span>
                            ) : (
                              <span className="flex items-center text-green-600 text-xs">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Valid
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={isUploading}>
                  Cancel
                </Button>
                <Button
                  onClick={handleBulkInvite}
                  disabled={isUploading || validCount === 0}
                  className="shadow-sm"
                >
                  {isUploading ? `Inviting ${validCount} Users...` : `Invite ${validCount} Users`}
                </Button>
              </div>
            </div>
          )}

          {/* Results Summary */}
          {uploadResults && (
            <div className="space-y-4">
              <div className="text-center py-6 bg-slate-50 rounded-lg">
                <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Bulk Invitation Complete</h3>
                <p className="text-slate-600">
                  {uploadResults.filter(r => r.success).length} succeeded,{' '}
                  {uploadResults.filter(r => !r.success).length} failed
                </p>
              </div>

              {uploadResults.filter(r => !r.success).length > 0 && (
                <>
                  <div className="border rounded-lg overflow-hidden">
                    <div className="bg-red-50 border-b border-red-200 p-3">
                      <p className="font-medium text-red-900 text-sm">Failed Invitations</p>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-slate-100">
                          <tr>
                            <th className="text-left p-2 font-medium">Email</th>
                            <th className="text-left p-2 font-medium">Error</th>
                          </tr>
                        </thead>
                        <tbody>
                          {uploadResults
                            .filter(r => !r.success)
                            .map((result, index) => (
                              <tr key={index} className="border-t">
                                <td className="p-2">{result.email}</td>
                                <td className="p-2 text-red-600 text-xs">
                                  <XCircle className="w-3 h-3 inline mr-1" />
                                  {result.error}
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <Button variant="outline" size="sm" onClick={downloadFailedRows} className="w-full">
                    <Download className="w-4 h-4 mr-2" />
                    Download Failed Rows (CSV)
                  </Button>
                </>
              )}

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <Button onClick={handleReset} variant="outline">
                  Upload Another File
                </Button>
                <Button onClick={() => onOpenChange(false)}>
                  Done
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
