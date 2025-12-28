-- 1. Verificar si existe el perfil del usuario recién creado
SELECT * FROM profiles WHERE id = '112dd918-9501-4753-931f-25933655f36f';

-- 2. Ver todas las políticas RLS en la tabla profiles
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

-- 3. Verificar si RLS está habilitado en la tabla profiles
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables
WHERE tablename = 'profiles';

-- 4. Ver estructura de la tabla profiles
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'profiles'
ORDER BY ordinal_position;
