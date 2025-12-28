-- ============================================
-- FIX: Cambiar tipo de dato de experience_years de integer a text
-- ============================================

-- El campo experience_years actualmente es integer, pero necesitamos almacenar
-- valores como "0-1 años", "1-3 años", etc.

-- PASO 1: Cambiar el tipo de dato de integer a text
ALTER TABLE profiles
  ALTER COLUMN experience_years TYPE text
  USING experience_years::text;

-- PASO 2: Verificar el cambio
SELECT
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'profiles'
  AND column_name = 'experience_years';
