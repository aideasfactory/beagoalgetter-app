-- Create task-documents storage bucket for task attachments (PDFs, documents)
INSERT INTO storage.buckets (id, name, public)
VALUES ('task-documents', 'task-documents', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to task documents
CREATE POLICY "Task documents are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'task-documents');

-- Allow authenticated users to upload task documents
CREATE POLICY "Authenticated users can upload task documents"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'task-documents'
  AND auth.role() = 'authenticated'
);

-- Allow users to delete their own uploaded documents
CREATE POLICY "Users can delete own task documents"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'task-documents'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
