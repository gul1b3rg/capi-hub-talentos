-- ============================================
-- Verificar y corregir políticas RLS en tabla profiles
-- ============================================

-- PASO 1: Ver todas las políticas actuales de profiles
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'profiles';

-- PASO 2: Asegurarse que los usuarios pueden actualizar su propio perfil
-- Primero eliminar si existe
DROP POLICY IF EXISTS "Usuarios pueden actualizar su propio perfil" ON profiles;

-- Crear política de UPDATE
CREATE POLICY "Usuarios pueden actualizar su propio perfil"
  ON profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- PASO 3: Verificar políticas después del cambio
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
