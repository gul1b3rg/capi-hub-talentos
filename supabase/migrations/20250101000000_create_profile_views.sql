-- Crear tabla para trackear vistas de perfiles
CREATE TABLE IF NOT EXISTS profile_views (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  viewer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  viewed_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Función para extraer la fecha (immutable)
CREATE OR REPLACE FUNCTION get_view_date(ts TIMESTAMPTZ)
RETURNS DATE AS $$
  SELECT ts::DATE;
$$ LANGUAGE SQL IMMUTABLE;

-- Índice único: solo una vista por usuario por día
CREATE UNIQUE INDEX IF NOT EXISTS idx_profile_views_unique_per_day
  ON profile_views(profile_id, viewer_id, get_view_date(viewed_at));

-- Índices para mejorar performance de queries
CREATE INDEX IF NOT EXISTS idx_profile_views_profile_id ON profile_views(profile_id);
CREATE INDEX IF NOT EXISTS idx_profile_views_viewed_at ON profile_views(viewed_at);
CREATE INDEX IF NOT EXISTS idx_profile_views_viewer_id ON profile_views(viewer_id) WHERE viewer_id IS NOT NULL;

-- Comentarios para documentación
COMMENT ON TABLE profile_views IS 'Registro de vistas de perfiles de talentos para métricas y popularidad';
COMMENT ON COLUMN profile_views.profile_id IS 'ID del perfil que fue visto';
COMMENT ON COLUMN profile_views.viewer_id IS 'ID del usuario que vio el perfil (null si no está logueado)';
COMMENT ON COLUMN profile_views.viewed_at IS 'Timestamp de cuando se vio el perfil';

-- Vista materializada para cálculo eficiente de popularidad
CREATE MATERIALIZED VIEW IF NOT EXISTS talent_popularity AS
SELECT
  profile_id,
  COUNT(*) as total_views,
  COUNT(DISTINCT viewer_id) as unique_viewers,
  COUNT(CASE WHEN viewed_at > NOW() - INTERVAL '7 days' THEN 1 END) as views_last_week,
  COUNT(CASE WHEN viewed_at > NOW() - INTERVAL '30 days' THEN 1 END) as views_last_month
FROM profile_views
GROUP BY profile_id;

-- Índice único en la vista materializada para refresh concurrente
CREATE UNIQUE INDEX IF NOT EXISTS idx_talent_popularity_profile_id ON talent_popularity(profile_id);

-- Comentario
COMMENT ON MATERIALIZED VIEW talent_popularity IS 'Vista materializada con métricas de popularidad de talentos (refrescar periódicamente)';

-- Índice compuesto en profiles para queries de galería pública
CREATE INDEX IF NOT EXISTS idx_profiles_public_talents
ON profiles(role, is_public_profile, created_at DESC)
WHERE role = 'talento' AND is_public_profile = true AND avatar_url IS NOT NULL;

-- Políticas RLS para profile_views (permitir lectura/escritura pública)
ALTER TABLE profile_views ENABLE ROW LEVEL SECURITY;

-- Permitir a cualquiera (incluso anónimos) insertar vistas
CREATE POLICY "Cualquiera puede registrar una vista de perfil"
  ON profile_views
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Permitir a cualquiera leer las vistas (para mostrar contadores)
CREATE POLICY "Cualquiera puede ver las vistas de perfiles"
  ON profile_views
  FOR SELECT
  TO public
  USING (true);

-- Nota: La vista materializada debe refrescarse periódicamente
-- Se puede hacer manualmente con: REFRESH MATERIALIZED VIEW CONCURRENTLY talent_popularity;
-- O configurar un cron job en Supabase para hacerlo cada hora
