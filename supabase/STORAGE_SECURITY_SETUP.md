# Storage Security Setup Instructions

This document outlines the manual steps required in Supabase Dashboard to secure the storage buckets.

## ⚠️ CRITICAL: Make Storage Buckets Private

Currently, all files (CVs, avatars, logos) are publicly accessible via direct URLs. This is a **CRITICAL security vulnerability** that must be fixed immediately.

### Step 1: Make Buckets Private

1. Go to **Supabase Dashboard** → **Storage**
2. For **each bucket** (`cvs`, `talent-avatars`, `company-logos`):
   - Click on the bucket name
   - Click **Settings** (gear icon)
   - **Uncheck** "Public bucket" option
   - Click **Save**

### Step 2: Apply RLS Migration

The RLS policies have been defined in the migration file:
```
supabase/migrations/20260129000000_storage_rls_policies.sql
```

**To apply the migration:**

#### Option A: Using Supabase CLI (Recommended)
```bash
# Login to Supabase
npx supabase login

# Link to your project
npx supabase link --project-ref [YOUR_PROJECT_REF]

# Push migration
npx supabase db push
```

#### Option B: Manual SQL Execution
1. Go to **Supabase Dashboard** → **SQL Editor**
2. Click **New Query**
3. Copy the entire contents of `20260129000000_storage_rls_policies.sql`
4. Paste and **Run** the query

### Step 3: Verify Security

After applying the changes, verify that:

1. **CVs are private:**
   - Try accessing a CV URL without authentication → Should get **403 Forbidden**
   - Log in as the CV owner → Should be able to view it
   - Log in as a company where talent applied → Should be able to view it
   - Log in as another random user → Should get **403 Forbidden**

2. **Avatars are publicly viewable:**
   - Try accessing avatar URL → Should work (needed for public talent directory)
   - Signed URLs will refresh every 24 hours automatically

3. **Logos are publicly viewable:**
   - Try accessing logo URL → Should work (needed for public job listings)
   - Signed URLs will refresh every 24 hours automatically

## Code Changes Already Implemented

The following changes have been made to use **signed URLs with expiration** instead of public URLs:

### `src/lib/storageService.ts`

**Before (INSECURE):**
```typescript
const { data: { publicUrl } } = supabase.storage.from(BUCKET).getPublicUrl(filePath);
return publicUrl;  // ❌ Never expires, accessible forever
```

**After (SECURE):**
```typescript
const { data, error } = await supabase.storage
  .from(BUCKET)
  .createSignedUrl(filePath, expirationSeconds);

if (error || !data) {
  throw new Error('No se pudo generar la URL');
}

return data.signedUrl;  // ✅ Expires after specified time
```

**Expiration times:**
- **CVs:** 1 hour (3600 seconds) - Sensitive data, short-lived access
- **Avatars:** 24 hours (86400 seconds) - Public display, longer cache
- **Logos:** 24 hours (86400 seconds) - Public display, longer cache

## RLS Policies Summary

The migration creates the following policies:

### CVs Bucket (`cvs`)
- ✅ Users can upload CVs with their own userId in filename
- ✅ Users can view their own CVs
- ✅ Companies can view CVs of talents who applied to their jobs
- ✅ Users can update/delete their own CVs
- ❌ No one else can access CVs

### Avatars Bucket (`talent-avatars`)
- ✅ Users can upload avatars with their own userId in filename
- ✅ Anyone can view avatars (public profiles on talent directory)
- ✅ Users can update/delete their own avatars

### Logos Bucket (`company-logos`)
- ✅ Company owners can upload logos for their companies
- ✅ Anyone can view logos (public profiles on job listings)
- ❌ Only company owners can update/delete their logos

## Security Benefits

After implementing these changes:

1. **CVs are protected:** Only the owner and companies they applied to can access
2. **No enumeration attacks:** Can't guess URLs to access other users' files
3. **Time-limited access:** Signed URLs expire, reducing attack window
4. **Audit trail:** RLS policies log who accessed what (in Supabase logs)
5. **Compliance:** Meets data protection requirements for PII

## Rollback Plan

If issues occur, you can temporarily make buckets public again:

1. Go to **Storage** → bucket → **Settings**
2. Check "Public bucket"
3. Revert code changes in `storageService.ts` to use `getPublicUrl()`

**Note:** Only use rollback as last resort. Fix issues with policies instead.

## Next Steps

After completing this task:

1. ✅ Make buckets private in Dashboard
2. ✅ Apply RLS migration
3. ✅ Test access controls
4. ⏭️ Continue with Phase 1 Task 1.2: Fortalecer políticas de contraseña
5. ⏭️ Continue with Phase 1 Task 1.3: Rotar claves de Supabase
6. ⏭️ Continue with Phase 1 Task 1.5: Validación server-side archivos

## Troubleshooting

### Issue: "Files not loading after making buckets private"
**Solution:** Ensure code is using `createSignedUrl()` instead of `getPublicUrl()`

### Issue: "RLS policies preventing legitimate access"
**Solution:** Check that file naming follows pattern: `[folder]/[userId]-[timestamp].[ext]`

### Issue: "Companies can't view applicant CVs"
**Solution:** Verify that:
- Application record exists in `applications` table
- Job belongs to company owned by the company user
- CV filename starts with the talent's userId

## Support

For Supabase-specific issues, refer to:
- [Supabase Storage RLS Documentation](https://supabase.com/docs/guides/storage/security/access-control)
- [Supabase Storage Signed URLs](https://supabase.com/docs/guides/storage/signed-urls)
