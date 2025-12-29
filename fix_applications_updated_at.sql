-- ============================================
-- FIX: Agregar campos faltantes a applications
-- ============================================

-- Agregar columna notes si no existe
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'applications'
    AND column_name = 'notes'
  ) THEN
    ALTER TABLE applications
    ADD COLUMN notes TEXT;
  END IF;
END $$;

-- Agregar columna updated_at si no existe
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'applications'
    AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE applications
    ADD COLUMN updated_at TIMESTAMPTZ NOT NULL DEFAULT now();
  END IF;
END $$;

-- Crear o reemplazar la función para actualizar updated_at
CREATE OR REPLACE FUNCTION update_applications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Eliminar trigger si existe y crearlo de nuevo
DROP TRIGGER IF EXISTS applications_updated_at ON applications;
CREATE TRIGGER applications_updated_at
  BEFORE UPDATE ON applications
  FOR EACH ROW
  EXECUTE FUNCTION update_applications_updated_at();

-- Verificar que se agregaron correctamente
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'applications'
AND column_name IN ('notes', 'updated_at')
ORDER BY column_name;
