-- ============================================
-- SPRINT 1: CONFIGURACIÓN DE TABLA APPLICATIONS
-- Sistema de Postulaciones - Talentos Hub
-- ============================================

-- PASO 1: Crear tabla applications (si no existe)
CREATE TABLE IF NOT EXISTS applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  talent_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'Recibida'
    CHECK (status IN ('Recibida', 'En revisión', 'Entrevista agendada', 'Aceptada', 'Rechazada')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Constraint para evitar postulaciones duplicadas
  UNIQUE(job_id, talent_id)
);

-- PASO 2: Crear índices para optimización de queries
CREATE INDEX IF NOT EXISTS idx_applications_job_id ON applications(job_id);
CREATE INDEX IF NOT EXISTS idx_applications_talent_id ON applications(talent_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
CREATE INDEX IF NOT EXISTS idx_applications_created_at ON applications(created_at DESC);

-- PASO 3: Crear función y trigger para updated_at automático
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

-- PASO 4: Habilitar Row Level Security
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

-- PASO 5: Eliminar políticas existentes (si existen) para evitar conflictos
DROP POLICY IF EXISTS "Talentos pueden ver sus postulaciones" ON applications;
DROP POLICY IF EXISTS "Talentos pueden crear postulaciones" ON applications;
DROP POLICY IF EXISTS "Empresas pueden ver postulaciones de sus vacancias" ON applications;
DROP POLICY IF EXISTS "Empresas pueden actualizar postulaciones" ON applications;

-- PASO 6: Crear políticas RLS

-- POLÍTICA 1: Los talentos pueden leer sus propias postulaciones
CREATE POLICY "Talentos pueden ver sus postulaciones"
  ON applications
  FOR SELECT
  USING (auth.uid() = talent_id);

-- POLÍTICA 2: Los talentos pueden crear postulaciones
CREATE POLICY "Talentos pueden crear postulaciones"
  ON applications
  FOR INSERT
  WITH CHECK (auth.uid() = talent_id);

-- POLÍTICA 3: Las empresas pueden leer postulaciones de sus vacancias
CREATE POLICY "Empresas pueden ver postulaciones de sus vacancias"
  ON applications
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM jobs
      INNER JOIN companies ON jobs.company_id = companies.id
      WHERE jobs.id = applications.job_id
        AND companies.owner_id = auth.uid()
    )
  );

-- POLÍTICA 4: Las empresas pueden actualizar status/notas de sus postulaciones
CREATE POLICY "Empresas pueden actualizar postulaciones"
  ON applications
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM jobs
      INNER JOIN companies ON jobs.company_id = companies.id
      WHERE jobs.id = applications.job_id
        AND companies.owner_id = auth.uid()
    )
  );

-- ============================================
-- VERIFICACIÓN (opcional - comentar si causa problemas)
-- ============================================

-- Verificar que la tabla se creó correctamente
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'applications'
ORDER BY ordinal_position;

-- Verificar índices creados
SELECT
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'applications';

-- Verificar políticas RLS
SELECT
  policyname,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'applications';
