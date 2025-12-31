-- Permitir a cualquiera (incluso anónimos) leer perfiles públicos de talentos
-- Esto es necesario para la galería pública /talentos

-- Primero, verificar si ya existe una política similar y eliminarla si existe
DROP POLICY IF EXISTS "Perfiles públicos de talentos son visibles para todos" ON profiles;

-- Crear política que permite a CUALQUIERA (anon + authenticated) leer perfiles públicos de talentos
CREATE POLICY "Perfiles públicos de talentos son visibles para todos"
ON profiles
FOR SELECT
TO public  -- Esto incluye tanto 'anon' como 'authenticated'
USING (
  role = 'talento'
  AND is_public_profile = true
  AND avatar_url IS NOT NULL
);

-- Comentario para documentación
COMMENT ON POLICY "Perfiles públicos de talentos son visibles para todos" ON profiles IS
'Permite a usuarios anónimos y autenticados ver perfiles públicos de talentos que tienen avatar. Necesario para la galería pública /talentos';
