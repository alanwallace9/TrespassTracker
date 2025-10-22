# Version 2.0.1 Roadmap - Multiple Images & Document Upload

> **Version:** 2.0.1
> **Created:** October 12, 2025
> **Status:** Planning Phase
> **Priority:** High

---

## 📋 Overview

This version adds support for multiple photo uploads per trespass record and allows administrators to upload trespass warning letters (PDFs, DOC/DOCX files).

---

## 🎯 Goals

1. **Multiple Photos Support**
   - Allow users to upload multiple photos per record
   - Display photos in a gallery view
   - Set one photo as "primary" (displayed on cards)
   - Support drag-and-drop upload
   - Allow photo deletion

2. **Document Upload (Admin Only)**
   - Upload trespass warning letters
   - Support PDF, DOC, DOCX formats
   - Track upload date and uploader
   - Preview documents in modal
   - Download capability

---

## 🗄️ Phase 1: Database Schema Updates

### Option A: Simple Array Approach
```sql
ALTER TABLE trespass_records
ADD COLUMN additional_photos TEXT[] DEFAULT '{}',
ADD COLUMN trespass_letter_url TEXT;
```

### Option B: Separate Tables (Recommended)
```sql
-- Table for multiple photos with metadata
CREATE TABLE record_photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  record_id UUID REFERENCES trespass_records(id) ON DELETE CASCADE,
  photo_url TEXT NOT NULL,
  caption TEXT,
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  uploaded_by TEXT REFERENCES user_profiles(id),
  is_primary BOOLEAN DEFAULT FALSE,
  display_order INTEGER DEFAULT 0
);

-- Index for faster queries
CREATE INDEX idx_record_photos_record_id ON record_photos(record_id);
CREATE INDEX idx_record_photos_primary ON record_photos(record_id, is_primary);

-- Table for documents (letters, court orders, etc.)
CREATE TABLE record_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  record_id UUID REFERENCES trespass_records(id) ON DELETE CASCADE,
  document_url TEXT NOT NULL,
  document_type TEXT NOT NULL, -- 'trespass_letter', 'court_order', 'other'
  file_name TEXT NOT NULL,
  file_size INTEGER, -- bytes
  mime_type TEXT,
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  uploaded_by TEXT REFERENCES user_profiles(id)
);

-- Index for faster queries
CREATE INDEX idx_record_documents_record_id ON record_documents(record_id);
CREATE INDEX idx_record_documents_type ON record_documents(document_type);
```

**Decision:** Use Option B (separate tables) for:
- Better organization and metadata tracking
- Easier querying and filtering
- Individual photo/document management
- Scalability for future features

---

## 📦 Phase 2: Supabase Storage Setup

### Create Storage Buckets

```bash
# Create buckets via Supabase dashboard or CLI
supabase storage create record-photos --public
supabase storage create record-documents --public
```

### Storage Bucket Policies

**Record Photos Bucket:**
- Public read access (authenticated users)
- Write access: All authenticated users
- Delete access: Record owner + admins

**Record Documents Bucket:**
- Public read access (authenticated users)
- Write access: Admins only
- Delete access: Admins only

### RLS Policies

```sql
-- Photos: All authenticated users can upload
CREATE POLICY "Users can upload photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'record-photos');

-- Photos: Users can view all photos
CREATE POLICY "Users can view photos"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'record-photos');

-- Photos: Only admins and owner can delete
CREATE POLICY "Admins and owner can delete photos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'record-photos' AND
  (auth.jwt() ->> 'sub' IN (
    SELECT id FROM user_profiles
    WHERE role IN ('district_admin', 'master_admin')
  ))
);

-- Documents: Only admins can upload
CREATE POLICY "Admins can upload documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'record-documents' AND
  auth.jwt() ->> 'sub' IN (
    SELECT id FROM user_profiles
    WHERE role IN ('district_admin', 'master_admin')
  )
);

-- Documents: All authenticated users can view
CREATE POLICY "Users can view documents"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'record-documents');

-- Documents: Only admins can delete
CREATE POLICY "Admins can delete documents"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'record-documents' AND
  auth.jwt() ->> 'sub' IN (
    SELECT id FROM user_profiles
    WHERE role IN ('district_admin', 'master_admin')
  )
);
```

---

## 🛠️ Phase 3: File Upload Utilities

### Create `lib/file-upload.ts`

```typescript
import { supabase } from '@/lib/supabase';

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface UploadResult {
  url: string;
  path: string;
}

/**
 * Upload a photo to Supabase Storage
 */
export async function uploadPhoto(
  file: File,
  recordId: string,
  onProgress?: (progress: UploadProgress) => void
): Promise<UploadResult> {
  // Validate file type
  if (!file.type.startsWith('image/')) {
    throw new Error('File must be an image');
  }

  // Validate file size (2MB max)
  const maxSize = 2 * 1024 * 1024; // 2MB
  if (file.size > maxSize) {
    throw new Error('Image must be less than 2MB');
  }

  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
  const filePath = `${recordId}/${fileName}`;

  const { data, error } = await supabase.storage
    .from('record-photos')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) throw error;

  const { data: { publicUrl } } = supabase.storage
    .from('record-photos')
    .getPublicUrl(filePath);

  return {
    url: publicUrl,
    path: filePath,
  };
}

/**
 * Upload a document to Supabase Storage (admin only)
 */
export async function uploadDocument(
  file: File,
  recordId: string,
  documentType: 'trespass_letter' | 'court_order' | 'other',
  onProgress?: (progress: UploadProgress) => void
): Promise<UploadResult> {
  // Validate file type
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];

  if (!allowedTypes.includes(file.type)) {
    throw new Error('File must be PDF, DOC, or DOCX');
  }

  // Validate file size (5MB max)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    throw new Error('Document must be less than 5MB');
  }

  const fileExt = file.name.split('.').pop();
  const fileName = `${documentType}-${Date.now()}.${fileExt}`;
  const filePath = `${recordId}/${fileName}`;

  const { data, error } = await supabase.storage
    .from('record-documents')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) throw error;

  const { data: { publicUrl } } = supabase.storage
    .from('record-documents')
    .getPublicUrl(filePath);

  return {
    url: publicUrl,
    path: filePath,
  };
}

/**
 * Delete a file from storage
 */
export async function deleteFile(
  bucket: 'record-photos' | 'record-documents',
  path: string
): Promise<void> {
  const { error } = await supabase.storage
    .from(bucket)
    .remove([path]);

  if (error) throw error;
}
```

---

## 🎨 Phase 4: UI Components

### A. PhotoGallery Component (`components/PhotoGallery.tsx`)

**Features:**
- Display primary photo (large) at top
- Thumbnail grid for additional photos
- Lightbox viewer for full-size viewing
- Add/remove buttons in edit mode
- Drag-and-drop reordering
- Set primary photo

**Props:**
```typescript
interface PhotoGalleryProps {
  recordId: string;
  photos: RecordPhoto[];
  isEditing: boolean;
  onPhotosChange: (photos: RecordPhoto[]) => void;
}
```

### B. DocumentUpload Component (`components/DocumentUpload.tsx`)

**Features:**
- Admin-only visibility
- Drag-and-drop upload
- File type validation
- Upload progress indicator
- Document list with download/delete

**Props:**
```typescript
interface DocumentUploadProps {
  recordId: string;
  documents: RecordDocument[];
  userRole: string;
  onDocumentsChange: (docs: RecordDocument[]) => void;
}
```

### C. DocumentViewer Component (`components/DocumentViewer.tsx`)

**Features:**
- PDF preview (using `react-pdf` or iframe)
- Download button
- Open in new tab
- Document metadata display
- Delete button (admin only)

**Props:**
```typescript
interface DocumentViewerProps {
  document: RecordDocument;
  canDelete: boolean;
  onDelete: () => void;
}
```

---

## 📝 Phase 5: Integration with RecordDetailDialog

### View Mode Updates

```typescript
{/* Photos Section */}
<div>
  <h3 className="text-lg font-semibold mb-3">Photos</h3>
  <PhotoGallery
    recordId={currentRecord.id}
    photos={photos}
    isEditing={false}
    onPhotosChange={() => {}}
  />
</div>

{/* Documents Section (if any exist) */}
{documents.length > 0 && (
  <div>
    <h3 className="text-lg font-semibold mb-3">Documents</h3>
    <DocumentList
      documents={documents}
      userRole={userRole}
    />
  </div>
)}
```

### Edit Mode Updates

```typescript
{/* Photos Section - Edit Mode */}
<div>
  <h3 className="text-lg font-semibold mb-3">Photos</h3>
  <PhotoGallery
    recordId={currentRecord.id}
    photos={photos}
    isEditing={true}
    onPhotosChange={setPhotos}
  />
</div>

{/* Documents Section - Admin Only */}
{(userRole === 'district_admin' || userRole === 'master_admin') && (
  <div>
    <h3 className="text-lg font-semibold mb-3">Documents</h3>
    <DocumentUpload
      recordId={currentRecord.id}
      documents={documents}
      userRole={userRole}
      onDocumentsChange={setDocuments}
    />
  </div>
)}
```

---

## 🔒 Phase 6: Security & Permissions

### File Upload Limits

- **Photos:** 2MB per file, 10 photos max per record
- **Documents:** 5MB per file, 5 documents max per record

### Access Control

| Action | Viewer | User | District Admin | Master Admin |
|--------|--------|------|----------------|--------------|
| View photos | ✅ | ✅ | ✅ | ✅ |
| Upload photos | ❌ | ✅ | ✅ | ✅ |
| Delete own photos | ❌ | ✅ | ✅ | ✅ |
| Delete any photos | ❌ | ❌ | ✅ | ✅ |
| View documents | ✅ | ✅ | ✅ | ✅ |
| Upload documents | ❌ | ❌ | ✅ | ✅ |
| Delete documents | ❌ | ❌ | ✅ | ✅ |

---

## ✅ Implementation Checklist

### Database
- [ ] Create migration file for new tables
- [ ] Add `record_photos` table
- [ ] Add `record_documents` table
- [ ] Add indexes for performance
- [ ] Test migration locally
- [ ] Apply migration to staging
- [ ] Apply migration to production

### Storage
- [ ] Create `record-photos` bucket
- [ ] Create `record-documents` bucket
- [ ] Configure bucket settings (public access)
- [ ] Add RLS policies for photos bucket
- [ ] Add RLS policies for documents bucket
- [ ] Test upload/download permissions

### Backend
- [ ] Create `lib/file-upload.ts` utility
- [ ] Add photo upload function
- [ ] Add document upload function
- [ ] Add file deletion function
- [ ] Add file validation
- [ ] Add error handling
- [ ] Test file operations

### Frontend Components
- [ ] Create `PhotoGallery.tsx` component
- [ ] Create `DocumentUpload.tsx` component
- [ ] Create `DocumentViewer.tsx` component
- [ ] Add drag-and-drop support
- [ ] Add lightbox viewer
- [ ] Add upload progress indicators
- [ ] Add loading states
- [ ] Add error handling

### Integration
- [ ] Update `RecordDetailDialog.tsx` view mode
- [ ] Update `RecordDetailDialog.tsx` edit mode
- [ ] Update `AddRecordDialog.tsx` (optional)
- [ ] Test photo upload flow
- [ ] Test document upload flow
- [ ] Test deletion flow
- [ ] Test with different user roles

### Testing
- [ ] Test with different file types
- [ ] Test with large files (should fail)
- [ ] Test concurrent uploads
- [ ] Test mobile responsiveness
- [ ] Test with slow network
- [ ] Test error scenarios
- [ ] Test role-based access

### Documentation
- [ ] Update CLAUDE.md with new features
- [ ] Add API documentation for file upload
- [ ] Update user guide
- [ ] Add troubleshooting section

---

## 🚀 Deployment Plan

1. **Staging Deployment:**
   - Apply database migrations
   - Create storage buckets
   - Deploy code changes
   - Test all functionality
   - Verify RLS policies

2. **Production Deployment:**
   - Schedule maintenance window
   - Apply database migrations
   - Create storage buckets
   - Deploy code changes
   - Smoke test critical paths
   - Monitor error logs

3. **Rollback Plan:**
   - Keep previous version tagged
   - Document rollback steps
   - Test rollback procedure in staging

---

## 📊 Success Metrics

- [ ] Users can upload multiple photos without errors
- [ ] Admins can upload documents successfully
- [ ] File size validation works correctly
- [ ] RLS policies prevent unauthorized access
- [ ] Upload performance is acceptable (<3s for 2MB file)
- [ ] No storage quota issues
- [ ] Mobile experience is smooth

---

## 🐛 Known Limitations

1. **File Size:**
   - Photos limited to 2MB
   - Documents limited to 5MB
   - Supabase free tier: 1GB total storage

2. **File Types:**
   - Photos: JPG, PNG, WebP only
   - Documents: PDF, DOC, DOCX only

3. **Performance:**
   - Large galleries (10+ photos) may load slowly
   - Consider lazy loading for optimization

---

## 🔮 Future Enhancements (v2.0.2+)

- [ ] Image compression before upload
- [ ] Thumbnail generation
- [ ] OCR for document text extraction
- [ ] Photo annotations/markup
- [ ] Bulk photo upload
- [ ] Photo gallery carousel
- [ ] Document version history
- [ ] Document signing workflow

---

**Status:** Planning Complete ✅
**Next Step:** Begin Phase 1 (Database Schema)
**Estimated Timeline:** 2-3 weeks
**Last Updated:** October 12, 2025
