-- Fix RLS Policies for profiles table
-- Problema: Políticas duplicadas y conflictivas están bloqueando OAuth

-- PASO 1: Eliminar TODAS las políticas existentes
DROP POLICY IF EXISTS "Empresas pueden ver perfiles de postulantes" ON profiles;
DROP POLICY IF EXISTS "Enable insert for trigger only" ON profiles;
DROP POLICY IF EXISTS "profiles delete own" ON profiles;
DROP POLICY IF EXISTS "profiles insert self" ON profiles;
DROP POLICY IF EXISTS "profiles select own" ON profiles;
DROP POLICY IF EXISTS "profiles update own" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_self" ON profiles;
DROP POLICY IF EXISTS "profiles_select_own" ON profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Usuarios pueden actualizar su propio perfil" ON profiles;
DROP POLICY IF EXISTS "Usuarios pueden ver su propio perfil" ON profiles;

-- PASO 2: Crear políticas limpias y correctas

-- SELECT: Users can view own profile
CREATE POLICY "users_select_own_profile" ON profiles
  FOR SELECT
  USING (auth.uid() = id);

-- SELECT: Companies can view applicant profiles
CREATE POLICY "companies_select_applicant_profiles" ON profiles
  FOR SELECT
  USING (
    role = 'talento'
    AND EXISTS (
      SELECT 1
      FROM applications
      JOIN jobs ON applications.job_id = jobs.id
      JOIN companies ON jobs.company_id = companies.id
      WHERE applications.talent_id = profiles.id
        AND companies.owner_id = auth.uid()
    )
  );

-- INSERT: Users can insert own profile
CREATE POLICY "users_insert_own_profile" ON profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- UPDATE: Users can update own profile
CREATE POLICY "users_update_own_profile" ON profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- DELETE: Users can delete own profile
CREATE POLICY "users_delete_own_profile" ON profiles
  FOR DELETE
  USING (auth.uid() = id);

-- PASO 3: Asegurar que RLS está habilitado
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Verificar políticas creadas
SELECT
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'profiles'
ORDER BY cmd, policyname;
