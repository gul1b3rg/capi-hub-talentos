-- ============================================
-- FIX: Actualizar constraint de status en applications
-- ============================================

-- PASO 1: Eliminar el constraint existente
ALTER TABLE applications DROP CONSTRAINT IF EXISTS applications_status_check;

-- PASO 2: Crear el constraint correcto con los estados que usamos en el código
ALTER TABLE applications ADD CONSTRAINT applications_status_check
  CHECK (status IN ('Recibida', 'En revisión', 'Entrevista agendada', 'Aceptada', 'Rechazada'));

-- PASO 3: Verificar que el constraint se aplicó correctamente
SELECT
  conname AS constraint_name,
  pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'applications'::regclass
  AND contype = 'c';
