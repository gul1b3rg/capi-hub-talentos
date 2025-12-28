-- ============================================
-- FIX CRÍTICO: Políticas RLS para tabla profiles
-- ============================================
-- Este SQL resuelve 3 problemas:
-- 1. Loading infinito al refrescar página (falta SELECT propio perfil)
-- 2. "Guardando..." infinito en TalentProfile (falta UPDATE propio perfil)
-- 3. "Cargando perfil..." en vista de talento como empresa (falta SELECT postulantes)

-- DIAGNÓSTICO: Ver políticas actuales
SELECT
  schemaname,
  tablename,
  policyname,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'profiles';

-- PASO 1: Eliminar políticas antiguas si existen (evitar duplicados)
DROP POLICY IF EXISTS "Usuarios pueden ver su propio perfil" ON profiles;
DROP POLICY IF EXISTS "Usuarios pueden actualizar su propio perfil" ON profiles;
DROP POLICY IF EXISTS "Empresas pueden ver perfiles de postulantes" ON profiles;

-- PASO 2: Crear política SELECT - Usuario ve su propio perfil (CRÍTICA)
-- Sin esta política, AuthContext.fetchProfile() falla y la app se congela
CREATE POLICY "Usuarios pueden ver su propio perfil"
  ON profiles
  FOR SELECT
  USING (auth.uid() = id);

-- PASO 3: Crear política UPDATE - Usuario actualiza su propio perfil (CRÍTICA)
-- Sin esta política, updateProfile() falla y TalentProfile no guarda cambios
CREATE POLICY "Usuarios pueden actualizar su propio perfil"
  ON profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- PASO 4: Crear política SELECT - Empresas ven perfiles de postulantes (FEATURE)
-- Permite que empresas vean perfiles completos de talentos que se postularon
CREATE POLICY "Empresas pueden ver perfiles de postulantes"
  ON profiles
  FOR SELECT
  USING (
    role = 'talento' AND EXISTS (
      SELECT 1 FROM applications
      INNER JOIN jobs ON applications.job_id = jobs.id
      INNER JOIN companies ON jobs.company_id = companies.id
      WHERE applications.talent_id = profiles.id
        AND companies.owner_id = auth.uid()
    )
  );

-- VERIFICACIÓN: Ver políticas creadas
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename = 'profiles'
ORDER BY cmd, policyname;

-- RESULTADO ESPERADO:
-- +------------------------------------------------+--------+
-- | policyname                                     | cmd    |
-- +------------------------------------------------+--------+
-- | Usuarios pueden ver su propio perfil           | SELECT |
-- | Empresas pueden ver perfiles de postulantes    | SELECT |
-- | Usuarios pueden actualizar su propio perfil    | UPDATE |
-- +------------------------------------------------+--------+
