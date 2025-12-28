-- ============================================
-- RLS Policy: Permitir que empresas vean perfiles de postulantes
-- ============================================

-- Esta política permite que las empresas vean los perfiles públicos de talentos
-- que se han postulado a sus vacancias.

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

-- Verificar que la política se creó correctamente
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'profiles'
  AND policyname = 'Empresas pueden ver perfiles de postulantes';
