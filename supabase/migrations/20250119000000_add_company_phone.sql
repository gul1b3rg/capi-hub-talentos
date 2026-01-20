-- Agregar campo de teléfono del responsable a la tabla companies
ALTER TABLE companies ADD COLUMN IF NOT EXISTS phone TEXT;

-- Comentario para documentación
COMMENT ON COLUMN companies.phone IS 'Teléfono del responsable corporativo de la empresa';
