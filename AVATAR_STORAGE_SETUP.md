# Configuración del Bucket `talent-avatars` en Supabase

## Problema
Al intentar subir avatares, obtienes el error: `new row violates row-level security policy`

## Solución

Necesitas configurar las políticas de seguridad (RLS) del bucket `talent-avatars` en el **Dashboard de Supabase**.

### Pasos:

1. **Ve a Storage** en tu dashboard de Supabase
2. **Selecciona el bucket** `talent-avatars`
3. **Ve a la pestaña "Policies"**
4. **Crea las siguientes políticas:**

#### Política 1: INSERT (Subir avatares)
- **Nombre**: `Usuarios pueden subir sus propios avatares`
- **Operación**: `INSERT`
- **Target roles**: `authenticated`
- **USING expression**: (dejar vacío)
- **WITH CHECK expression**:
```sql
(bucket_id = 'talent-avatars'::text)
AND ((storage.foldername(name))[1] = 'avatars'::text)
AND (auth.uid()::text = (regexp_match(name, 'avatars/([a-f0-9-]+)-'::text))[1])
```

#### Política 2: SELECT (Ver avatares públicamente)
- **Nombre**: `Avatares son públicamente visibles`
- **Operación**: `SELECT`
- **Target roles**: `public` (o `anon, authenticated`)
- **USING expression**:
```sql
bucket_id = 'talent-avatars'::text
```
- **WITH CHECK expression**: (dejar vacío)

#### Política 3: UPDATE (Actualizar avatares)
- **Nombre**: `Usuarios pueden actualizar sus propios avatares`
- **Operación**: `UPDATE`
- **Target roles**: `authenticated`
- **USING expression**:
```sql
(bucket_id = 'talent-avatars'::text)
AND (auth.uid()::text = (regexp_match(name, 'avatars/([a-f0-9-]+)-'::text))[1])
```
- **WITH CHECK expression**: (mismo que USING)
```sql
(bucket_id = 'talent-avatars'::text)
AND (auth.uid()::text = (regexp_match(name, 'avatars/([a-f0-9-]+)-'::text))[1])
```

#### Política 4: DELETE (Eliminar avatares)
- **Nombre**: `Usuarios pueden eliminar sus propios avatares`
- **Operación**: `DELETE`
- **Target roles**: `authenticated`
- **USING expression**:
```sql
(bucket_id = 'talent-avatars'::text)
AND (auth.uid()::text = (regexp_match(name, 'avatars/([a-f0-9-]+)-'::text))[1])
```
- **WITH CHECK expression**: (dejar vacío)

---

## Explicación

Estas políticas permiten:

1. **INSERT**: Usuarios autenticados pueden subir archivos SOLO si:
   - El archivo está en `talent-avatars/avatars/`
   - El nombre del archivo contiene su propio `userId` (formato: `avatars/{userId}-{timestamp}.webp`)

2. **SELECT**: Cualquiera (incluso usuarios no autenticados) puede ver los avatares públicos

3. **UPDATE**: Usuarios solo pueden actualizar sus propios avatares (basado en userId en el nombre del archivo)

4. **DELETE**: Usuarios solo pueden eliminar sus propios avatares

---

## Alternativa: Hacer el bucket público (menos seguro)

Si quieres una solución más simple (pero menos segura), puedes:

1. Ir a Storage → `talent-avatars` → Settings
2. Marcar el bucket como **"Public bucket"**
3. Esto eliminará las restricciones de RLS pero permitirá que cualquiera suba archivos

**⚠️ NO RECOMENDADO para producción** - Mejor usar las políticas detalladas arriba.

---

## Verificación

Después de configurar las políticas, intenta subir una foto nuevamente. Debería funcionar sin errores.

Si sigues teniendo problemas, revisa los logs de Supabase en la pestaña "Logs" para ver exactamente qué política está fallando.
