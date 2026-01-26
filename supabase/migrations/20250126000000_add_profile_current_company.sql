-- Agregar campo de empresa actual al perfil de talentos
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS current_company TEXT;

-- Comentario para documentación
COMMENT ON COLUMN profiles.current_company IS 'Empresa o compañía donde trabaja actualmente el talento (opcional)';
