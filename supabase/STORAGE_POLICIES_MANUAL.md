# Manual Storage Policies Setup

## ⚠️ Important: Storage RLS Cannot Be Set Via SQL Migration

Due to Supabase permissions, storage policies must be created through the Dashboard UI.

## Step-by-Step Instructions

### 1. Make Buckets Private First

Go to **Storage** → Select bucket → **Settings**:
- ✓ Uncheck "Public bucket" for: `cvs`, `talent-avatars`, `company-logos`
- ✓ Check "Enable RLS" for all buckets

### 2. Create Policies for CVs Bucket

**Bucket:** `cvs`

#### Policy 1: Users can upload own CVs
- **Name:** `Users can upload own CVs`
- **Allowed operation:** INSERT
- **Target roles:** authenticated
- **Policy definition:**
```sql
bucket_id = 'cvs'
AND (storage.foldername(name))[1] = 'cvs'
AND split_part(
  split_part(name, '/', 2),
  '-', 1
) = auth.uid()::text
```

#### Policy 2: Users can view own CVs
- **Name:** `Users can view own CVs`
- **Allowed operation:** SELECT
- **Target roles:** authenticated
- **Policy definition:**
```sql
bucket_id = 'cvs'
AND split_part(
  split_part(name, '/', 2),
  '-', 1
) = auth.uid()::text
```

#### Policy 3: Companies can view applicant CVs
- **Name:** `Companies can view applicant CVs`
- **Allowed operation:** SELECT
- **Target roles:** authenticated
- **Policy definition:**
```sql
bucket_id = 'cvs'
AND EXISTS (
  SELECT 1
  FROM applications a
  JOIN jobs j ON a.job_id = j.id
  JOIN companies c ON j.company_id = c.id
  WHERE a.talent_id::text = split_part(split_part(name, '/', 2), '-', 1)
    AND c.owner_id = auth.uid()
)
```

#### Policy 4: Users can update own CVs
- **Name:** `Users can update own CVs`
- **Allowed operation:** UPDATE
- **Target roles:** authenticated
- **Policy definition:**
```sql
bucket_id = 'cvs'
AND split_part(
  split_part(name, '/', 2),
  '-', 1
) = auth.uid()::text
```

#### Policy 5: Users can delete own CVs
- **Name:** `Users can delete own CVs`
- **Allowed operation:** DELETE
- **Target roles:** authenticated
- **Policy definition:**
```sql
bucket_id = 'cvs'
AND split_part(
  split_part(name, '/', 2),
  '-', 1
) = auth.uid()::text
```

---

### 3. Create Policies for Avatars Bucket

**Bucket:** `talent-avatars`

#### Policy 1: Users can upload own avatars
- **Name:** `Users can upload own avatars`
- **Allowed operation:** INSERT
- **Target roles:** authenticated
- **Policy definition:**
```sql
bucket_id = 'talent-avatars'
AND split_part(
  split_part(name, '/', 2),
  '-', 1
) = auth.uid()::text
```

#### Policy 2: Anyone can view avatars
- **Name:** `Anyone can view talent avatars`
- **Allowed operation:** SELECT
- **Target roles:** public
- **Policy definition:**
```sql
bucket_id = 'talent-avatars'
```
(Note: Leave this as `true` or just the bucket check - it allows public read)

#### Policy 3: Users can update own avatars
- **Name:** `Users can update own avatars`
- **Allowed operation:** UPDATE
- **Target roles:** authenticated
- **Policy definition:**
```sql
bucket_id = 'talent-avatars'
AND split_part(
  split_part(name, '/', 2),
  '-', 1
) = auth.uid()::text
```

#### Policy 4: Users can delete own avatars
- **Name:** `Users can delete own avatars`
- **Allowed operation:** DELETE
- **Target roles:** authenticated
- **Policy definition:**
```sql
bucket_id = 'talent-avatars'
AND split_part(
  split_part(name, '/', 2),
  '-', 1
) = auth.uid()::text
```

---

### 4. Create Policies for Logos Bucket

**Bucket:** `company-logos`

#### Policy 1: Companies can upload own logos
- **Name:** `Companies can upload own logos`
- **Allowed operation:** INSERT
- **Target roles:** authenticated
- **Policy definition:**
```sql
bucket_id = 'company-logos'
AND EXISTS (
  SELECT 1 FROM companies
  WHERE owner_id = auth.uid()
    AND id::text = split_part(split_part(name, '/', 2), '-', 1)
)
```

#### Policy 2: Anyone can view logos
- **Name:** `Anyone can view company logos`
- **Allowed operation:** SELECT
- **Target roles:** public
- **Policy definition:**
```sql
bucket_id = 'company-logos'
```

---

## Verification Checklist

After creating all policies:

- [ ] Try to access CV URL without login → Should fail (403)
- [ ] Login as talent, upload CV → Should work
- [ ] Login as talent, view own CV → Should work
- [ ] Login as another user, try to view other's CV → Should fail
- [ ] Login as company, view CV of applicant → Should work
- [ ] Avatar displays on talent directory → Should work
- [ ] Logo displays on job listing → Should work

## File Structure Reference

The policies expect these file paths:
- **CVs:** `cvs/[userId]-[timestamp].pdf`
- **Avatars:** `avatars/[userId]-[timestamp].webp`
- **Logos:** `logos/[companyId]-[timestamp].webp`

The `split_part` function extracts the userId/companyId from the filename.
