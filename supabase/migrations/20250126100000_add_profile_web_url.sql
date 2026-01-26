-- Agregar campo web_url para link personal (portfolio, sitio web, etc.)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS web_url TEXT;

COMMENT ON COLUMN profiles.web_url IS 'URL del sitio web personal, portfolio o link relevante del talento';
