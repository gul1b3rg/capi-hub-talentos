-- Políticas RLS para que usuarios puedan acceder a su propio perfil
-- CRÍTICO: Sin esta política, los usuarios no pueden leer/editar su perfil

-- =====================================================
-- POLICY 1: Usuarios pueden leer su propio perfil
-- =====================================================
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;

CREATE POLICY "Users can read own profile"
ON profiles
FOR SELECT
TO authenticated
USING (id = auth.uid());

-- =====================================================
-- POLICY 2: Usuarios pueden actualizar su propio perfil
-- =====================================================
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

CREATE POLICY "Users can update own profile"
ON profiles
FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- =====================================================
-- POLICY 3: Usuarios pueden insertar su propio perfil
-- =====================================================
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

CREATE POLICY "Users can insert own profile"
ON profiles
FOR INSERT
TO authenticated
WITH CHECK (id = auth.uid());

-- =====================================================
-- Documentación
-- =====================================================
COMMENT ON POLICY "Users can read own profile" ON profiles IS
'Permite a usuarios autenticados leer su propio perfil independientemente de is_public_profile';

COMMENT ON POLICY "Users can update own profile" ON profiles IS
'Permite a usuarios autenticados actualizar solo su propio perfil';

COMMENT ON POLICY "Users can insert own profile" ON profiles IS
'Permite a usuarios autenticados crear su propio perfil durante el registro';
