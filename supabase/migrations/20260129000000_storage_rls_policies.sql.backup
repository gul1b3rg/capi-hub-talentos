-- Row Level Security policies for Storage Buckets
-- This migration makes storage buckets private and implements access control
--
-- File structure:
-- - CVs: cvs/[userId]-[timestamp].pdf
-- - Avatars: avatars/[userId]-[timestamp].webp
-- - Logos: logos/[companyId]-[timestamp].webp

-- Helper function to extract userId from filename
CREATE OR REPLACE FUNCTION extract_user_id_from_filename(filename TEXT)
RETURNS TEXT AS $$
  SELECT split_part(
    split_part(filename, '/', 2),  -- Get filename after folder
    '-', 1                          -- Get part before first dash
  );
$$ LANGUAGE SQL IMMUTABLE;

-- =====================================================
-- POLICY 1: Users can upload CVs with their own userId in filename
-- =====================================================
CREATE POLICY "Users can upload own CVs"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'cvs'
  AND extract_user_id_from_filename(name) = auth.uid()::text
);

-- =====================================================
-- POLICY 2: Users can view their own CVs
-- =====================================================
CREATE POLICY "Users can view own CVs"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'cvs'
  AND extract_user_id_from_filename(name) = auth.uid()::text
);

-- =====================================================
-- POLICY 3: Companies can view CVs of applicants to their jobs
-- =====================================================
CREATE POLICY "Companies can view applicant CVs"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'cvs'
  AND EXISTS (
    SELECT 1
    FROM applications a
    JOIN jobs j ON a.job_id = j.id
    JOIN companies c ON j.company_id = c.id
    WHERE a.talent_id::text = extract_user_id_from_filename(name)
      AND c.owner_id = auth.uid()
  )
);

-- =====================================================
-- POLICY 4: Users can upload their own avatars
-- =====================================================
CREATE POLICY "Users can upload own avatars"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'talent-avatars'
  AND extract_user_id_from_filename(name) = auth.uid()::text
);

-- =====================================================
-- POLICY 5: Anyone can view talent avatars (public profiles)
-- =====================================================
CREATE POLICY "Anyone can view talent avatars"
ON storage.objects FOR SELECT
TO public
USING (
  bucket_id = 'talent-avatars'
);

-- =====================================================
-- POLICY 6: Companies can upload their own logos
-- =====================================================
CREATE POLICY "Companies can upload own logos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'company-logos'
  AND EXISTS (
    SELECT 1 FROM companies
    WHERE owner_id = auth.uid()
      AND id::text = extract_user_id_from_filename(name)
  )
);

-- =====================================================
-- POLICY 7: Anyone can view company logos (public profiles)
-- =====================================================
CREATE POLICY "Anyone can view company logos"
ON storage.objects FOR SELECT
TO public
USING (
  bucket_id = 'company-logos'
);

-- =====================================================
-- POLICY 8: Users can update their own files
-- =====================================================
CREATE POLICY "Users can update own CVs"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'cvs'
  AND extract_user_id_from_filename(name) = auth.uid()::text
);

CREATE POLICY "Users can update own avatars"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'talent-avatars'
  AND extract_user_id_from_filename(name) = auth.uid()::text
);

-- =====================================================
-- POLICY 9: Users can delete their own files
-- =====================================================
CREATE POLICY "Users can delete own CVs"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'cvs'
  AND extract_user_id_from_filename(name) = auth.uid()::text
);

CREATE POLICY "Users can delete own avatars"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'talent-avatars'
  AND extract_user_id_from_filename(name) = auth.uid()::text
);

-- =====================================================
-- Comments for documentation
-- =====================================================
COMMENT ON POLICY "Users can upload own CVs" ON storage.objects IS 'Allows authenticated users to upload CVs to their own folder';
COMMENT ON POLICY "Users can view own CVs" ON storage.objects IS 'Allows users to view their own uploaded CVs';
COMMENT ON POLICY "Companies can view applicant CVs" ON storage.objects IS 'Allows companies to view CVs of talents who applied to their job postings';
COMMENT ON POLICY "Anyone can view talent avatars" ON storage.objects IS 'Public read access for talent profile pictures displayed on talent directory';
COMMENT ON POLICY "Anyone can view company logos" ON storage.objects IS 'Public read access for company logos displayed on job listings';
