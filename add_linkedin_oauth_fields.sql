-- ============================================
-- LinkedIn OAuth Integration - Database Schema
-- ============================================

-- Agregar avatar_url para foto de perfil
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles'
    AND column_name = 'avatar_url'
  ) THEN
    ALTER TABLE profiles
    ADD COLUMN avatar_url TEXT;
  END IF;
END $$;

-- Agregar linkedin_id para tracking de cuenta LinkedIn
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles'
    AND column_name = 'linkedin_id'
  ) THEN
    ALTER TABLE profiles
    ADD COLUMN linkedin_id TEXT UNIQUE;
  END IF;
END $$;

-- Índice para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_profiles_linkedin_id ON profiles(linkedin_id);

-- Verificar cambios
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'profiles'
AND column_name IN ('avatar_url', 'linkedin_id')
ORDER BY column_name;
